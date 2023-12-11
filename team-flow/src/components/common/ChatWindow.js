import React, { useEffect, useRef, useState } from 'react';
import AvatarMid from './AvatarMid';
import ChatInput from './ChatInput';
import Message from './Message';
import { useChat } from '../../contexts/ChatContext';
import { collection, doc, query, orderBy, limit, onSnapshot, startAfter } from 'firebase/firestore';
import { db } from '../../firebase';
import { Button, Spinner } from 'react-bootstrap';
import useTeamExists from '../../hooks/useTeamExists';
import useWindowSize from '../../hooks/useWindowSize';
import { ReactComponent as ArrowIcon } from "../../assets/arrow-left.svg"
import { useUser } from '../../contexts/UserContext';

export default function ChatWindow({ onBack }) {
  const [messages, setMessages] = useState([]);
  const { data } = useChat();
  const messagesContainerRef = useRef(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const isMobile = useWindowSize()
  const observer = useRef(null);
  const { teamId } = useTeamExists()
  const ref = useRef();
  const [isNearBottom, setIsNearBottom] = useState(true); // Dodany stan
  const { getUserData } = useUser();
  const [fullName, setFullName] = useState('')

  const loadMoreMessages = async () => {

    if (loading || !lastVisible || !lastVisible.data().date) return; // Sprawdź, czy data jest zatwierdzona

    setLoading(true);

    // Zapamiętaj wysokość kontenera przed załadowaniem nowych wiadomości
    const previousScrollHeight = messagesContainerRef.current.scrollHeight;

    const nextMessagesQuery = query(collection(db, 'chats', data.chatId, 'messages'), orderBy('date', 'desc'), startAfter(lastVisible), limit(30));

    onSnapshot(nextMessagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).reverse();
      setMessages((prevMessages) => [...newMessages, ...prevMessages]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

      setLoading(false);

      // Oblicz różnicę wysokości i dostosuj scrollTop
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop += (newScrollHeight - previousScrollHeight);
    });
  };

  useEffect(() => {
    if (!data.chatId || !teamId) return;

    const q = query(collection(db, 'chats', data.chatId, 'messages'), orderBy('date', 'desc'), limit(30));
    const unsub = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).reverse();
      setMessages(loadedMessages);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    });

    return () => unsub();
  }, [data.chatId]);

  useEffect(() => {
    observer.current = new IntersectionObserver(entries => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting) {
        loadMoreMessages();
      }
    }, { threshold: 1.0 });

    const targetElement = messagesContainerRef.current ? messagesContainerRef.current.firstChild : null;
    if (targetElement) {
      observer.current.observe(targetElement);
    }

    return () => {
      if (targetElement) {
        observer.current.unobserve(targetElement);
      }
    };
  }, [loadMoreMessages, teamId]);

  const handleScroll = () => {
    const messagesContainer = messagesContainerRef.current;
    const distanceFromBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight;
    setIsNearBottom(distanceFromBottom < 1000);
  };
  useEffect(() => {
    if (isNearBottom)
      ref.current?.scrollIntoView();
  }, [messages]);


  useEffect(() => {
    getUserData(data.user.uid)
      .then((data) => {
        // Przetwórz dane użytkownika i ustaw je w stanie komponentu
        setFullName(data.fullName);
      })
      .catch((error) => {
        console.error('Błąd podczas pobierania danych użytkownika:', error);
      });
  }, [])


  return (
    <div className='p-lg-5 ps-md-3 py-3 w-100 d-flex flex-column  container'>
      {data.teamId === teamId && (
        <>
          <div className='d-flex align-items-center'>
            {onBack && isMobile && (
              <div onClick={onBack} className="me-3 chat-back-btn"><ArrowIcon /></div>
            )}
            <AvatarMid userId={data.user?.uid} />
            <div className='lh-sm ms-3'>
              <div className='chat-item-title' style={{ fontSize: '22px' }}>
                {fullName}
              </div>
            </div>
          </div>
          <div className='flex-grow-1 pe-3 my-3 messages-container d-flex flex-column' ref={messagesContainerRef} onScroll={handleScroll}>
            {loading && <Spinner animation='border' role='status' variant='primary' className='align-self-center' />}
            {messages.map((m) => <Message message={m} key={m.id} />)}
            <div ref={ref} />
          </div>
          <ChatInput />
        </>
      )}
    </div>
  );
}
