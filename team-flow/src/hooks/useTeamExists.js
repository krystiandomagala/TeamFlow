import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Import konfiguracji Firebase
import { useAuth } from '../contexts/AuthContext';

// Hook używany do sprawdzenia, czy zespół o danym ID istnieje w Firestore
export default function useTeamExists() {
  const { teamId } = useParams(); // Pobranie ID zespołu z URL
  const navigate = useNavigate(); // Hook do nawigacji po historii przeglądarki
  const [teamExists, setTeamExists] = useState(false); // Stan określający, czy zespół istnieje
  const [isLoading, setIsLoading] = useState(true); // Stan określający, czy trwa ładowanie danych
  const { currentUser } = useAuth()
  useEffect(() => {
    // Funkcja asynchroniczna do sprawdzenia istnienia zespołu
    const checkTeamExists = async () => {
      if (!teamId) {
        navigate('/not-found')
        return
      } // Jeśli nie ma teamId, zakończ funkcję
      const docRef = doc(db, 'teams', teamId); // Referencja do dokumentu w Firestore

      try {
        const docSnap = await getDoc(docRef); // Pobranie dokumentu
        if (docSnap.exists() && docSnap.data().memberIds.includes(currentUser.uid)) {
          // Jeśli dokument istnieje, ustaw stan teamExists na true
          setTeamExists(true);
        } else {
          // Jeśli dokument nie istnieje, ustaw teamExists na false i przekieruj do /not-found
          setTeamExists(false);
          navigate('/not-found');
        }
      } catch (error) {
        // Obsługa błędu przy pobieraniu dokumentu
        console.error('Wystąpił błąd podczas pobierania dokumentu:', error);
        setTeamExists(false)
        navigate('/not-found')
      } finally {
        // W każdym przypadku, gdy zakończymy próbę pobrania, ustawiamy isLoading na false
        setIsLoading(false);
      }
    };

    checkTeamExists(); // Wywołanie funkcji po zamontowaniu komponentu
  }, [teamId, navigate]); // Efekt będzie ponownie uruchomiony, gdy zmieni się teamId lub navigate

  // Zwracanie obiektu ze stanem teamExists i isLoading
  return { teamExists, isLoading, teamId };
}
