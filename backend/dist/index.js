import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { RoomManager } from './roomManager.js';
import * as Y from 'yjs';
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Collaborative Code Editor Running');
    }
});
const wss = new WebSocketServer({ server });
const roomManager = new RoomManager();
wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        try {
            const parsed = JSON.parse(data.toString());
            const { userName, type, fileName, fileExtension, update } = parsed;
            if (!userName)
                return;
            console.log("User Given File :- " + fileName + fileExtension);
            let room = roomManager.getRoom(userName);
            if (!room)
                room = roomManager.addRoom(userName, ws, fileName || 'main', fileExtension || '.js');
            else
                roomManager.addUser(userName, ws);
            switch (type) {
                case 'init':
                    const doc = roomManager.getFileData(userName);
                    const encoded = (doc === null || doc === void 0 ? void 0 : doc.document) ? Y.encodeStateAsUpdate(doc.document) : [];
                    console.log("Server Given File :- " + (doc === null || doc === void 0 ? void 0 : doc.file) + (doc === null || doc === void 0 ? void 0 : doc.extension));
                    ws.send(JSON.stringify({ type: 'init', file: doc === null || doc === void 0 ? void 0 : doc.file, extension: doc === null || doc === void 0 ? void 0 : doc.extension, update: Array.from(encoded) }));
                    break;
                case 'update':
                    const updateBuf = new Uint8Array(update);
                    const updatedDoc = roomManager.updateFile(userName, updateBuf);
                    room === null || room === void 0 ? void 0 : room.users.forEach((user) => {
                        if (user !== ws && user.readyState === WebSocket.OPEN) {
                            user.send(JSON.stringify({ type: 'update', update }));
                        }
                    });
                    break;
                default:
                    ws.send(JSON.stringify({ type: 'error', message: 'Unknown type' }));
            }
        }
        catch (err) {
            console.error(err);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    });
    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to server' }));
});
server.listen(8080, () => {
    console.log('Server listening on http://localhost:8080');
});
