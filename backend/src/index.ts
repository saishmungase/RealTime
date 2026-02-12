import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { RoomManager } from './roomManager.js';
import * as Y from 'yjs';
import countRooms, { totalRooms } from './count.js';

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  const roomCount = await totalRooms();
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count: roomCount }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Collaborative Code Editor Running');
  }
});

const wss = new WebSocketServer({ server });
const roomManager = new RoomManager();

wss.on('connection', (ws: WebSocket) => {
  let userRoom: string | null = null;

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      const { userName, type, fileName, fileExtension, update } = parsed;

      if (!userName) return;
      
      userRoom = userName;
      console.log(`Message from ${userName}: ${type}`);
      
      let room = roomManager.getRoom(userName);
      if (!room) {
        console.log(`Creating new room: ${userName} with file ${fileName}${fileExtension}`);
        room = roomManager.addRoom(userName, ws, fileName || 'main', fileExtension || '.js');
      } else if (!room.users.includes(ws)) {
        console.log(`User joining existing room: ${userName}`);
        roomManager.addUser(userName, ws);
      }

      switch (type) {
        case 'init':
          (async () => {
            await countRooms(); 
          })();
          
          const doc = roomManager.getFileData(userName);
          const encoded = doc?.document ? Y.encodeStateAsUpdate(doc.document) : [];
          console.log(`Sending init to user. File: ${doc?.file}${doc?.extension}, update size: ${encoded.length}`);
          
          ws.send(JSON.stringify({ 
            type: 'init', 
            file: doc?.file, 
            extension: doc?.extension, 
            update: Array.from(encoded) 
          }));
          break;
        
        case 'update':
          if (!update || !Array.isArray(update)) {
            console.error('Invalid update received');
            return;
          }

          const updateBuf = new Uint8Array(update);
          console.log(`Applying update from ${userName}, size: ${updateBuf.length}`);
          
          roomManager.updateFile(userName, updateBuf);

          room?.users.forEach((user) => {
            if (user !== ws && user.readyState === WebSocket.OPEN) {
              user.send(JSON.stringify({ type: 'update', update }));
            }
          });
          break;

        case 'awareness':
          room?.users.forEach((user) => {
            if (user !== ws && user.readyState === WebSocket.OPEN) {
              user.send(JSON.stringify({ type: 'awareness', update }));
            }
          });
          break;

        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown type' }));
      }
    } catch (err) {
      console.error('Error processing message:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    if (userRoom) {
      console.log(`User disconnected from room: ${userRoom}`);
      roomManager.removeUser(userRoom, ws);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to server' }));
});

server.listen(8080, () => {
  console.log('Server listening on http://localhost:8080');
});