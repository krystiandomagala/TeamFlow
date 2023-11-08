import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Card, Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import useTeamExists from '../../hooks/useTeamExists';
import Loading from '../common/Loading';
import { useUserTeamData } from '../../contexts/TeamContext';

export default function Dashboard() {
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { isLoading, teamId } = useTeamExists();
  const { getTeamData } = useUserTeamData();
  const [teamName, setTeamName] = useState('');


  const fetchTeamName = async (id) => {
    const teamData = await getTeamData(id);
    if(!teamData)
      return;
      
    setTeamName(teamData.name);
  };

  useEffect(() => {
    if (currentUser?.uid) {
      const docRef = db.collection('users').doc(currentUser.uid);
      const unsubscribe = docRef.onSnapshot((doc) => {
        if (doc.exists) {
          setUserData(doc.data());
        } else {
          setError('No user data found!');
        }
      });
      return unsubscribe; // Cleanup on unmount
    }

  }, [currentUser]);

  useEffect(() => {
    fetchTeamName(teamId)
  }, [teamId])

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      navigate('/');
    } catch {
      setError('Failed to log out.');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        <Card>
          <Card.Body>
            <h1 className='text-center mb-4'>Dashboard</h1>
            {error && <Alert variant='danger'>{error}</Alert>}
            <div>
              <strong>Email:</strong> {currentUser?.email}
            </div>
            {userData && (
              <>
                <div>
                  <strong>Full Name:</strong> {userData.fullName}
                </div>
                <div>
                  <strong>Team:</strong> {teamName}
                </div>
              </>
            )}
          </Card.Body>
        </Card>
        <div className='text-center mt-3'>
          <Link to='/update-profile' className='btn btn-primary'>
            Update Profile
          </Link>
        </div>
        <div className='text-center mt-3'>
          <Button variant='link' onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </Container>
    </MainLayout>
  );
}
