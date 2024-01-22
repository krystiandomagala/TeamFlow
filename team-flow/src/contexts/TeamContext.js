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
    const userUid = currentUser.uid; // Zakładając, że currentUser to aktualnie zalogowany użytkownik

    try {
      const response = await fetch('https://createteam-ff4yiokesq-ey.a.run.app', { // Zmień '/createTeam' na właściwy URL funkcji Cloud
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: teamName,
          userUid: userUid,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Team created with ID:', result.teamId);
      setLastTeamId(result.teamId); // Ustawienie ostatniego ID zespołu

      // Możesz tutaj dodać dodatkową logikę, na przykład przekierowanie użytkownika
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };


  // Asynchroniczna funkcja do dołączania do zespołu
  // Funkcja, którą przypiszesz do przycisku 'Join Team' w Twoim komponencie React
  const joinTeam = async (accessCode) => {
    try {
      // Wykonanie żądania HTTP POST do Twojej funkcji Cloud Functions
      const response = await fetch('https://jointeam-ff4yiokesq-ey.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessCode: accessCode,
          userUid: currentUser.uid,
        }),
      });

      const result = await response.json(); // lub response.json() jeśli oczekiwany jest JSON
      console.log(result.teamId)

      if (response.ok) {
        console.log('Success:', result);
        // Tutaj możesz przekierować użytkownika lub wyświetlić komunikat o sukcesie
        navigate(`/${result.teamId}/dashboard`);
      } else {
        console.error('Error Response:', result);
        // Tutaj obsłuż błędy, np. wyświetlając komunikat
      }
    } catch (error) {
      console.error('Error:', error);
      // Tutaj obsłuż błędy związane z siecią lub innymi wyjątkami
    }

  };

  // Asynchroniczna funkcja do pobierania zespołów, do których należy użytkownik
  const getUserTeams = async () => {
    const userUid = currentUser.uid; // Zakładając, że currentUser to aktualnie zalogowany użytkownik

    try {
      const response = await fetch('https://getuserteams-ff4yiokesq-ey.a.run.app?userUid=' + encodeURIComponent(userUid), { // Zmień '/getUserTeams' na właściwy URL funkcji Cloud
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const teams = await response.json();
      console.log(teams)
      return teams;
    } catch (error) {
      console.error('Error getting user teams:', error);
      return [];
    }
  };


  const getTeamData = async (teamId) => {
    try {
      const response = await fetch('https://getteamdata-ff4yiokesq-ey.a.run.app?teamId=' + encodeURIComponent(teamId), {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const teamData = await response.json();
      return teamData;
    } catch (error) {
      console.error('Error getting team data:', error);
      return null;
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
