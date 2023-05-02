import { useEffect, useState, useRef, useCallback } from 'react';
import { ACTIONS } from '../actions';
import socketInit from '../socket';
import freeice from 'freeice';
import { useStateWithCallback } from './useStateWithCallback';

export const useWebRTC = (roomId, user) => {
    const [clients, setClients] = useStateWithCallback([]);
    const audioElements = useRef({});
    const connections = useRef({});
    const socket = useRef(null);
    const localMediaStream = useRef(null);
    const clientsRef=useRef([]);//here by using the ref we are managing the two copies of client one is in the state and one is the ref 
    const addNewClient = useCallback(
        (newClient, cb) => {
            const lookingFor = clients.find(
                (client) => client.id === newClient.id
            );
                
            
            if (lookingFor === undefined) {
                setClients(
                    (existingClients) => [...existingClients, newClient],
                    cb
                );
            }
        },
        [clients, setClients]
    );

    useEffect(() => {
        socket.current = socketInit();
    }, []);

    // Handle new peer

    useEffect(() => {
        const handleNewPeer = async ({
            peerId,
            createOffer,
            user: remoteUser,
        }) => {
            // If already connected then prevent connecting again
            if (peerId in connections.current) {
                return console.warn(
                    `You are already connected with ${peerId} (${user.name})`
                );
            }

            // Store it to connections
            connections.current[peerId] = new RTCPeerConnection({
                iceServers: freeice(),
            });

            // Handle new ice candidate on this peer connection
            connections.current[peerId].onicecandidate = (event) => {
                socket.current.emit(ACTIONS.RELAY_ICE, {
                    peerId,
                    icecandidate: event.candidate,
                });
            };

            // Handle on track event on this connection
            connections.current[peerId].ontrack = ({
                streams: [remoteStream],
            }) => {
                addNewClient({...remoteUser,muted:true}, () => {
                    // console.log('peer', audioElements.current, peerId);
                    if (audioElements.current[remoteUser.id]) {
                        audioElements.current[remoteUser.id].srcObject =
                            remoteStream;
                    } else {
                        let settled = false;
                        const interval = setInterval(() => {
                            if (audioElements.current[remoteUser.id]) {
                                audioElements.current[remoteUser.id].srcObject =
                                    remoteStream;
                                settled = true;
                            }

                            if (settled) {
                                clearInterval(interval);
                            }
                        }, 1000);
                    }
                });
            };
            if(localMediaStream.current){
            // Add connection to peer connections track
            localMediaStream.current.getTracks().forEach((track) => {
                connections.current[peerId].addTrack(
                    track,
                    localMediaStream.current
                );
            });
        }

            // Create an offer if required
            if (createOffer) {
                const offer = await connections.current[peerId].createOffer();

                // Set as local description
                await connections.current[peerId].setLocalDescription(offer);

                // send offer to the server
                socket.current.emit(ACTIONS.RELAY_SDP, {
                    peerId,
                    sessionDescription: offer,
                });
            }
        };

        // Listen for add peer event from ws
        socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
        return () => {
            socket.current.off(ACTIONS.ADD_PEER);
        };
    }, [clients]);

    useEffect(() => {
        const startCapture = async () => {
            // Start capturing local audio stream.

            localMediaStream.current =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
        };

        startCapture().then(() => {
            // add user to clients list
            //here we are sending the user and also making the muted is true
            addNewClient({...user,muted:true}, () => {
                const localElement = audioElements.current[user.id];
                if (localElement) {
                    localElement.volume = 0;
                    localElement.srcObject = localMediaStream.current;
                }
            });

            // Emit the action to join
            socket.current.emit(ACTIONS.JOIN, {
                roomId,
                user,
            });
        });

        // Leaving the room
        return () => {
            if(localMediaStream.current){
            localMediaStream.current
                .getTracks()
                .forEach((track) => track.stop());
            socket.current.emit(ACTIONS.LEAVE, { roomId });
            }
        };
    }, []);

    // Handle ice candidate
    useEffect(() => {
        socket.current.on(ACTIONS.ICE_CANDIDATE, ({ peerId, icecandidate }) => {
            // console.log('ices', connections.current[peerId]);
            if (icecandidate) {
                connections.current[peerId].addIceCandidate(icecandidate);
            }
        });

        return () => {
            socket.current.off(ACTIONS.ICE_CANDIDATE);
        };
    }, []);

    // Handle session description

    useEffect(() => {
        const setRemoteMedia = async ({
            peerId,
            sessionDescription: remoteSessionDescription,
        }) => {
            connections.current[peerId].setRemoteDescription(
                new RTCSessionDescription(remoteSessionDescription)
            );

            // If session descrition is offer then create an answer
            if (remoteSessionDescription.type === 'offer') {
                const connection = connections.current[peerId];

                const answer = await connection.createAnswer();
                connection.setLocalDescription(answer);

                socket.current.emit(ACTIONS.RELAY_SDP, {
                    peerId,
                    sessionDescription: answer,
                });
            }
        };

        socket.current.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
        return () => {
            socket.current.off(ACTIONS.SESSION_DESCRIPTION);
        };
    }, []);

    useEffect(() => {
        window.addEventListener('unload', function () {
            alert('leaving');
            socket.current.emit(ACTIONS.LEAVE, { roomId });
        });
    }, []);

    useEffect(() => {
        const handleRemovePeer = ({ peerID, userId }) => {
            console.log('leaving', peerID, userId);

            if (connections.current[peerID]) {
                connections.current[peerID].close();
            }

            delete connections.current[peerID];
            delete audioElements.current[peerID];

            setClients((list) => list.filter((c) => c.id !== userId));
        };

        socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);

        return () => {
            socket.current.off(ACTIONS.REMOVE_PEER);
        };
    }, []);

    useEffect(()=>{
        // here we are storing the clients in clients Ref so the UI will not change as per the Ref because useRef don't  reRender the component with change
        clientsRef.current=clients

    },[clients])


    //Listen for mute/unmute server
    useEffect(()=>{
        socket.current.on(ACTIONS.MUTE,({peerId,userId})=>{
            setMute(true,userId);
        })
        socket.current.on(ACTIONS.UN_MUTE,({peerId,userId})=>{
            setMute(false,userId);
        })

        const setMute=(mute,userId)=>{
            //clients
            const clientIdx=clientsRef.current.map(client=>client.id).indexOf(userId);
            console.log('idx',clientIdx);

            const connectedClients= JSON.parse(
                JSON.stringify(clientsRef.current)
            )
            //This below if statement stands for that the client is present in the list or not {if present it makes the clientIdx greater than -1}
            if(clientIdx > -1){
                //it simply change the property of mute and unmute on the clients
                connectedClients[clientIdx].muted=mute;
                setClients(connectedClients);

            }
            //This upper map will return the array of the id of the clients


            //setClient
            //here we need to set the muted property of the client so after changing the property we need to set the client
        }

    },[])


    const provideRef = (instance, userId) => {
        audioElements.current[userId] = instance;
    };







    //Handling mute
    const handleMute=(isMute,userId)=>{
        console.log("Mute"+isMute);
        let settled=false;
      let interval=setInterval(()=>{
        if(localMediaStream.current){
            //here so if isMute is true then we need to false the enabled so we are doing that
        localMediaStream.current.getTracks()[0].enabled=!isMute;
        if(isMute){
            //if I am mute then we need to send the data to the other client that I am Mute so that the ui of the other client should be updated so that every client see each other on changing the element
            socket.current.emit(ACTIONS.MUTE,{
                roomId,
                userId
            })
        }else{
            socket.current.emit(ACTIONS.UN_MUTE,{
                roomId,
                userId
            })
        }
        settled=true;
        }
        if(settled){
            //if settled is true then clear the interval so that it don't need to check repeatedly that
             //the client is muted or not
            clearInterval(interval);
        }
      },200)
    }

    return { clients, provideRef,handleMute };
};