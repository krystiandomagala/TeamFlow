import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Card, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
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
import MiniCalendar from '../common/MiniCalendar';

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
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [isLoadingTimeOff, setIsLoadingTimeOff] = useState(true);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  useEffect(() => {
    const fetchTimeOffRequests = async () => {
      try {
        const q = query(
          collection(db, 'teams', teamId, 'time-offs'),
          orderBy('createdAt', 'desc'),
          limit(6)
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
        setIsLoadingTimeOff(false)
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
      <div className='my-3 pe-3 d-flex flex-column w-100' style={{ overflowY: 'auto', overflowX: "hidden" }}>
        <div className='team-name'>{teamName}</div>
        <h1 className='mb-2'>Dashboard</h1>
        <Row>
          <Col lg={8} md={12} className='mt-3'>
            <div className='widget-title mb-1'>Calendar</div>
            <div className='p-2 d-flex gap-2 flex-column rounded-4' style={{ border: '8px solid #e7e7e7' }}>
              <MiniCalendar />
            </div>
          </Col>
          <Col className='mt-3'>
            <div className='widget-title mb-1' >Team</div>
            <Link to={`/${teamId}/team`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className='p-2 d-flex gap-2 flex-column rounded-4 tasks-widget' style={{ height: 'calc(100% - 32px)' }}>
                {teamMembers.length === 0 && <span className="lack-of-data m-3">No team members found.</span>}
                {teamMembers.slice(0, 5).map(member => (
                  <TeamMemberWidget key={member.uid} member={member} isAdmin={isUserAdmin(member.uid)} />
                ))}
              </div>
            </Link>
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={6} className='mt-3'>
            <div className='widget-title mb-1'>Tasks</div>
            <Link to={`/${teamId}/tasks`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className='p-2 d-flex gap-2 flex-column rounded-4 tasks-widget'>
                {recentTasks.length === 0 && <span className="lack-of-data m-3">No recent tasks found</span>}
                {recentTasks.map(task => (
                  <TaskWidget key={task.id} task={task} teamId={teamId} />
                ))}
              </div>
            </Link>
          </Col>
          <Col md={12} lg={6} className='mt-3'>
            <div className='widget-title mb-1'>Time-off requests</div>
            <Link to={`/${teamId}/schedule/time-off-requests`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className='p-2 d-flex gap-2 flex-column rounded-4 tasks-widget' >
                {isLoadingTimeOff && <div> test</div>}
                {timeOffRequests.length === 0 && <span className="lack-of-data m-3">No time-off requests found</span>}
                {
                  timeOffRequests.map(request => (
                    <RequestWidget key={request.id} request={request} />
                  ))}
              </div>
            </Link>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
}
