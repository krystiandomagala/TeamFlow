import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Card, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import useTeamExists from '../../hooks/useTeamExists';
import Loading from '../common/Loading';
import { useUserTeamData } from '../../contexts/TeamContext';
import { collection, query, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase'; // ścieżka do Twojej konfiguracji Firebase
import TaskItem from '../common/TaskItem';
import TaskWidget from '../common/TaskWidget';
import TeamMemberWidget from '../common/TeamMemberWidget';
import RequestItem from '../common/RequestItem';
import RequestWidget from '../common/RequestWidget';

export default function Dashboard() {
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { isLoading, teamId } = useTeamExists();
  const [teamName, setTeamName] = useState('');
  const [recentTasks, setRecentTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const { getTeamData, isUserTeamAdmin } = useUserTeamData();
  const [loading, setLoading] = useState(true);
  const [timeOffRequests, setTimeOffRequests] = useState([]);

  useEffect(() => {
    const fetchTimeOffRequests = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'teams', teamId, 'time-offs'),
          orderBy('createdAt', 'desc'),
          limit(4)
        );

        const querySnapshot = await getDocs(q);
        const requests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setTimeOffRequests(requests);
      } catch (error) {
        console.error('Error fetching time-off requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeOffRequests();
  }, []);

  const isUserAdmin = (userId) => {
    return teamData && teamData.adminIds.includes(userId);
  };

  useEffect(() => {
    async function fetchData() {
      const teamData = await getTeamData(teamId);
      setTeamData(teamData)
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

  useEffect(() => {
    const fetchRecentTasks = async () => {
      if (teamId) {
        const q = query(collection(db, 'teams', teamId, 'tasks'), orderBy('creationDate', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        const tasksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentTasks(tasksData);
      }
    };

    fetchRecentTasks();
  }, [teamId]);

  const fetchTeamName = async (id) => {
    const teamData = await getTeamData(id);
    if (!teamData)
      return;

    setTeamName(teamData.name);
  };

  useEffect(() => {
    fetchTeamName(teamId)
  }, [teamId])

  if (isLoading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className='my-3 d-flex flex-column w-100'>
        <h3>{teamName}</h3>
        <h1 className='mb-2'>Dashboard</h1>
        <Row>
          <Col>
            <div className='widget-title mb-1'>Tasks</div>
            <Link to={`/${teamId}/tasks`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className='p-2 d-flex gap-2 flex-column rounded-4 tasks-widget'>
                {recentTasks.length === 0 && <p>No recent tasks.</p>}
                {recentTasks.map(task => (
                  <TaskWidget key={task.id} task={task} teamId={teamId} />
                ))}
              </div>
            </Link>
          </Col>
          <Col>
            <div className='widget-title mb-1'>Team</div>
            <Link to={`/${teamId}/team`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className='p-2 d-flex gap-2 flex-column rounded-4 tasks-widget'>
                {teamMembers.length === 0 && <p>No team members found.</p>}
                {teamMembers.slice(0, 5).map(member => (
                  <TeamMemberWidget key={member.uid} member={member} isAdmin={isUserAdmin(member.uid)} />
                ))}
              </div>
            </Link>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className='widget-title mb-1'>Time-off requests</div>
            <Link to={`/${teamId}/schedule/time-off-requests`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className='p-2 d-flex gap-2 flex-column rounded-4 tasks-widget'>
                {timeOffRequests.length === 0 && <p>No time-off requests found.</p>}
                {timeOffRequests.map(request => (
                  <RequestWidget key={request.id} request={request} />
                ))}
              </div>
            </Link>
          </Col>
        </Row>
        <Row></Row>

      </div>
    </MainLayout>
  );
}
