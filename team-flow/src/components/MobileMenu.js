import React, { useState } from "react";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Button } from "react-bootstrap";
import { ReactComponent as Icon } from "../assets/app_icon.svg";
import { ReactComponent as TeamFlowIcon } from "../assets/team_flow_icon.svg";
import { ReactComponent as DashboardIcon } from "../assets/dashboard.svg";
import { ReactComponent as ScheduleIcon } from "../assets/schedule.svg";
import { ReactComponent as StatisticsIcon } from "../assets/stats.svg";
import { ReactComponent as TeamIcon } from "../assets/team.svg";
import { ReactComponent as TasksIcon } from "../assets/tasks.svg";
import { ReactComponent as ChatIcon } from "../assets/chat.svg";
import { ReactComponent as MenuIcon } from "../assets/bars.svg";
export default function MobileMenu() {

  const [isVisible, setIsVisible] = useState(false);
  const sidebarStyle = isVisible ? { left: 0 } : { left: "-280px" };

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
            <MenuItem active icon={<DashboardIcon />}>
              Dashboard
            </MenuItem>
            <MenuItem icon={<ScheduleIcon />}>Schedule</MenuItem>
            <MenuItem icon={<StatisticsIcon />}>Statistics</MenuItem>
            <MenuItem icon={<TeamIcon />}>Team</MenuItem>
            <MenuItem icon={<TasksIcon />}>Tasks</MenuItem>
            <MenuItem icon={<ChatIcon />}>Chat</MenuItem>
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
