import { Room } from "./room.js";
import { WebSocket } from 'ws';

export class RoomManager {
    private Rooms: Map<string, Room>

    constructor() {
        this.Rooms = new Map<string, Room>()
    }

    addRoom(userName: string, user: WebSocket, name: string, extension: string) {
        let room = new Room(user, name, extension);
        this.Rooms.set(userName, room);
        return room;
    }

    addUser(userName: string, user: WebSocket) {
        const room = this.getRoom(userName);
        if (room) return room.addUser(user);
        return null;
    }

    removeUser(userName: string, user: WebSocket) {
        const room = this.getRoom(userName);
        if (room) {
            room.removeUser(user);
            if (room.users.length === 0) {
                this.Rooms.delete(userName);
                console.log(`Room ${userName} is empty and has been removed`);
            }
        }
    }

    updateFile(userName: string, data: Uint8Array) {
        const room = this.getRoom(userName);
        if (room) return room.addDataToFile(data);
        return null;
    }

    getFileData(userName: string) {
        const room = this.getRoom(userName);
        if (room) return room.getRoomFileData();
        return null;
    }

    getRoom(userName: string) {
        return this.Rooms.get(userName);
    }
}