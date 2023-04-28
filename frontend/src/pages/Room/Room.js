import React from 'react'
import { useParams } from 'react-router-dom'

const Room = () => {
    const {id}=useParams();
  return (
    <div>
      This is the room {id}
    </div>
  )
}

export default Room
