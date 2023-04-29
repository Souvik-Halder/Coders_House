import { useCallback, useEffect, useRef, useState } from "react";
import { useStateWithCallBack } from "./useStateWithCallback";
import {socketInit} from '../socket/index'
import { ACTIONS } from "../actions";
//This hook is for the webRTC code



export const useWebRTC = (roomId, user) => {
    
  const [clients, setClients] = useStateWithCallBack([]);
  //SO to fulfuill our purpose here we got the callback function after creating the hook so that we can perform certain task after adding the clients
  const audioElements = useRef({});
  const connections = useRef({});
  const localMediaStream = useRef(null);
  const socket=useRef(null)


  useEffect(() => {
    socket.current=socketInit();
    console.log(socket.current)
    
  }, []);


  const provideRef = (instance, userId) => {
    //here userId is the key and it's value is the instance
    audioElements.current[userId] = instance;
    //here the every user is assigned with it's own audio player so any volume up down or mute can be performed on the userSpecific audio player independent to other
  };
  //method to add new client
  const addNewClients = useCallback(
    (newClient, cb) => {
      const lookingFor = clients.find((client) => client.id === newClient.id);
    
      if (lookingFor === undefined) {

        //here the setclient we created as a custom hook which takes the second parameter as a callback function so providing the two parameters here
        
        setClients((existingClients) => [...existingClients, newClient], cb);
  
      }
    },
    [clients, setClients]
  );

  // Capture the audio or mike of the computer
  useEffect(() => {
    const startCapture = async () => {
      // Use the media of the local device
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    };
    startCapture().then(() => {
        addNewClients(user,()=>{
            //getting the audio element
            const localElement=audioElements.current[user.id];
            if(localElement){
                //if we don't make it zero then we can hear the voice by ourselves
                localElement.volume=0
                localElement.srcObject=localMediaStream.current;
            }
            //socket emit JOIN socket IO
            //sending the roomId and user to the backend from frontend
            socket.current.emit(ACTIONS.JOIN,{roomId,user});
            

        })
    });
  }, []);
  return { clients, provideRef };
};
//we need to do certain things after client added so we will use the useStateWithCallBack to handle that
//which is a custom hook
