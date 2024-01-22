import React, { useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const UserContext = React.createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {

  const getUserData = async (userId) => {
    try {
      // Wykonanie żądania HTTP GET do funkcji Cloud Functions
      const response = await fetch(`https://getuserdata-ff4yiokesq-ey.a.run.app?userId=${userId}`);

      if (!response.ok) {
        console.error('Error Response:', response.statusText);
        // Tutaj obsłuż błędy, np. wyświetlając komunikat
        return;
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error:', error);
      // Tutaj obsłuż błędy związane z siecią lub innymi wyjątkami
    }
  };

  const value = {
    getUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
