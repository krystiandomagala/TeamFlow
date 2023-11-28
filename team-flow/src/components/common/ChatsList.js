import { getDocs, setDoc, doc, updateDoc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { Form, Modal, Button } from 'react-bootstrap';
import { ReactComponent as PlusIcon } from '../../assets/square-plus.svg';
import { useAuth } from '../../contexts/AuthContext';
import { useUserTeamData } from '../../contexts/TeamContext';
import { useUser } from '../../contexts/UserContext';
import useTeamExists from '../../hooks/useTeamExists';
import ChatItem from '../common/ChatItem';
import NewChatListItem from './NewChatListItem';
import { db } from '../../firebase';
import { useChat } from '../../contexts/ChatContext';

export default function ChatsList() {
  const [showModal, setShowModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const { getTeamData } = useUserTeamData();
  const { teamId } = useTeamExists();
  const { getUserData } = useUser();
  const { currentUser } = useAuth();
  const [currUser, setCurrUser] = useState(null);
  const [chats, setChats] = useState([]);
  const { dispatch } = useChat();
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, 'userChats', currentUser.uid), (doc) => {
        setChats(doc.data());
      });

      getUserData(currentUser.uid)
        .then((data) => {
          // Przetwórz dane użytkownika i ustaw je w stanie komponentu
          setCurrUser(data);
        })
        .catch((error) => {
          console.error('Błąd podczas pobierania danych użytkownika:', error);
        });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  useEffect(() => {
    const loadTeamMembers = async () => {
      const data = await getTeamData(teamId);
      const membersData = await Promise.all(
        data.memberIds.map(async (memberId) => {
          if (memberId !== currentUser.uid) {
            // Pomijamy aktualnego użytkownika
            return await getUserData(memberId);
          }
          return null;
        })
      ).then((results) => results.filter((member) => member !== null)); // Filtrowanie null

      setTeamMembers(membersData);
    };

    if (teamId) {
      loadTeamMembers();
    }
  }, [getTeamData, getUserData, teamId, currentUser.uid]);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSelect = async (userId) => {
    const userRef = doc(db, 'users', userId);
    getDoc(userRef)
      .then(async (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('userData:', userData);

          const combinedId = currentUser.uid > userData.uid ? currentUser.uid + userData.uid : userData.uid + currentUser.uid;
          console.log('combinedId:', combinedId);

          // Sprawdzanie, czy chat już istnieje
          const chatRef = doc(db, 'chats', combinedId);
          const chatSnap = await getDoc(chatRef);
          console.log('chatSnap.exists():', chatSnap.exists());

          if (!chatSnap.exists()) {
            await setDoc(doc(db, 'chats', combinedId), { messages: [] });
          }

            await updateDoc(doc(db, 'userChats', currUser.uid), {
              [`${combinedId}.userInfo`]: {
                uid: userData.uid,
                fullName: userData.fullName,
                profilePhoto: userData.profilePhoto,
              },
              [`${combinedId}.date`]: serverTimestamp(),
            });

            await updateDoc(doc(db, 'userChats', userId), {
              [`${combinedId}.userInfo`]: {
                uid: currUser.uid,
                fullName: currUser.fullName,
                profilePhoto: currUser.profilePhoto,
              },
              [`${combinedId}.date`]: serverTimestamp(),
            });
            // Wykonaj updateDoc
          } else {
            console.error('Brakujące dane użytkownika');
          }
      })
      .catch((error) => {
        console.error('Błąd podczas pobierania danych użytkownika:', error);
      });
  };

  const handleSelectChat = (u) => {
    dispatch({ type: 'CHANGE_USER', payload: u });
    console.log(u);
  };

  return (
    <div className='border-end chat-list pt-3 pe-3'>
      <div className='d-flex align-items-baseline justify-content-between'>
        <h1>Chats</h1>
        <PlusIcon className='icon-btn' onClick={handleShow} />
        <Modal show={showModal} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Create new chat</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {teamMembers.map((member, index) => (
              <div key={index} onClick={() => handleSelect(member.uid)}>
                <NewChatListItem user={member} />
              </div>
            ))}
          </Modal.Body>
        </Modal>
      </div>
      <Form.Group>
        <Form.Control className='form-control-lg' type='text' placeholder='Szukaj chatu'></Form.Control>
      </Form.Group>
      <div className='mt-3'>
        {Object.entries(chats)
          ?.sort((a, b) => b[1].date - a[1].date)
          .map((chat) => {
            return (
              <div onClick={() => handleSelectChat(chat[1].userInfo)} key={chat[0]}>
                <ChatItem chat={chat[1]} />
              </div>
            );
          })}
      </div>
    </div>
  );
}
