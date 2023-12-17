import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../common/Avatar';
import { Modal } from 'react-bootstrap';


export default function Message({ message }) {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleImageClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  function formatMessageWithLinks(text) {
    const urlRegex = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        return <a key={i} href={part} style={{ color: "#fff" }} target="_blank" rel="noopener noreferrer">{part}</a>;
      } else {
        return part;
      }
    });
  }

  return (
    <>
      <div className={`d-flex gap-3 align-items-end my-2 ${message.senderId === currentUser.uid ? 'owner' : ''}`}>
        <Avatar userId={message.senderId} />
        {message.image ? (
          <>
            <img className='message-img' src={message.image} onClick={handleImageClick} style={{ cursor: 'pointer' }} />
            <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
              <Modal.Body>
                <img src={message.image} className='img-fluid' alt='Chat Image' />
              </Modal.Body>
            </Modal>
          </>
        ) : (
          <div className='message-content px-3 py-2'> {formatMessageWithLinks(message.text)}</div>
        )}
      </div>
    </>
  );
}
