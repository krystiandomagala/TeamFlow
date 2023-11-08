import { React, useState, useEffect } from "react";
import MobileMenu from "./MobileMenu";
import { Navbar,Nav, Dropdown } from 'react-bootstrap';
import { ReactComponent as NotificationIcon } from "../../assets/notification.svg";
import Avatar from "./Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TopBar() {

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const { logout } = useAuth();
    const [error, setError] = useState('');
    const navigate = useNavigate()
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
  
      window.addEventListener("resize", handleResize);
  
      // Usuń nasłuchiwacz podczas odmontowywania komponentu
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

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
  

    return (
      <Navbar className="border-bottom d-flex align-items-center justify-content-end">
      <Nav>
        { isMobile ? (
          <MobileMenu />
        ) : (
          <>
            <Nav.Item className="mx-3 d-flex align-items-center">
              <NotificationIcon size={32} /> {/* Ikona powiadomień */}
            </Nav.Item>
            <Dropdown align="end">
              <Dropdown.Toggle id="dropdown-avatar"  className="btn-secondary" bsPrefix="p-0">
                   <Avatar user={{ fullName: 'Jan Kowalski', avatarUrl: null }} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                <Dropdown.Item href="/settings">Settings</Dropdown.Item>
                <Dropdown.Item onClick={navigateToSelectTeam}>Select team</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item  onClick={handleLogout}>Log out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </>
        )}
      </Nav>
  </Navbar>
    );
}
