
const RoomDto = require("../dtos/room-dto");
const { createRoomService, getAllRooms, getRoom } = require("../services/room-service");


const create=async(req,res,next)=>{

    const {topic,roomType}=req.body;
    if(!topic || !roomType){
        return res.status(400).json({message:"All fields are reaquired"});
    }
    
    //create the room
    const room =await createRoomService({topic,roomType,ownerId:req.user._id});
    //To send only the necessary information to the client we are using the RoomDto 
    return res.json(new RoomDto(room));
}

const index=async(req,res,next)=>{
    const rooms=await getAllRooms(['open','private']);
    //Formatting all the rooms to the client side
    const allRooms = rooms.map(room=>new RoomDto(room))
    return res.json(allRooms);
}
const show=async(req,res,next)=>{
    const room=await getRoom(req.params.roomId);
    return res.status(200).json(room);
}

module.exports={
    create,
    index,
    show
}