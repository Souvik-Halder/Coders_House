import React,{useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWebRTC } from '../../hooks/useWebRTC';
import {useSelector} from 'react-redux'
import styles from './Room.module.css'
import { getRoom } from '../../http';
const Room = () => {
    const {id : roomId}=useParams();
    const user=useSelector(state=>state.auth.user); 
    const navigate=useNavigate();
  const [room, setRoom] = useState(null);
  useEffect(()=>{
    const fetchRoom=async()=>{
    const {data}=await getRoom(roomId);
   
    setRoom((prev)=>data)
    }
    fetchRoom();
  },[roomId])


    const {clients,provideRef}=useWebRTC(roomId,user);
    const handManualLeave=()=>{
     navigate('/rooms')
    }
    const handleMuteClick=(id)=>{
      console.log(id);
    }
    // console.log(clients)
  return (
    <div>
    <div className="container">
        <button onClick={handManualLeave} className={styles.goBack}>
            <img src="/images/arrow-left.png" alt="arrow-left" />
            <span>All voice rooms</span>
        </button>
    </div>
    <div className={styles.clientsWrap}>
        <div className={styles.header}>
    { room &&    <h2 className={styles.topic}>{room.topic}</h2>}
            <div className={styles.actions}>
                <button className={styles.actionBtn}>
                    <img src="/images/palm.png" alt="palm-icon" />
                </button>
                <button
                    onClick={handManualLeave}
                    className={styles.actionBtn}
                >
                    <img src="/images/win.png" alt="win-icon" />
                    <span>Leave quietly</span>
                </button>
            </div>
        </div>
        <div className={styles.clientsList}>
            {clients.map((client) => {
                return (
                    <div className={styles.client} key={client.id}>
                        <div className={styles.userHead}>
                            <img
                                className={styles.userAvatar}
                                src={client.avatar}
                                alt=""
                            />
                            <audio
                                autoPlay
                                ref={(instance) => {
                                    provideRef(instance, client.id);
                                }}
                            />
                            <button
                                onClick={() =>
                                    handleMuteClick(client.id)
                                }
                                className={styles.micBtn}
                            >
                                {client.muted ? (
                                    <img
                                        className={styles.mic}
                                        src="/images/mic-mute.png"
                                        alt="mic"
                                    />
                                ) : (
                                    <img
                                        className={styles.micImg}
                                        src="/images/mic.png"
                                        alt="mic"
                                    />
                                )}
                            </button>
                        </div>
                        <h4>{client.name}</h4>
                    </div>
                );
            })}
        </div>
    </div>
</div>

  )
}

export default Room
