import React, { useContext, useState } from 'react';
import { useAuth } from './AuthContext'; // Import hooka kontekstu uwierzytelnienia
import { useNavigate } from 'react-router-dom'; // Import hooka do nawigacji
import { db } from '../firebase'; // Import bazy danych Firebase
// Import funkcji Firestore do manipulowania danymi
import { collection, addDoc, updateDoc, arrayUnion, serverTimestamp, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'; // Import funkcji do generowania unikalnych ID

const UserTeamDataContext = React.createContext(); // Utworzenie kontekstu

export const useUserTeamData = () => useContext(UserTeamDataContext); // Hook do korzystania z kontekstu

// Provider kontekstu, który będzie otaczać inne komponenty w drzewie komponentów
export const UserTeamDataProvider = ({ children }) => {
  // Stan przechowujący ostatnio wybrane ID drużyny; inicjalizowany z localStorage
  const [lastTeamId, setLastTeamId] = useState(localStorage.getItem('lastTeamId'));
  const { currentUser } = useAuth(); // Pobranie aktualnie zalogowanego użytkownika
  const navigate = useNavigate(); // Hook do programowego nawigowania

  // Funkcja do ustawiania ostatniego wybranego ID zespołu i zapisywania go do localStorage
  const setAndPersistLastTeamId = (teamId) => {
    setLastTeamId(teamId); // Ustawienie stanu
    localStorage.setItem('lastTeamId', teamId); // Zapisanie do localStorage
  };

  // Asynchroniczna funkcja do tworzenia nowego zespołu
  const createTeam = async (teamName) => {
    try {
      // Dodanie nowego dokumentu do kolekcji 'teams'
      const docRef = await addDoc(collection(db, 'teams'), {
        name: teamName, // Nazwa zespołu
        createdAt: serverTimestamp(), // Timestamp serwera
        memberIds: [currentUser.uid], // ID użytkownika jako pierwszy członek
        adminIds: [currentUser.uid], // ID użytkownika jako admin
        accessCode: uuidv4(), // Wygenerowany unikalny kod dostępu
      });
      setLastTeamId(docRef.id); // Ustawienie ostatniego ID zespołu po stworzeniu nowego zespołu

      setDoc(doc(db, "userChats", currentUser.uid, "teamChats", docRef.id), {})

    } catch (error) {
      console.error('Error adding document: ', error); // Obsługa błędów
    }
  };

  // Asynchroniczna funkcja do dołączania do zespołu
  const joinTeam = async (accessCode) => {
    try {
      // Zapytanie o zespoły z podanym kodem dostępu
      const teamsQuery = query(collection(db, 'teams'), where('accessCode', '==', accessCode));
      const querySnapshot = await getDocs(teamsQuery);

      // Sprawdzenie czy znaleziono zespół
      if (querySnapshot.empty) {
        alert('No team found with the given access code');
        return;
      }

      // Aktualizacja dokumentu zespołu o nowego członka
      const teamDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'teams', teamDoc.id), {
        memberIds: arrayUnion(currentUser.uid),
      });

      setDoc(doc(db, "userChats", currentUser.uid, "teamChats", teamDoc.id), {})
      setLastTeamId(teamDoc.id); // Ustawienie ostatniego ID zespołu po dołączeniu
      navigate(`/${teamDoc.id}/dashboard`); // Przeniesienie użytkownika do strony zespołu
    } catch (error) {
      console.error('Error joining team: ', error); // Obsługa błędów
    }
  };

  // Asynchroniczna funkcja do pobierania zespołów, do których należy użytkownik
  const getUserTeams = async () => {
    try {
      // Zapytanie o zespoły, których członkiem jest użytkownik
      const teamsQuery = query(collection(db, 'teams'), where('memberIds', 'array-contains', currentUser.uid));
      const querySnapshot = await getDocs(teamsQuery);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user teams: ', error); // Obsługa błędów
      return [];
    }
  };

  // Asynchroniczna funkcja do pobierania danych zespołu, o id przekazanym jako argument
  const getTeamData = async (teamId) => {
    try {
      const teamDocRef = doc(db, 'teams', teamId); // Utworzenie referencji do dokumentu zespołu
      const teamDocSnapshot = await getDoc(teamDocRef); // Pobranie snapshotu dokumentu

      if (teamDocSnapshot.exists()) {
        return { id: teamDocSnapshot.id, ...teamDocSnapshot.data() }; // Jeśli dokument istnieje, zwróć jego dane
      } else {
        console.error('No such team!');
        return null; // Jeśli nie istnieje, zwróć null
      }
    } catch (error) {
      console.error('Error getting team data: ', error);
      return null; // W przypadku błędu, zwróć null
    }
  };

  async function isUserTeamAdmin(teamId) {
    const teamDocRef = doc(db, 'teams', teamId);
    try {
      const docSnap = await getDoc(teamDocRef);
      if (docSnap.exists()) {
        const teamData = docSnap.data();
        return teamData.adminIds.includes(currentUser.uid);
      } else {
        console.log('Team not found');
        return false;
      }
    } catch (error) {
      console.error("Error checking team admin status: ", error);
      return false;
    }
  }
  // Przekazanie wartości do kontekstu
  const value = { createTeam, joinTeam, lastTeamId, getUserTeams, getTeamData, setLastTeamId: setAndPersistLastTeamId, isUserTeamAdmin };

  // Zawijanie dzieci w Provider kontekstu
  return <UserTeamDataContext.Provider value={value}>{children}</UserTeamDataContext.Provider>;
};
