import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout'
import Loading from '../common/Loading'
import useTeamExists from '../../hooks/useTeamExists';
import ChatsList from '../common/ChatsList';
import ChatWindow from '../common/ChatWindow';
import useWindowSize from '../../hooks/useWindowSize';

export default function Chat() {
  const { isLoading } = useTeamExists();
  const [showChatList, setShowChatList] = useState(true); // Domyślnie pokazuje listę chatów
  const [chatSelected, setChatSelected] = useState(false); // Nowy stan do śledzenia, czy chat został wybrany
  const isMobile = useWindowSize();

  useEffect(() => {
    if (isMobile) {
      // Na małych ekranach, pokazuj ChatWindow, jeśli chat został wybrany
      setShowChatList(!chatSelected);
    } else {
      // Na dużych ekranach, zawsze pokazuj ChatList
      setShowChatList(true);
    }
  }, [isMobile, chatSelected]);

  const handleChatSelect = () => {
    setChatSelected(true);
    setShowChatList(false); // Ukryj ChatList po wybraniu chatu na małych ekranach
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setChatSelected(false); // Resetuj stan wybranego chatu
  };

  if (isLoading) {
    return <MainLayout><Loading /></MainLayout>;
  }

  return (
    <MainLayout>
      {isMobile && !showChatList ? (
        chatSelected && <ChatWindow onBack={handleBackToList} isMobile={isMobile} />
      ) : (
        <>
          <ChatsList onChatSelect={handleChatSelect} />
          {chatSelected && <ChatWindow onBack={handleBackToList} isMobile={isMobile} />}
        </>
      )}
    </MainLayout>
  );
}
