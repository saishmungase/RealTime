var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const countRooms = () => __awaiter(void 0, void 0, void 0, function* () {
    const id = process.env.USER_ID;
    try {
        const user = yield prisma.roomCount.findUnique({
            where: { id }
        });
        if (!user) {
            console.log("User Does Not Exist !");
            return;
        }
        console.log(user);
        let score = user.rooms + 1;
        console.log(score);
        yield prisma.roomCount.update({
            where: {
                id: user.id
            },
            data: {
                rooms: score
            }
        });
    }
    catch (e) {
        console.log("Server Error !");
    }
});
export default countRooms;
