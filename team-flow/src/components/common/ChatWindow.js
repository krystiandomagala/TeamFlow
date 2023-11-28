import React, { useEffect, useState } from 'react';
import AvatarMid from './AvatarMid';
import ChatInput from './ChatInput';
import Message from './Message';
import { useChat } from '../../contexts/ChatContext';
import { onSnapshot, doc} from 'firebase/firestore';
import { db } from '../../firebase';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const {data} = useChat();


  useEffect(() => {
    const unsub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages)
    })

    return () => {
      unsub()
    }
  }, [data.chatId])
  return (
    <div className='p-5 w-100 d-flex flex-column'>
      <div className='d-flex align-items-center'>
        <AvatarMid userId={data.user?.uid}/>
        <div className='lh-sm ms-3'>
          <div className='chat-item-title' style={{ fontSize: '22px' }}>
            {data.user?.fullName}
          </div>
        </div>
      </div>
      <div className='flex-grow-1 pe-3 my-3 messages-container'>
      {messages.map(m=>(
        <Message message={m} key={m.id} />
      ))}
      </div>
        <ChatInput />
    </div>
  );
}
