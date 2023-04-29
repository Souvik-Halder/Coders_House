import React,{useState} from 'react'
import { useParams } from 'react-router-dom'
import { useWebRTC } from '../../hooks/useWebRTC';
import {useSelector} from 'react-redux'

const Room = () => {
    const {id : roomId}=useParams();
    const user=useSelector(state=>state.auth.user); 
    
    const {clients,provideRef}=useWebRTC(roomId,user);
    // console.log(clients)
  return (
    <div>
      <h1>All Connected Clients</h1>
      {
        clients.map(client=>{
          return <div key={client.id}>
            {/* Audio player of html */}
            <audio
             ref={(instance)=>provideRef(instance,client.id)} 
             controls
              autoPlay></audio>
            <h4>{client.name}</h4>
          </div>
        })
      }
    </div>
  )
}

export default Room
