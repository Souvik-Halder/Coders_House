// import { useCallback, useEffect, useRef, useState } from "react";
// import { useStateWithCallBack } from "./useStateWithCallback";
// import {socketInit} from '../socket/index'
// import { ACTIONS } from "../actions";
// import freeice from 'freeice'
// //This hook is for the webRTC code



// export const useWebRTC = (roomId, user) => {
    
//   const [clients, setClients] = useStateWithCallBack([]);
//   //SO to fulfuill our purpose here we got the callback function after creating the hook so that we can perform certain task after adding the clients
//   const audioElements = useRef({});
//   const connections = useRef({});
//   const localMediaStream = useRef(null);
//   const socket=useRef(null)


//   useEffect(() => {
//     socket.current=socketInit();
//     console.log(socket.current)
    
//   }, []);


//   const provideRef = (instance, userId) => {
//     //here userId is the key and it's value is the instance
//     audioElements.current[userId] = instance;
//     //here the every user is assigned with it's own audio player so any volume up down or mute can be performed on the userSpecific audio player independent to other
//   };
//   //method to add new client
//   const addNewClient = useCallback(
//     (newClient, cb) => {
//       const lookingFor = clients.find((client) => client.id === newClient.id);
    
//       if (lookingFor === undefined) {

//         //here the setclient we created as a custom hook which takes the second parameter as a callback function so providing the two parameters here
        
//         setClients((existingClients) => [...existingClients, newClient], cb);
  
//       }
//     },
//     [clients, setClients]
//   );

//   // Capture the audio or mike of the computer
//   useEffect(() => {
//     const startCapture = async () => {
//       // Use the media of the local device
//       localMediaStream.current = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       });
//     };
//     startCapture().then(() => {
//         addNewClient(user,()=>{
//             //getting the audio element
//             const localElement=audioElements.current[user.id];
//             if(localElement){
//                 //if we don't make it zero then we can hear the voice by ourselves
//                 localElement.volume=0
//                 localElement.srcObject=localMediaStream.current;
//             }
//             //socket emit JOIN socket IO
//             //sending the roomId and user to the backend from frontend
//             socket.current.emit(ACTIONS.JOIN,{roomId,user});
            

//         })
//     });

//     //cleaning function
//     return()=>{
//       //Leaving the room
//       if(localMediaStream.current){
//       localMediaStream.current.getTracks().forEach(track=>track.stop());

//       socket.current.emit(ACTIONS.LEAVE,{roomId})
//       }
//     }

//   }, []);



//   //use Effect for add peer
//   useEffect(()=>{
//     //here peerId means the socket Id
//     const handleNewPeer =async({peerId,createOffer,user:remoteUser})=>{
//       //if already connected then give warning
//       //checking that the peerId is presenet in the connection or not connections is the object which key is the socketId
//       if(peerId in connections.current){
//         //if the peerId is present in the connections.current that means the user is already connected 
//         //so in that case we need to just return it with a warning and no need to connect again
//         return console.warn(`You are already connected with ${peerId} (${user.name})`)
//       }
//       //iceServers tells about the public id of the local computer so that any other computer can connect it so here we are using free iceserver which is freeice so by the below code connection is created by webRTC
//       connections.current[peerId]=new RTCPeerConnection({
//         iceServers:freeice
//       })

//       //Handle new ice candidate
//       connections.current[peerId].onicecandidate =(event)=>{
//         socket.current.emit(ACTIONS.RELAY_ICE,{
//           peerId,
//           icecandidate:event.candidate
//         })
//       }

//       //handle on track on this connection
//       connections.current[peerId].ontrack=({
//         streams:[remoteStream]
//       }) =>{
//         addNewClient(remoteUser,()=>{
//           if(audioElements.current[remoteUser.id]){
//             audioElements.current[remoteUser.id].srcObject =remoteStream
//           }else{
//             let settled=false;
//             const interval=setInterval(()=>{
//               if(audioElements.current[remoteUser.id]){
//                 audioElements.current[remoteUser.id].srcObject =remoteStream;
//                 settled=true;
//               }
//               if(settled){
//                 clearInterval(interval);
//               }
//             },1000)
//           }
//         })
//       };

//       //Add local track to remote connection here we are adding to localtrack to the remote
//       localMediaStream.current.getTracks().forEach(track => {
//         connections.current[peerId].addTrack(track,localMediaStream.current)
//       });

//       //Creating the offer
//       if(createOffer){
//         const offer=await connections.current[peerId].createOffer();
//         await connections.current[peerId].setLocalDescription(offer);
        
//         //send offer to another client
//         //here SDP means session description
//         socket.current.emit(ACTIONS.RELAY_SDP,{
//           peerId,
//           sessionDescription:offer
//         });
//       }

//     }


//     socket.current.on(ACTIONS.ADD_PEER,handleNewPeer);

//     //cleaning function
//     return ()=>{
//       socket.current.off(ACTIONS.ADD_PEER)
//     }


//   },[])

//   //Handle Ice Candidate
//   useEffect(()=>{
//     socket.current.on(ACTIONS.ICE_CANDIDATE,({peerId,icecandidate})=>{
//       if(icecandidate){
//       connections.current[peerId].addCandidate(icecandidate);
//       }
//     })

// //Unsubscribing the event before leaving the componentqq1
//     return ()=>{
//       socket.current.off(ACTIONS.ICE_CANDIDATE);
//     }
//   },[])



//   //Handle SDP(Session Description)
//   useEffect(()=>{
//     const handleRemoteSdp=async({peerId,sessionDescription:remoteSessionDescription})=>{
//       connections.current[peerId].setRemoteDescription(
//         new RTCSessionDescription(remoteSessionDescription)
//       )
      
//       // if session description is type of offer create an answer

//       if(remoteSessionDescription.type==='offer'){
//         //get the connection and on that connection create the answer
//         const connection=connections.current[peerId];
//         const answer=await connection.createAnswer();

//         //after creating the answer we need to set it to the local description
//         connection.setLocalDescription(answer);

//         //sending the answer as the session description
//         socket.current.emit(ACTIONS.RELAY_SDP,{
//           peerId,
//           sessionDescription:answer
//         })

//       }
//     }
//     socket.current.on(ACTIONS.SESSION_DESCRIPTION,handleRemoteSdp)

//     //Cleaning function
//     return ()=>{
//       socket.current.off(ACTIONS.SESSION_DESCRIPTION)
//     }
//   },[])


//   //Handle Remove peer
//   useEffect(()=>{
//     const handleRemovePeer=async({peerId,userId})=>{
//       if(connections.current[peerId]){
//         //if present then simply close the connection
//         connections.current[peerId].close();
//       }
//       delete connections.current[peerId];
//       delete audioElements.current[peerId];
// //Here in the below code we are filtering the clients where the client id is not equal to the userId keep those clients and if client id matches the userId remove those clients
//       setClients(list=>list.filter(client=>client.id !==userId))

//     }

//     socket.current.on(ACTIONS.REMOVE_PEER,handleRemovePeer);
//     //Unsubscribing the event before leaving the componentqq1
//     return ()=>{
//       socket.current.off(ACTIONS.REMOVE_PEER);
//     }
//   },[])


//   return { clients, provideRef };
// };
// //we need to do certain things after client added so we will use the useStateWithCallBack to handle that
// //which is a custom hook
