import React, { useEffect, useState } from 'react'
import { useUser } from '../../contexts/UserContext';
import AvatarMid from './AvatarMid'

export default function ChatItem({ chat, active }) {

  const { getUserData } = useUser();
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    getUserData(chat.userInfo.uid)
      .then((data) => {
        // Przetwórz dane użytkownika i ustaw je w stanie komponentu
        setFullName(data.fullName);
      })
      .catch((error) => {
        console.error('Błąd podczas pobierania danych użytkownika:', error);
      });
  }, [])

  if (!chat.userInfo || !chat.userInfo.uid) {
    // Obsługa sytuacji, gdy chatData jest null lub undefined
    return null; // Lub odpowiedni komunikat błędu
  }

  const truncateText = (text) => {
    if (text?.length > 15) {
      return text.substring(0, 15) + '...';
    }
    return text;
  };

  return (
    <div className={`d-flex p-3 rounded-4 align-items-center ${active === chat.userInfo.uid ? 'chat-active' : 'chat-item-not-active'} chat-item`}>
      <AvatarMid userId={chat.userInfo.uid} />
      <div className='lh-sm ms-3 w-100'>
        <div className='chat-item-title ellipsis' style={{ maxWidth: "90%" }}>{fullName}</div>
        <div className='chat-item-subtitle ellipsis'>{chat.lastMessage ? truncateText(chat.lastMessage.text) : ''}</div>
      </div>
    </div>
  )
}
