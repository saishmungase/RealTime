import { Room } from "./room.js";
export class RoomManager {
    constructor() {
        this.Rooms = new Map();
    }
    addRoom(userName, user, name, extension) {
        let room = new Room(user, name, extension);
        this.Rooms.set(userName, room);
        return room;
    }
    addUser(userName, user) {
        const room = this.getRoom(userName);
        if (room)
            return room.addUser(user);
        return null;
    }
    removeUser(userName, user) {
        const room = this.getRoom(userName);
        if (room)
            room.removeUser(user);
    }
    updateFile(userName, data) {
        const room = this.getRoom(userName);
        if (room)
            return room.addDataToFile(data);
        return null;
    }
    getFileData(userName) {
        const room = this.getRoom(userName);
        if (room)
            return room.getRoomFileData();
        return null;
    }
    getRoom(userName) {
        return this.Rooms.get(userName);
    }
}
