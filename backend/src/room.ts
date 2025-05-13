import { WebSocket } from 'ws';
import * as Y from 'yjs'

export class Files {
    public name: string
    public extension: string
    public document: Y.Doc

    constructor(name: string, extension: string) {
        this.name = name
        this.extension = extension
        this.document = new Y.Doc();
    }

    addData(data: Uint8Array) {
        Y.applyUpdate(this.document, data);
        return {
            name: this.name,
            extension: this.extension,
            document: this.document
        }
    }

    getFileData() {
        return {
            name: this.name,
            extension: this.extension,
            document: this.document
        }
    }

    updateRoomFileData(name?:string, extension?:string){
        if(name){
            this.name = name;
        }
        if(extension){
            this.extension = extension;
        }
        return{
            newName : this.name,
            newExtension : this.extension
        };
    }

}

export class Room {
    public users: WebSocket[];
    public files: Files;

    constructor(creator: WebSocket, name : string, extension : string) {
        this.files = new Files(name, extension);
        this.users = [];
        this.users.push(creator);
    }

    addUser(user: WebSocket) {
        this.users.push(user);
        return this.files;
    }

    removeUser(user: WebSocket) {
        this.users = this.users.filter(u => u !== user);
    }

    addDataToFile(data: Uint8Array) {
        const file = this.files
        if(file) {
            Y.applyUpdate(file.document, data);
            
            return file.getFileData();
        }
        return null;
    }

    getRoomFileData() {
        return {document : this.files.document, file : this.files.name, extension : this.files.extension}; 
    }

    updateRoomFileData(name?:string, extension?:string){
        this.files.updateRoomFileData(name, extension);
    }
}