
//Dotenv configuration
require('dotenv').config();
const PORT=process.env.PORT||5500;
const express=require('express');
const app=express();
const routes=require('./routes');
const DbConnect=require('./database')
const cors=require('cors')
const cookieParser=require('cookie-parser');
const ACTIONS = require('./actions');


const server=require('http').createServer(app);

const io=require('socket.io')(server,{
    cors:{
        origin:'http://localhost:3000',
        methods:['GET','POST']
    }
});


//To get the json data at server Json Middleware
app.use(express.json({limit:'8mb'}))
app.use(cookieParser());

    
//Cors middlware
const corsOption={
    origin:['http://localhost:3000'],
    credentials:true,
}
app.use(cors(corsOption))
//To make the storage folder static so that we can easily see the images by the url
app.use('/storage',express.static('storage'))
//Data Base connection
DbConnect();
app.get('/',(req,res)=>{
res.send("Hello from Express js")
})

app.use('/api/',routes);


//Sockets

const socketUserMapping={

}

io.on('connection',(socket)=>{
    console.log('new Connection',socket.id)

    //Listening the join event from frontend to backend by websocket here we listening the event made by frontend named as join
    socket.on(ACTIONS.JOIN,({roomId,user})=>{
        socketUserMapping[socket.id]=user;
            //this is the map to get the rooms from the soc
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

    clients.forEach(clientId=>{
        //to add peer to peer connection
    //when there is already client present in the room so in that case we need to emit the event for the every client

        io.to(clientId).emit(ACTIONS.ADD_PEER,{});
    })

    socket.emit(ACTIONS.ADD_PEER,{});
    //To join the room for the new client
    socket.join(roomId);

    });

})


server.listen(PORT,()=>{
    console.log(`Server Listening on port ${PORT}`)
})


