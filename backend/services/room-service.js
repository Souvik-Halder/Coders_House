const RoomModel = require("../models/room-model");


const createRoomService =async (payload)=>{
    const {topic,roomType,ownerId}=payload;
    //here we are just creating the room and storing the details in the database
    const room =await RoomModel.create({
        topic, roomType,ownerId,speakers:[ownerId]
    })
    return room;
}

const getAllRooms=async(types)=>{
    const rooms=await RoomModel.find({roomType:{$in:types}}).populate('ownerId').populate('speakers').exec();
    return rooms;
}
const getRoom=async(roomId)=>{
    const room=await RoomModel.findOne({_id:roomId});
    return room;
}
module.exports={
    createRoomService,
    getAllRooms,
    getRoom
}