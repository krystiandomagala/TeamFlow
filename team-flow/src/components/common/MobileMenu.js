import React, { useState, useRef, useEffect } from "react";
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Button, Dropdown } from "react-bootstrap";
import { ReactComponent as Icon } from "../../assets/app_icon.svg";
import { ReactComponent as TeamFlowIcon } from "../../assets/team_flow_icon.svg";
import { ReactComponent as DashboardIcon } from "../../assets/dashboard.svg";
import { ReactComponent as ScheduleIcon } from "../../assets/schedule.svg";
import { ReactComponent as StatisticsIcon } from "../../assets/stats.svg";
import { ReactComponent as TeamIcon } from "../../assets/team.svg";
import { ReactComponent as TasksIcon } from "../../assets/tasks.svg";
import { ReactComponent as ChatIcon } from "../../assets/chat.svg";
import { ReactComponent as MenuIcon } from "../../assets/bars.svg";
import { Link, useParams } from "react-router-dom";
import { useUserTeamData } from "../../contexts/TeamContext";
import Avatar from "./Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from "react-bootstrap-icons";
import { collection, query, where, getDocs, onSnapshot, writeBatch, startAfter, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase'; // Aktualizuj tę ścieżkę
import { ReactComponent as NotificationIcon } from '../../assets/notification.svg';
import AvatarMini from './AvatarMini';
import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp

export default function MobileMenu() {

  const [isVisible, setIsVisible] = useState(false);
  const sidebarStyle = isVisible ? { left: 0 } : { left: "-280px" };
  const { lastTeamId } = useUserTeamData(); // Używamy hooka useUserTeamData
  const { teamId } = useParams()
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const notificationsMenuRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Funkcja sprawdzająca, czy kliknięcie było poza menu
    const handleClickOutside = async (event) => {
      const menu = document.querySelector('.notifications-menu');
      if (menu && !menu.contains(event.target) && !event.target.matches('.notification-icon, .notification-icon *')) {
        setShowNotificationsMenu(false);

        // Ustawianie powiadomień na przeczytane
        const notificationsRef = collection(db, 'teams', teamId, 'teamMembers', currentUser.uid, 'notifications');
        const q = query(notificationsRef);
        const querySnapshot = await getDocs(q);

        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
          if (!doc.data().isRead) {
            batch.update(doc.ref, { isRead: true });
          }
        });
        await batch.commit();

        setUnreadNotificationsCount(0);
      }
    };

    // Dodaj nasłuchiwanie kliknięć
    document.addEventListener('mousedown', handleClickOutside);

    // Usuń nasłuchiwanie po odmontowaniu komponentu
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadMoreNotifications = async () => {
    if (lastVisible && !loadingMore) {
      setLoadingMore(true);
      const nextQuery = query(
        collection(db, 'teams', teamId, 'teamMembers', currentUser.uid, 'notifications'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(20)
      );

      const querySnapshot = await getDocs(nextQuery);
      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);

      const newNotifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(prevNotifications => [...prevNotifications, ...newNotifications]);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = async () => {
      const menu = notificationsMenuRef.current;
      if (menu.scrollHeight - menu.scrollTop === menu.clientHeight) {
        await loadMoreNotifications();
      }
    };

    const menu = notificationsMenuRef.current;
    menu?.addEventListener('scroll', handleScroll);

    return () => {
      menu?.removeEventListener('scroll', handleScroll);
    };
  }, [loadMoreNotifications]);

  useEffect(() => {
    if (currentUser && teamId) {
      const notificationsRef = collection(db, 'teams', teamId, 'teamMembers', currentUser.uid, 'notifications');
      const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(11));

      const unsubscribe = onSnapshot(q, querySnapshot => {
        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);

        const newNotifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(newNotifications);

        // Tutaj oblicz ilość nieprzeczytanych powiadomień
        const unreadCount = newNotifications.filter(notif => !notif.isRead).length;
        setUnreadNotificationsCount(unreadCount > 10 ? '+10' : unreadCount);
      }, error => {
        console.error("Error fetching notifications:", error);
      });

      return unsubscribe;
    }
  }, [currentUser, teamId]);

  function formatDate(timestamp) {
    if (timestamp instanceof Timestamp) {
      const notificationDate = timestamp.toDate();
      const today = new Date();

      // Formatowanie daty do porównania (bez czasu)
      const d1 = new Date(notificationDate.getFullYear(), notificationDate.getMonth(), notificationDate.getDate());
      const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (d1.getTime() === d2.getTime()) {
        // Jeśli data powiadomienia to dzisiaj, pokazuj tylko godzinę i minutę
        return notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        // Jeśli data powiadomienia to inny dzień, pokazuj dzień, miesiąc i rok
        return notificationDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
      }
    } else {
      console.error('Invalid timestamp', timestamp);
      return ''; // Możesz zwrócić domyślną wartość lub pusty ciąg
    }
  }

  const toggleNotificationsMenu = async () => {
    const shouldCloseMenu = showNotificationsMenu;

    setShowNotificationsMenu(!showNotificationsMenu);

    if (shouldCloseMenu) {
      setUnreadNotificationsCount(0);
      // Tutaj dodaj logikę oznaczania powiadomień jako przeczytanych
      const notificationsRef = collection(db, 'teams', teamId, 'teamMembers', currentUser.uid, 'notifications');
      const q = query(notificationsRef);
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db);
      querySnapshot.forEach(doc => {
        if (!doc.data().isRead) {
          batch.update(doc.ref, { isRead: true });
        }
      });
      await batch.commit();
    }
  };

  const navigateToSelectTeam = () => {
    navigate('/'); // Załóżmy, że ścieżka do wyboru zespołu to '/select-team'
  };

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      navigate('/');
    } catch {
      setError('Failed to log out.');
    }
  };

  return (
    <>
      {teamId && (
        <>
          <ProSidebar
            style={{
              ...sidebarStyle,
              position: "fixed",
              top: 0,
              zIndex: 1000,
              height: "100vh",
              backgroundColor: "#FBFBFB",
              transition: "left 0.3s ease-in-out",
            }}
            width="280px"
          >
            <Menu
              renderExpandIcon={() => <ChevronRight style={{ fontWeight: '700', display: 'flex' }} />}

              menuItemStyles={{
                icon: ({ active, disabled }) => {
                  return {
                    color: active ? '#007bff' : undefined,
                  };
                },
                button: ({ active, level, disabled }) => {
                  if (level === 1) {
                    return {
                      backgroundColor: active ? '#d9ebff' : undefined,
                      color: active ? '#007bff' : undefined,
                      borderRadius: '10px',
                      height: '30px'
                    }
                  }
                  return {
                    color: active ? '#007bff' : undefined,
                  };

                },
                subMenuContent: () => {
                  return {
                    padding: '10px 30px 5px 30px',
                    backgroundColor: '#FBFBFB'
                  }
                },
                SubMenuExpandIcon: ({ open }) => {
                  return {
                    transform: open ? 'rotate(90deg)' : undefined,
                    transition: 'transform 0.2s '
                  }
                }
              }}
            >
              <MenuItem
                icon={<TeamFlowIcon />}
                style={{
                  fontSize: "32px",
                  color: "#2F2E41",
                  marginTop: "30px",
                  marginBottom: "100px",
                }}
              >
                Team<span style={{ fontWeight: "900" }}>Flow</span>
              </MenuItem>
              <MenuItem active={window.location.pathname === `/${lastTeamId}/dashboard`} icon={<DashboardIcon />} component={<Link to={`/${lastTeamId}/dashboard`} />}>Dashboard</MenuItem>
              <SubMenu label="Calendar" icon={<ScheduleIcon />} active={window.location.pathname === `/${lastTeamId}/schedule` || window.location.pathname === `/${lastTeamId}/schedule/time-off-requests`}>
                <MenuItem active={window.location.pathname === `/${lastTeamId}/schedule`} component={<Link to={`/${lastTeamId}/schedule`} />} className='submenu-item'>
                  Schedule
                </MenuItem>
                <MenuItem
                  active={window.location.pathname === `/${lastTeamId}/schedule/time-off-requests`}
                  component={<Link to={`/${lastTeamId}/schedule/time-off-requests`} />}
                  className='submenu-item'
                >
                  Time off Requests
                </MenuItem>
              </SubMenu>
              <MenuItem active={window.location.pathname === `/${lastTeamId}/team`} icon={<TeamIcon />} component={<Link to={`/${lastTeamId}/team`} />}>Team</MenuItem>
              <MenuItem active={window.location.pathname === `/${lastTeamId}/tasks`} icon={<TasksIcon />} component={<Link to={`/${lastTeamId}/tasks`} />}>Tasks</MenuItem>
              <MenuItem active={window.location.pathname === `/${lastTeamId}/chat`} icon={<ChatIcon />} component={<Link to={`/${lastTeamId}/chat`} />}>Chat</MenuItem>
            </Menu>
          </ProSidebar>
          <Button
            className="btn btn-light me-2"
            onClick={() => setIsVisible(!isVisible)}
          >
            <MenuIcon />
          </Button>
        </>
      )}

      <Dropdown align='end'>
        <Dropdown.Toggle id='dropdown-avatar' style={{ backgroundColor: 'transparent', border: 'none' }} bsPrefix='p-0'>
          <Avatar userId={currentUser.uid} />
        </Dropdown.Toggle>
        <div className='mx-3 d-flex align-items-center'>
          <div className='notification-icon'>
            <NotificationIcon size={32} onClick={toggleNotificationsMenu} style={{ cursor: 'pointer' }} />
            {unreadNotificationsCount > 0 && (
              <span className='notification-count'>{unreadNotificationsCount}</span>
            )}
          </div>
          {showNotificationsMenu && (
            <div className="notifications-menu border rounded-2" ref={notificationsMenuRef} >

              {notifications.sort((a, b) => b.createdAt - a.createdAt).map((notification, index) => (
                <div key={index}>
                  {
                    notification.type === 'schedule' && (
                      <Link to={`/${teamId}/schedule`} style={{ textDecoration: 'none' }}>
                        <div className={`py-2 px-3 border-bottom notification-item ${!notification.isRead ? 'unread-notification' : ''}`}>
                          <div className='d-flex align-items-center justify-content-between'>
                            <div className='d-flex gap-2 align-items-center notification-container'>
                              <AvatarMini userId={notification.createdBy} />
                              <div style={{ fontSize: '0.9rem', color: '#828282' }}>Schedule updated!</div>
                            </div>
                            {!notification.isRead && <div className='notification-dot'></div>}
                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                              {formatDate(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  }
                  {
                    notification.type === 'time-off-request' && (
                      <Link to={`/${teamId}/schedule/time-off-requests`} style={{ textDecoration: 'none' }} >
                        <div className={`py-2 px-3 border-bottom notification-item ${!notification.isRead ? 'unread-notification' : ''}`}>
                          <div className='d-flex align-items-center justify-content-between'>
                            <div className='d-flex gap-2 align-items-center notification-container'>
                              <AvatarMini userId={notification.createdBy} />
                              <div style={{ fontSize: '0.9rem', color: '#828282' }}>Time off request</div>
                            </div>
                            {!notification.isRead && <div className='notification-dot'></div>}
                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                              {formatDate(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  }
                  {
                    notification.type === 'time-off-status-update' && (
                      <Link to={`/${teamId}/schedule/time-off-requests`} style={{ textDecoration: 'none' }} >
                        <div className={`py-2 px-3 border-bottom notification-item ${!notification.isRead ? 'unread-notification' : ''}`}>
                          <div className='d-flex align-items-center justify-content-between'>
                            <div className='d-flex gap-2 align-items-center notification-container'>
                              <AvatarMini userId={notification.createdBy} />
                              <div style={{ fontSize: '0.9rem', color: '#828282' }}>Request {notification.status}</div>
                            </div>
                            {!notification.isRead && <div className='notification-dot'></div>}
                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                              {formatDate(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  }
                  {
                    notification.type === 'task-assignment' && (
                      <Link to={`/${teamId}/tasks`} style={{ textDecoration: 'none' }} >
                        <div className={`py-2 px-3 border-bottom notification-item ${!notification.isRead ? 'unread-notification' : ''}`}>
                          <div className='d-flex align-items-center justify-content-between'>
                            <div className='d-flex gap-2 align-items-center notification-container'>
                              <AvatarMini userId={notification.createdBy} />
                              <div style={{ fontSize: '0.9rem', color: '#828282' }}>New task assigned!</div>
                            </div>
                            {!notification.isRead && <div className='notification-dot'></div>}
                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                              {formatDate(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  }
                  {
                    notification.type === 'task-update' && (
                      <Link to={`/${teamId}/tasks`} style={{ textDecoration: 'none' }} >
                        <div className={`py-2 px-3 border-bottom notification-item ${!notification.isRead ? 'unread-notification' : ''}`}>
                          <div className='d-flex align-items-center justify-content-between'>
                            <div className='d-flex gap-2 align-items-center notification-container'>
                              <AvatarMini userId={notification.createdBy} />
                              <div style={{ fontSize: '0.9rem', color: '#828282' }}>Task updated!</div>
                            </div>
                            {!notification.isRead && <div className='notification-dot'></div>}
                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                              {formatDate(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  }
                </div>
              ))}
            </div>
          )}
        </div>
        <Dropdown.Menu>
          <Dropdown.Item href='/settings'>Settings</Dropdown.Item>
          <Dropdown.Item onClick={navigateToSelectTeam}>Select team</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleLogout}>Log out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}
