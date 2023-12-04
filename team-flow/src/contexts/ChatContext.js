import React, { useContext, useState, useEffect, useReducer } from 'react';
import { auth, db } from '../firebase';
import firebase from 'firebase/compat/app';
import { useAuth } from './AuthContext';
import useTeamExists from '../hooks/useTeamExists';

const ChatContext = React.createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children, teamId }) {

  const { currentUser } = useAuth();
  const INITIAL_STATE = {
    chatId: "null",
    user: {},
    teamId: "null"
  };

  const chatReducer = (state, action) => {

    switch (action.type) {
      case "CHANGE_USER":
        return {
          user: action.payload,
          chatId: `${action.teamId}${currentUser.uid > action.payload.uid ? currentUser.uid + action.payload.uid : action.payload.uid + currentUser.uid}`,
          teamId: action.teamId
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return <ChatContext.Provider value={{ data: state, dispatch }}>{children}</ChatContext.Provider>;
}
