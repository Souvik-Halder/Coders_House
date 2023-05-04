
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
app.use(function(req, res, next) {
res.setHeader('Access-Control-Allow-Origin', true);

  next();
});
app.use(cookieParser());

    
//Cors middlware
const corsOption={
    origin:['http://localhost:3000','https://coder-house-app.onrender.com'],
    withCredentials:true,
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


// //Sockets

// const socketUserMapping=[]

// io.on('connection',(socket)=>{
//     console.log('new Connection',socket.id)

//     //Listening the join event from frontend to backend by websocket here we listening the event made by frontend named as join
//     socket.on(ACTIONS.JOIN,({roomId,user})=>{
//         socketUserMapping[socket.id]=user;
//             //this is the map to get the rooms from the soc
//     const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

//     clients.forEach(clientId=>{
//         //to add peer to peer connection
//     //when there is already client present in the room so in that case we need to emit the event for the every client

//     //The user we will get from the join action when the user wants to join
//     //here it is defined that they don't need to create the offer because the offer will be created by the user who wants to join
//         io.to(clientId).emit(ACTIONS.ADD_PEER,{
//             peerId:socket.id,
//             createOffer:false,
//             user
//         });
//         socket.emit(ACTIONS.ADD_PEER,{
//             peerId:clientId,
//             createOffer:true,
//             user:socketUserMapping[clientId]
//         });
//         //To join the room for the new client
//         socket.join(roomId);
//     })

 

//     });

//     //Handle relay ice
//     socket.on(ACTIONS.RELAY_ICE,({peerId,icecandidate})=>{
//         //sending the peerId to the next client
//         io.to(peerId).emit(ACTIONS.ICE_CANDIDATE,{
//             peerId: socket.id,
//             icecandidate
//         })
//     });

//     //Handle relay sdp(Session Description)
//     socket.on(ACTIONS.RELAY_SDP,({peerId,sessionDescription})=>{
//         io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION,{
//             peerId:socket.id,
//             sessionDescription
//         })
//     })

//     // Leaving the room
//     const leaveRoom=({roomId})=>{
//         //getting all the rooms
//         //when clients wants to leave  the room we simply remove the client from all of the room
//         const {rooms}=socket;

//         Array.from(rooms).forEach(roomId=>{
//             const clients=Array.from(io.sockets.adapter.rooms.get(roomId)|| []);
//             //sending the remove peer to all the clients
//             clients.forEach(clientId=>{
//                 //clientId is basically the socket ID of the client
//                 io.to(clientId).emit(ACTIONS.REMOVE_PEER,{
//                     peerId:socket.id,
//                     userId:socketUserMapping[socket.id]?.id,
//                 });
//                 //here the socketUserMapping[socket.id] gives the user so to get the userId we need to do socketUserMapping[socket.id].id
//                 //here the below code says that whenever we are sending to the all clients that remove me then we need to also remove that client form my screen alos
//                 //look that is a two process as the newclient remove you from the screen you need to remove him/her from your screen also
//                 socket.emit(ACTIONS.REMOVE_PEER,{
//                     peerId:clientId,
//                     userId:socketUserMapping[clientId]?.id
//                     //so here the upper code we need to put the client id because we are removing them from our screen to remove them we need their id
//                 });
//             });
//             socket.leave(roomId);
//         });
//         //Remove the user from the socketUserMapping 
//         //as here socket.id is the userId
//         delete socketUserMapping[socket.id];
//     };
//     socket.on(ACTIONS.LEAVE,leaveRoom);

// })



// server.listen(PORT,()=>{
//     console.log(`Server Listening on port ${PORT}`)
// })


//coders gyan code
// Sockets
const socketUserMap = {};

io.on('connection', (socket) => {
    console.log('New connection', socket.id);
    socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
        socketUserMap[socket.id] = user;

        // console.log('Map', socketUserMap);

        // get all the clients from io adapter
        // console.log('joining');
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        // console.log('All connected clients', clients, io.sockets.adapter.rooms);
        // Add peers and offers and all

        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
                user,
            });

            // Send myself as well that much msgs how many clients

            socket.emit(ACTIONS.ADD_PEER, {
                peerId: clientId,
                createOffer: true,
                user: socketUserMap[clientId],
            });
        });

        // Join the room
        socket.join(roomId);
    });

    // Handle Relay Ice event
    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate,
        });
    });

    // Handle Relay SDP
    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription,
        });
    });

    //Handle the mute/unmute
    socket.on(ACTIONS.MUTE,({roomId,userId})=>{
        console.log("mute",userId)
        const clients=Array.from(io.sockets.adapter.rooms.get(roomId)||[]);
        clients.forEach(clientId=>{
            io.to(clientId).emit(ACTIONS.MUTE,{
                peerId:socket.id,
                userId,
            })
        })
    })

    socket.on(ACTIONS.UN_MUTE,({roomId,userId})=>{
        console.log("unmute",userId)
        const clients=Array.from(io.sockets.adapter.rooms.get(roomId)||[]);
        clients.forEach(clientId=>{
            io.to(clientId).emit(ACTIONS.UN_MUTE,{
                peerId:socket.id,
                userId,
            })
        })
    })



    //Leaving the room
    const leaveRoom = () => {
        const { rooms } = socket;
        console.log('leaving', rooms);
        // console.log('socketUserMap', socketUserMap);
        Array.from(rooms).forEach((roomId) => {
            const clients = Array.from(
                io.sockets.adapter.rooms.get(roomId) || []
            );
            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id,
                    userId: socketUserMap[socket.id]?.id,
                });

                socket.emit(ACTIONS.REMOVE_PEER, {
                    peerId: clientId,
                    userId: socketUserMap[clientId]?.id,
                });

                socket.leave(roomId);
            });
        });

        delete socketUserMap[socket.id];

        // console.log('map', socketUserMap);
    };

    socket.on(ACTIONS.LEAVE, leaveRoom);

    socket.on('disconnecting', leaveRoom);
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));


