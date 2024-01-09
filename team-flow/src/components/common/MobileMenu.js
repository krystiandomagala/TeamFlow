import React, { useState } from "react";
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

export default function MobileMenu() {

  const [isVisible, setIsVisible] = useState(false);
  const sidebarStyle = isVisible ? { left: 0 } : { left: "-280px" };
  const { lastTeamId } = useUserTeamData(); // Używamy hooka useUserTeamData
  const { teamId } = useParams()
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate();
  const [error, setError] = useState('');

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
              <SubMenu label="Calendar" icon={<ScheduleIcon />} active={window.location.pathname === `/${lastTeamId}/schedule`}>
                <MenuItem active={window.location.pathname === `/${lastTeamId}/schedule`} component={<Link to={`/${lastTeamId}/schedule`} />} className='submenu-item'>
                  Schedule
                </MenuItem>
                <MenuItem
                  active={window.location.pathname === `/${lastTeamId}/schedule/time-off`}
                  component={<Link to={`/${lastTeamId}/schedule/time-off`} />}
                  className='submenu-item'
                >
                  Time off Requests
                </MenuItem>
              </SubMenu>
              <MenuItem active={window.location.pathname === `/${lastTeamId}/statistics`} icon={<StatisticsIcon />} component={<Link to={`/${lastTeamId}/statistics`} />}>Statistics</MenuItem>
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
