import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../common/Avatar';
export default function Message({ message }) {
  const { currentUser } = useAuth();
  const ref = useRef()

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [message]);

  return (
    <>
      <div ref={ref} className={`d-flex gap-3 align-items-end my-2 ${ message.senderId === currentUser.uid ? 'owner' : ''}`}>
        <Avatar userId={message.senderId} />
        {
          message.image ? ( <img
          className='message-img'
          src={message.image}
        />) : (
        <div className='message-content px-3 py-2'>{message.text}</div>
        )
        }
      </div>
    </>
  );
}
