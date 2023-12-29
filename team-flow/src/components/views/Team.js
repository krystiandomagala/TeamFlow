import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Loading from '../common/Loading';
import useTeamExists from '../../hooks/useTeamExists';
import { useUserTeamData } from '../../contexts/TeamContext';
import { Button, Modal, useAccordionButton } from 'react-bootstrap';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { v4 as uuid } from 'uuid';
import TeamMemberItem from '../common/TeamMemberItem';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function Team() {
  const { isLoading } = useTeamExists();
  const { getTeamData, isUserTeamAdmin } = useUserTeamData();
  const { teamId } = useTeamExists();
  const [accessCode, setAccessCode] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [showSavedAlert, setShowSavedAlert] = useState(false);
  const [showErrorCopyAlert, setShowErrorCopyAlert] = useState(false);
  const [showErrorSaveAlert, setShowErrorSaveAlert] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamData, setTeamData] = useState(null);
  const { currentUser } = useAuth()

  const navigate = useNavigate()

  const removeTeamMember = async (userId) => {
    // Logic to remove the user from the team
    // This could involve updating your database or state

    // For example:
    try {
      await updateDoc(doc(db, 'teams', teamId), {
        memberIds: teamData.memberIds.filter(id => id !== userId)
      });
      // Update local state as well
      setTeamMembers(teamMembers.filter(member => member.uid !== userId));
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const teamData = await getTeamData(teamId);
      setTeamData(teamData)
      setAccessCode(teamData.accessCode);
      const adminStatus = await isUserTeamAdmin(teamId);
      setIsAdmin(adminStatus);

      if (teamData && teamData.memberIds) {
        fetchTeamMembers(teamData.memberIds);
      }
    }

    fetchData();
  }, [teamId, getTeamData, isUserTeamAdmin]);

  async function fetchTeamMembers(memberIds) {
    const membersData = await Promise.all(memberIds.map(async (memberId) => {
      const memberDoc = await getDoc(doc(db, 'users', memberId));
      return memberDoc.data();
    }));
    setTeamMembers(membersData);
  }

  const isUserAdmin = (userId) => {
    return teamData && teamData.adminIds.includes(userId);
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(accessCode)
      .then(() => {
        setShowCopyAlert(true);
        setTimeout(() => setShowCopyAlert(false), 2000); // Alert zniknie po 3 sekundach
      })
      .catch(err => {
        console.error('Błąd podczas kopiowania: ', err);
        setShowErrorCopyAlert(true);
        setTimeout(() => setShowErrorCopyAlert(false), 2000);
      });
  };

  const generateNewAccessCode = async () => {
    const newCode = uuid();
    setAccessCode(newCode);

    const teamRef = doc(db, 'teams', teamId);
    try {
      await updateDoc(teamRef, { accessCode: newCode });
      console.log('Nowy kod dostępu został wygenerowany i zaktualizowany w bazie danych');
      setShowSavedAlert(true);
      setTimeout(() => setShowSavedAlert(false), 2000); // Alert zniknie po 2 sekundach
    } catch (error) {
      console.error('Błąd podczas aktualizacji kodu dostępu w bazie danych: ', error);
      setShowErrorSaveAlert(true);
      setTimeout(() => setShowErrorSaveAlert(false), 2000);
    }
  };

  const leaveTeam = async () => {
    try {
      // Update the team in the database
      await updateDoc(doc(db, 'teams', teamId), {
        memberIds: teamData.memberIds.filter(id => id !== currentUser.uid)
      });

      // Update local state
      setTeamMembers(teamMembers.filter(member => member.uid !== currentUser.uid));

      // Redirect user after leaving the team
      navigate('/');
    } catch (error) {
      console.error('Error leaving team:', error);
      // Handle error (e.g., show an error message)
    }
  };

  if (isLoading) {
    return <MainLayout><Loading /></MainLayout>;
  }

  return (
    <MainLayout>
      <div className='my-3 pe-3 d-flex flex-column w-100' style={{ overflowY: 'auto' }}>
        <h1>Team</h1>
        {isAdmin && (
          <>
            <Button onClick={handleOpenModal}>Add team member</Button>
            <Modal show={showModal} onHide={handleCloseModal} centered>
              <Modal.Header closeButton>
                <Modal.Title>Add Team Member</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p className='subtitle'>Copy and share this access code with users who wish to join your team. They can easily join by selecting <b>Join Team</b> and entering this code.</p>

                <div className='d-flex flex-column gap-3'>
                  <input type="text" value={accessCode} disabled className="form-control text-center" />
                  <Button onClick={handleCopyCode}>Copy access code</Button>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button variant="primary" onClick={generateNewAccessCode}>
                  Generate new code
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
        <div>
          {isAdmin ? "Jesteś adminem!" : "Nie jesteś adminem :("}
        </div>
        {teamMembers.map(member => (
          <TeamMemberItem key={member.id} member={member} isAdmin={isUserAdmin(member.uid)} onRemove={removeTeamMember} onLeaveTeam={leaveTeam} />
        ))}
      </div>


      <div className="alert-container" style={{ position: 'fixed', bottom: 20, right: 20 }}>
        {showCopyAlert && (
          <div className="alert alert-success">
            Access code has been copied
          </div>
        )}
        {showErrorCopyAlert && (
          <div className="alert alert-danger">
            Error copying the code
          </div>
        )}
        {showSavedAlert && (
          <div className="alert alert-success">
            New access code has been saved in the database
          </div>
        )}
        {showErrorSaveAlert && (
          <div className="alert alert-danger">
            Error saving the new code
          </div>
        )}
      </div>
    </MainLayout>
  );
}
