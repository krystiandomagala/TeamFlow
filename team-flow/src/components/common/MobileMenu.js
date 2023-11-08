import React, { useState } from "react";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Button } from "react-bootstrap";
import { ReactComponent as Icon } from "../../assets/app_icon.svg";
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


export default function MobileMenu() {

  const [isVisible, setIsVisible] = useState(false);
  const sidebarStyle = isVisible ? { left: 0 } : { left: "-280px" };
  const { lastTeamId } = useUserTeamData(); // Używamy hooka useUserTeamData

  return (
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
            menuItemStyles={{
              icon: ({ active, disabled }) => {
                return {
                  color: active ? "#007bff" : undefined,
                };
              },
              button: ({ active, disabled }) => {
                return {
                  color: active ? "#007bff" : undefined,
                };
              },
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
            <MenuItem  active={window.location.pathname === `/${lastTeamId}/dashboard`}  icon={<DashboardIcon />}  component={<Link to={`/${lastTeamId}/dashboard`} />}>Dashboard</MenuItem>
        <MenuItem active={window.location.pathname === `/${lastTeamId}/schedule`} icon={<ScheduleIcon />} component={<Link to={`/${lastTeamId}/schedule`} />}>Schedule</MenuItem>
        <MenuItem active={window.location.pathname === `/${lastTeamId}/statistics`} icon={<StatisticsIcon />} component={<Link to={`/${lastTeamId}/statistics`} />}>Statistics</MenuItem>
        <MenuItem active={window.location.pathname === `/${lastTeamId}/team`} icon={<TeamIcon />} component={<Link to={`/${lastTeamId}/team`} />}>Team</MenuItem>
        <MenuItem active={window.location.pathname ===  `/${lastTeamId}/tasks`} icon={<TasksIcon />} component={<Link to={`/${lastTeamId}/tasks`} />}>Tasks</MenuItem>
        <MenuItem active={window.location.pathname ===  `/${lastTeamId}/chat`} icon={<ChatIcon />} component={<Link to={`/${lastTeamId}/chat`} />}>Chat</MenuItem>
          </Menu>
        </ProSidebar>
      
      <Button
        className="btn btn-light"
        onClick={() => setIsVisible(!isVisible)}
      >
        <MenuIcon />
      </Button>
    </>
  );
}
