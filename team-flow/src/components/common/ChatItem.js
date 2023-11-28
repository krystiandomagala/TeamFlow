import React from 'react'
import AvatarMid from './AvatarMid'

export default function ChatItem({chat}) {
  if (!chat.userInfo || !chat.userInfo.uid) {
    // Obsługa sytuacji, gdy chatData jest null lub undefined
    return null; // Lub odpowiedni komunikat błędu
  }

  return (
    <div className='d-flex p-3 rounded-4 align-items-center chat-item'>
      <AvatarMid userId={chat.userInfo.uid} />
      <div className='lh-sm ms-3'>
          <div className='chat-item-title ellipsis' style={{maxWidth: "180px"}}>{chat.userInfo.fullName}</div>
          <div className='chat-item-subtitle ellipsis' style={{maxWidth: "180px"}}>{chat.lastMessage?.text}</div>
      </div>
    </div>
  )
}
