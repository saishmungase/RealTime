import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { RoomManager } from './roomManager.js';
import * as Y from 'yjs';
import countRooms from './count.js';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Collaborative Code Editor Running');
  }
});

const wss = new WebSocketServer({ server });
const roomManager = new RoomManager();

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      const { userName, type, fileName, fileExtension, update } = parsed;

      if (!userName) return;
      console.log("User Given File :- " + fileName+fileExtension);
      let room = roomManager.getRoom(userName);
      if (!room) room = roomManager.addRoom(userName, ws, fileName || 'main', fileExtension || '.js');
      else roomManager.addUser(userName, ws);

      switch (type) {
        
        case 'init':
          (async () => {
            await countRooms(); 
          })();
          const doc = roomManager.getFileData(userName);
          const encoded = doc?.document ? Y.encodeStateAsUpdate(doc.document) : [];
          console.log("Server Given File :- " + doc?.file + doc?.extension);
          ws.send(JSON.stringify({ type: 'init', file : doc?.file, extension : doc?.extension, update: Array.from(encoded) }));
          break;
        
        case 'update':
          const updateBuf = new Uint8Array(update as ArrayBuffer);
          const updatedDoc = roomManager.updateFile(userName, updateBuf);

          room?.users.forEach((user) => {
            if (user !== ws && user.readyState === WebSocket.OPEN) {
              user.send(JSON.stringify({ type: 'update', update }));
            }
          });
          break;

        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown type' }));
      }
    } catch (err) {
      console.error(err);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to server' }));
});

server.listen(8080, () => {
  console.log('Server listening on http://localhost:8080');
});


























