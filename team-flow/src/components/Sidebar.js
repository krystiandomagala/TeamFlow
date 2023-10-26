import { React, useState, useEffect } from "react";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { ReactComponent as Icon } from "../assets/app_icon.svg";
import { ReactComponent as TeamFlowIcon } from "../assets/team_flow_icon.svg";
import { ReactComponent as DashboardIcon } from "../assets/dashboard.svg";
import { ReactComponent as ScheduleIcon } from "../assets/schedule.svg";
import { ReactComponent as StatisticsIcon } from "../assets/stats.svg";
import { ReactComponent as TeamIcon } from "../assets/team.svg";
import { ReactComponent as TasksIcon } from "../assets/tasks.svg";
import { ReactComponent as ChatIcon } from "../assets/chat.svg";
import { ReactComponent as MenuIcon } from "../assets/bars.svg";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1200);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth <= 1200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div style={{ display: "flex", height: "100%" }}>
    <ProSidebar collapsed={collapsed}  width="280px" defaultCollapsed	
>
      <Menu menuItemStyles={{
          icon: ({active, disabled}) => {
            return {
            color: active ? '#007bff' : undefined,
          };
          },
          button: ({active, disabled}) => {
            return {
            color: active ? '#007bff' : undefined,
          };
          }
        }}>
        <MenuItem icon={<TeamFlowIcon/>} style={{fontSize: "32px", color: "#2F2E41", marginTop: "30px",  marginBottom: "100px"}}>
          Team<span style={{fontWeight: "900"}}>Flow</span>
        </MenuItem>
        <MenuItem active icon={<DashboardIcon />}>Dashboard</MenuItem>
        <MenuItem icon={<ScheduleIcon />}>Schedule</MenuItem>
        <MenuItem icon={<StatisticsIcon />}>Statistics</MenuItem>
        <MenuItem icon={<TeamIcon />}>Team</MenuItem>
        <MenuItem icon={<TasksIcon />}>Tasks</MenuItem>
        <MenuItem icon={<ChatIcon />}>Chat</MenuItem>
      </Menu>
    </ProSidebar>
    </div>
  );
}
