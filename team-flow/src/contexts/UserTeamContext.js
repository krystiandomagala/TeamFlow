import React, { useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, arrayUnion, serverTimestamp, doc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext'; // Dodajemy import useAuth
import { useNavigate } from 'react-router-dom';

const UserTeamDataContext = React.createContext();

export function useUserTeamData() {
  return useContext(UserTeamDataContext);
}

export function UserTeamDataProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [lastTeamId, setLastTeamId] = useState(false);
  const { currentUser } = useAuth(); // Używamy currentUser z AuthContext
  const navigate = useNavigate();

  function createTeam(teamName) {
    const teamsCol = collection(db, 'teams');
    addDoc(teamsCol, {
      name: teamName,
      createdAt: serverTimestamp(),
      memberIds: [currentUser.uid], // dodajemy twórcę zespołu jako pierwszego członka
      adminIds: [currentUser.uid], // twórca zespołu jest też administratorem
      accessCode: uuidv4(),
    })
      .then((docRef) => {
        // Tutaj możesz ustawić lastTeamId dla użytkownika lub przekierować go do dashboardu zespołu
        setLastTeamId(docRef.id);
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
  }

  async function joinTeam(accessCode) {
    setLoading(true);
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('accessCode', '==', accessCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setLoading(false);
      alert('No team found with the given access code');
      return;
    }

    const teamDoc = querySnapshot.docs[0];
    const teamId = teamDoc.id;

    await updateDoc(doc(db, 'teams', teamId), {
      memberIds: arrayUnion(currentUser.uid),
    })
      .then(() => {
        setLastTeamId(teamId);
        navigate(`/team/${teamId}`);
      })
      .catch((error) => {
        console.error('Error joining team: ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function getUserTeams() {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('memberIds', 'array-contains', currentUser.uid));
    const querySnapshot = await getDocs(q);
    const teams = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return teams; // zwracamy tablicę zespołów
  }


  const value = {
    joinTeam,
    createTeam,
    lastTeamId,
    getUserTeams 
  };
  return <UserTeamDataContext.Provider value={value}>{children}</UserTeamDataContext.Provider>;
}
