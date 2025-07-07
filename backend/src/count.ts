import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const countRooms = async () => {

    const id = process.env.USER_ID;

    try{
        const user = await prisma.roomCount.findUnique({
            where: { id }
        });

        if (!user) {
            console.log("User Does Not Exist !")
            return;
        }
        
        console.log(user)

        let score = user.rooms + 1;
        console.log(score)

        await prisma.roomCount.update({
            where : {
                id : user.id
            },
            data : {
                rooms : score
            }
        })
    }
    catch(e){
        console.log("Server Error !")
    }

}

export const totalRooms = async () => {
    const id = process.env.USER_ID;

    try{
        const user = await prisma.roomCount.findUnique({
            where: { id }
        });

        return user?.rooms;
    }
    catch(e){
        console.log("Error !")
    }

}


export default countRooms;