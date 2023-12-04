import React, { useState, useEffect } from 'react';
import { ReactComponent as CloseIcon } from '../../assets/x.svg';
import TextareaAutosize from 'react-textarea-autosize';
import { useChat } from '../../contexts/ChatContext';
import { Button } from 'react-bootstrap';
import { ReactComponent as SendIcon } from '../../assets/paper-plane.svg';
import { arrayUnion, doc, serverTimestamp, Timestamp, updateDoc, collection, addDoc } from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import { db, storage } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import useTeamExists from '../../hooks/useTeamExists';

export default function ChatInput() {
  const [images, setImages] = useState([]);
  const [text, setText] = useState('');
  const { data } = useChat();
  const { currentUser } = useAuth();
  const { teamId } = useTeamExists()

  const handleChange = (e) => setText(e.target.value);

  // Funkcje obsługi będą tutaj

  const handlePaste = (e) => {
    e.preventDefault();
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;

    let pastedImage = false;
    let pastedText = '';

    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        pastedImage = true;
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prevImages) => [...prevImages, { blob: blob, dataUrl: reader.result }]);
        };
        reader.readAsDataURL(blob);
      } else if (item.kind === 'string' && item.type === 'text/plain') {
        item.getAsString((txt) => {
          if (!pastedImage) {
            setText((text) => text + txt);
          }
        });
      }
    }
  };

  const removeImage = (index) => {
    setImages((images) => images.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    let lastMessageText = text.trim().length > 0 ? text : "Image uploaded";

    const messagesRef = collection(db, 'chats', data.chatId, 'messages');

    if (images.length > 0) {
      for (const imageObj of images) {
        const storageRef = ref(storage, `images/${uuid()}`);
        const uploadTask = uploadBytesResumable(storageRef, imageObj.blob);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Obsługa postępu przesyłania
          },
          (error) => {
            console.error('Błąd przesyłania: ', error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(messagesRef, {
              text: null,
              senderId: currentUser.uid,
              date: serverTimestamp(),
              image: downloadURL,
              // Możesz dodać inne pola, jeśli są potrzebne
            });
          }
        );
      }
    }

    if (text.trim().length > 0) {
      await addDoc(messagesRef, {
        text: text.trim(),
        senderId: currentUser.uid,
        date: serverTimestamp(),
        // Możesz dodać inne pola, jeśli są potrzebne
      });
    }


    console.log(data.chatId + ".lastMessage")
    // Aktualizacja ostatniej wiadomości
    await updateDoc(doc(db, 'userChats', currentUser.uid, 'teamChats', teamId), {
      [`${data.chatId}.lastMessage.text`]: lastMessageText,
      [`${data.chatId}.date`]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid, 'teamChats', teamId), {
      [`${data.chatId}.lastMessage.text`]: lastMessageText,
      [`${data.chatId}.date`]: serverTimestamp(),
    });

    // Resetowanie stanu
    setText("");
    setImages([]);
  };


  const canSend = text.trim().length > 0 || images.length > 0;

  return (
    <div className='d-flex align-items-end gap-2'>
      <div className='chat-input-container form-control'>
        <div className='images-container d-flex'>
          {images?.map((imageObj, index) => (
            <div key={index} className='image-container my-2'>
              <img src={imageObj.dataUrl} alt={`Załącznik ${index}`} />
              <CloseIcon onClick={() => removeImage(index)} className='close-btn' />
            </div>
          ))}
        </div>
        <TextareaAutosize maxRows={6} type='text' value={text} onChange={handleChange} onPaste={handlePaste} placeholder='Aa' className='text-input' />
      </div>
      <Button onClick={handleSend} disabled={!canSend} style={{ height: "50px" }}>
        <SendIcon />
      </Button>
    </div>
  );
}
