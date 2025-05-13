import * as Y from 'yjs';
export class Files {
    constructor(name, extension) {
        this.name = name;
        this.extension = extension;
        this.document = new Y.Doc();
    }
    addData(data) {
        Y.applyUpdate(this.document, data);
        return {
            name: this.name,
            extension: this.extension,
            document: this.document
        };
    }
    getFileData() {
        return {
            name: this.name,
            extension: this.extension,
            document: this.document
        };
    }
    updateRoomFileData(name, extension) {
        if (name) {
            this.name = name;
        }
        if (extension) {
            this.extension = extension;
        }
        return {
            newName: this.name,
            newExtension: this.extension
        };
    }
}
export class Room {
    constructor(creator, name, extension) {
        this.files = new Files(name, extension);
        this.users = [];
        this.users.push(creator);
    }
    addUser(user) {
        this.users.push(user);
        return this.files;
    }
    removeUser(user) {
        this.users = this.users.filter(u => u !== user);
    }
    addDataToFile(data) {
        const file = this.files;
        if (file) {
            Y.applyUpdate(file.document, data);
            return file.getFileData();
        }
        return null;
    }
    getRoomFileData() {
        return { document: this.files.document, file: this.files.name, extension: this.files.extension };
    }
    updateRoomFileData(name, extension) {
        this.files.updateRoomFileData(name, extension);
    }
}
