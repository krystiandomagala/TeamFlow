import React, { useState } from "react";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Button } from "react-bootstrap";
import { ReactComponent as TeamFlowIcon } from "../../assets/team_flow_icon.svg";
import { ReactComponent as DashboardIcon } from "../../assets/dashboard.svg";
import { ReactComponent as ScheduleIcon } from "../../assets/schedule.svg";
import { ReactComponent as StatisticsIcon } from "../../assets/stats.svg";
import { ReactComponent as TeamIcon } from "../../assets/team.svg";
import { ReactComponent as TasksIcon } from "../../assets/tasks.svg";
import { ReactComponent as ChatIcon } from "../../assets/chat.svg";
import { ReactComponent as MenuIcon } from "../../assets/bars.svg";
import { Link } from "react-router-dom";
import { useUserTeamData } from "../../contexts/TeamContext";

// Styl dla elementów menu
const menuItemStyle = {
  fontSize: "32px",
  color: "#2F2E41",
  marginTop: "30px",
  marginBottom: "100px",
};

// Funkcja określająca styl ikon w zależności od tego, czy są aktywne
const iconStyle = (active) => ({
  color: active ? "#007bff" : undefined,
});

// Komponent MobileMenu odpowiada za wyświetlanie bocznego menu w wersji mobilnej
export default function MobileMenu() {
  const [isVisible, setIsVisible] = useState(false); // Stan określający, czy menu jest widoczne
  const { lastTeamId } = useUserTeamData(); // Hook kontekstowy przechowujący dane zespołu użytkownika
  
  // Funkcja generująca propsy dla poszczególnych pozycji w menu
  const getMenuItemProps = (path) => ({
    active: window.location.pathname === `/${lastTeamId}/${path}`,
    icon: {
      Dashboard: <DashboardIcon />,
      Schedule: <ScheduleIcon />,
      Statistics: <StatisticsIcon />,
      Team: <TeamIcon />,
      Tasks: <TasksIcon />,
      Chat: <ChatIcon />,
    }[path],
    component: <Link to={`/${lastTeamId}/${path.toLowerCase()}`} />,
  });

  return (
    <>
      <ProSidebar
        style={{
          left: isVisible ? 0 : "-280px", // Pozycja bocznego menu
          position: "fixed",
          top: 0,
          zIndex: 1000,
          height: "100vh", // Wysokość ustawiona na 100% wysokości viewportu
          backgroundColor: "#FBFBFB",
          transition: "left 0.3s ease-in-out", // Animacja przejścia
          width: "280px", // Szerokość menu
        }}
      >
        <Menu
          menuItemStyles={{
            icon: iconStyle,
            button: iconStyle,
          }}
        >
          {/* Pozycja menu z logo */}
          <MenuItem icon={<TeamFlowIcon />} style={menuItemStyle}>
            Team<span style={{ fontWeight: "900" }}>Flow</span>
          </MenuItem>
          {/* Generowanie pozostałych pozycji menu */}
          {['Dashboard', 'Schedule', 'Statistics', 'Team', 'Tasks', 'Chat'].map((item) => (
            <MenuItem key={item} {...getMenuItemProps(item)}>{item}</MenuItem>
          ))}
        </Menu>
      </ProSidebar>

      {/* Przycisk do pokazywania/ukrywania bocznego menu */}
      <Button className="btn btn-light" onClick={() => setIsVisible(!isVisible)}>
        <MenuIcon />
      </Button>
    </>
  );
}
