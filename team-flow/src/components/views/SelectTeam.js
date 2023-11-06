import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useUserTeamData  } from '../../contexts/UserTeamContext';
export default function SelectTeam() {
  const { createTeam, joinTeam, getUserTeams  } = useUserTeamData();
  const { currentUser } = useAuth();
  const [teamName, setTeamName] = useState('')
  const [accessCode, setAccessCode] = useState('');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    let isSubscribed = true; // flaga do sprawdzania, czy komponent jest nadal zamontowany

    getUserTeams().then(fetchedTeams => {
      if (isSubscribed) {
        setTeams(fetchedTeams); // aktualizacja stanu `teams`
      }
    });

    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, []); 

  const handleCreateTeam = (e) => {
    e.preventDefault();

    createTeam(teamName);
    setShowCreateTeamModal(false);
    setTeamName('')
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    await joinTeam(accessCode);
    setAccessCode('')
  }


  return (
    <div className='p-5'>
      <h1>Select team</h1>
      <Button className='btn-lg' onClick={() => setShowCreateTeamModal(true)}>
        Create team
      </Button>
      <Button className='btn-lg m-3' onClick={() => setShowJoinTeamModal(true)}>
        Join team
      </Button>

      <h1>Your teams</h1>
      <div>
        {/* Wyświetlenie listy zespołów */}
        {teams.map((team) => (
          <div key={team.id}>{team.name}</div>
        ))}
      </div>

      <Modal show={showCreateTeamModal} onHide={() => setShowCreateTeamModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create a New Team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateTeam}>
            <Form.Group id='team-name' className='my-3'>
              <Form.Label className='label-text'>Team name</Form.Label>
              <Form.Control className='form-control-lg' type='text' placeholder="Enter your team's name" required value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </Form.Group>
            <Button  type="submit" className='w-100 btn-lg'>Create team</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showJoinTeamModal} onHide={() => setShowJoinTeamModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Join a Team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleJoinTeam}>
            <Form.Group id='team-code' className='my-3'>
              <Form.Label className='label-text'>Team access code</Form.Label>
              <Form.Control type='text' placeholder='Enter team access code' className='form-control-lg' required value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
            </Form.Group>
            <Button type="submit" className='w-100 btn-lg'>Join team</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
