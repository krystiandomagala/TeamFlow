import { React, useState, useEffect } from 'react';
import MobileMenu from './MobileMenu';
import { Navbar, Nav, Dropdown, Alert } from 'react-bootstrap';
import { ReactComponent as NotificationIcon } from '../../assets/notification.svg';
import Avatar from './Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase'; // Aktualizuj tę ścieżkę
import useTeamExists from '../../hooks/useTeamExists';
import AvatarMini from './AvatarMini';
import { Link } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp

export default function TopBar() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { logout } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const { teamId } = useParams()
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

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


  useEffect(() => {
    if (currentUser && teamId) {
      const notificationsRef = collection(db, 'teams', teamId, 'teamMembers', currentUser.uid, 'notifications');
      const q = query(notificationsRef);

      const unsubscribe = onSnapshot(q, querySnapshot => {
        const newNotifications = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.createdAt - a.createdAt); // Sorting in real-time

        setNotifications(newNotifications);
        setUnreadNotificationsCount(newNotifications.filter(notif => !notif.isRead).length);
      }, error => {
        console.error("Error fetching notifications:", error);
      });

      return unsubscribe; // Unsubscribe when the component unmounts or dependencies change
    }
  }, [currentUser, teamId]);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    // Usuń nasłuchiwacz podczas odmontowywania komponentu
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleNotificationsMenu = async () => {
    setShowNotificationsMenu(!showNotificationsMenu);

    if (!showNotificationsMenu) {
      setUnreadNotificationsCount(0);
    }
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

  const navigateToSelectTeam = () => {
    navigate('/'); // Załóżmy, że ścieżka do wyboru zespołu to '/select-team'
  };

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


  return (
    <Navbar className='border-bottom d-flex align-items-center justify-content-end'>
      <Nav>
        {isMobile ? (
          <MobileMenu />
        ) : (
          <>
            <Nav.Item className='mx-3 d-flex align-items-center'>
              <div className='notification-icon'>
                <NotificationIcon size={32} onClick={toggleNotificationsMenu} style={{ cursor: 'pointer' }} />
                {unreadNotificationsCount > 0 && (
                  <span className='notification-count'>{unreadNotificationsCount}</span>
                )}
              </div>
              {showNotificationsMenu && (
                <div className="notifications-menu border rounded-2">
                  {notifications.sort((a, b) => b.createdAt - a.createdAt).map(notification => (
                    <div key={notification.id}>
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
                          <Link to={`/${teamId}/schedule/time-off-requests`} style={{ textDecoration: 'none' }} key={notification.id}>
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
                    </div>
                  ))}
                </div>
              )}
            </Nav.Item>
            <Dropdown align='end'>
              <Dropdown.Toggle id='dropdown-avatar' style={{ backgroundColor: 'transparent', border: 'none' }} bsPrefix='p-0'>
                <Avatar userId={currentUser.uid} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href='/settings'>Settings</Dropdown.Item>
                <Dropdown.Item onClick={navigateToSelectTeam}>Select team</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Log out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </>
        )}
      </Nav>
    </Navbar>
  );
}


const renderNotificationContent = (notification, teamId, formatDate) => {

  // Domyślna treść dla nieznanych typów powiadomień
  return <div>Notification</div>;
};