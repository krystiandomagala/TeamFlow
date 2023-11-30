import React, { useEffect, useRef, useState } from 'react';
import AvatarMid from './AvatarMid';
import ChatInput from './ChatInput';
import Message from './Message';
import { useChat } from '../../contexts/ChatContext';
import { collection,doc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const { data } = useChat();
  const ref = useRef()
  
  useEffect(() => {
    if (!data.chatId) return;
  
    const chatDocRef = doc(db, 'chats', data.chatId);
  
    const unsub = onSnapshot(chatDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const chatData = docSnapshot.data();
        const messagesArray = chatData.messages || [];
        const lastFiveMessages = messagesArray.slice(-20); // Pobierz ostatnie 5 wiadomości i odwróć kolejność
        setMessages(lastFiveMessages);
      } else {
        console.log('No such document!');
      }
    }, error => {
      console.error('Error getting document:', error);
    });
  
    return () => {
      unsub();
    };
  }, [data.chatId]);

  useEffect(() => {
    ref.current?.scrollIntoView({behavior: 'smooth'})
  }, [messages])


  return (
    <div className='p-5 w-100 d-flex flex-column'>
      {data.chatId && data.chatId !== 'null' && (
        <>
          <div className='d-flex align-items-center'>
            <AvatarMid userId={data.user?.uid} />
            <div className='lh-sm ms-3'>
              <div className='chat-item-title' style={{ fontSize: '22px' }}>
                {data.user?.fullName}
              </div>
            </div>
          </div>
          <div className='flex-grow-1 pe-3 my-3 messages-container'>
            {messages.map((m) => (
              <Message message={m} key={m.id} />
            ))}

            <div ref={ref} />
          </div>
          <ChatInput />
        </>
      )}
    </div>
  );
}
