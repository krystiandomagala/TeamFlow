import React, { useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const UserContext = React.createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {

  async function getUserData(userId) {
    const userDocRef = doc(db, 'users', userId);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  }

  const value = {
    getUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
