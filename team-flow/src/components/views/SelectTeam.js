import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import { useUserTeamData } from '../../contexts/TeamContext'; // Hook do zarządzania danymi zespołu użytkownika
import TopBar from '../common/TopBar'; // Komponent paska górnego
import { Link } from 'react-router-dom'; // Link z react-router-dom do nawigacji
import TeamItem from '../common/TeamItem';
// Główny komponent do wyboru zespołu
export default function SelectTeam() {
  // Hooki stanu do zarządzania stanem komponentu
  const { createTeam, joinTeam, getUserTeams, setLastTeamId } = useUserTeamData();
  const [teamName, setTeamName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true); // Rozpoczęcie ładowania

    getUserTeams().then((fetchedTeams) => {
      if (isSubscribed) {
        setTeams(fetchedTeams);
        setIsLoading(false); // Zakończenie ładowania
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [getUserTeams]);

  // Obsługa tworzenia nowego zespołu
  const handleCreateTeam = (e) => {
    e.preventDefault();
    createTeam(teamName).then(() => {
      setShowCreateTeamModal(false);
      setTeamName('');
    });
  };

  // Obsługa dołączania do zespołu
  const handleJoinTeam = (e) => {
    e.preventDefault();
    joinTeam(accessCode).then(() => {
      setShowJoinTeamModal(false);
      setAccessCode('');
    });
  };

  // Ustawianie ID ostatnio wybranego zespołu
  const handleSelectTeam = (teamId) => {
    setLastTeamId(teamId);
  };

  // Renderowanie UI komponentu
  return (
    <>
      <div className='px-3'>
        <TopBar />

        <div className='mt-2'>
          <h1>Team select</h1>
          <Button onClick={() => setShowCreateTeamModal(true)}>Create team</Button>
          <Button className='m-2' onClick={() => setShowJoinTeamModal(true)}>Join team</Button>

          <h2>Your teams</h2>
          <div className='d-flex gap-3 py-3 teams-wrapper scrollbar'>
            {isLoading ? (
              <Spinner animation="border" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            ) : (
              teams.map((team) => (
                <div key={team.id}>
                  <Link to={`/${team.id}/dashboard`} style={{ textDecoration: 'none' }} onClick={() => handleSelectTeam(team.id)}>
                    <TeamItem team={team} />
                  </Link>
                </div>
              ))
            )}
          </div>


          <TeamModal
            show={showCreateTeamModal}
            onHide={() => setShowCreateTeamModal(false)}
            title='Create a New Team'
            onSubmit={handleCreateTeam}
            controlId='team-name'
            label='Team name'
            placeholder="Enter your team's name"
            value={teamName}
            onChange={setTeamName}
            buttonText='Create team'
          />
          <TeamModal
            show={showJoinTeamModal}
            onHide={() => setShowJoinTeamModal(false)}
            title='Join a Team'
            onSubmit={handleJoinTeam}
            controlId='team-code'
            label='Team access code'
            placeholder='Enter team access code'
            value={accessCode}
            onChange={setAccessCode}
            buttonText='Join team'
          />
        </div>
      </div>
    </>
  );
}

// Komponent modalny wykorzystywany do tworzenia i dołączania do zespołów
function TeamModal({ show, onHide, title, onSubmit, controlId, label, placeholder, value, onChange, buttonText }) {
  // Renderowanie modalu z formularzem
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group id={controlId} className='mb-3'>
            <Form.Label>{label}</Form.Label>
            {/* Pola formularza z kontrolowanymi komponentami */}
            <Form.Control type='text' placeholder={placeholder} required value={value} onChange={(e) => onChange(e.target.value)} />
          </Form.Group>
          {/* Przycisk wysyłający formularz */}
          <Button type='submit' className='w-100'>
            {buttonText}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
