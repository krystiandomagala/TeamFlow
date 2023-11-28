import React from 'react'
import AvatarMid from './AvatarMid'

export default function NewChatListItem({user}) {
  return (
    <div className='d-flex p-3 rounded-4 align-items-center chat-item'>
      <AvatarMid userId={user.uid} />
      <div className='lh-sm ms-3'>
          <div className='chat-item-title'>{user.fullName}</div>
      </div>
    </div>
  )
}
