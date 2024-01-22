import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Modal } from 'react-bootstrap';
import { ReactComponent as DotsIcon } from '../../assets/ellipsis-vertical.svg'
import { useUserTeamData } from '../../contexts/TeamContext';
import useTeamExists from '../../hooks/useTeamExists';
import AvatarMid from '../common/AvatarMid'
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../../contexts/AuthContext';


function TeamMemberItem({ member, isAdmin, onRemove, onLeaveTeam, onGrantAdmin, onRevokeAdmin }) {
    // Przykładowe wyświetlanie danych członka zespołu
    const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
    const { teamId } = useTeamExists();

    useEffect(() => {
        async function checkUserStatus() {
            const adminStatus = await isUserTeamAdmin(teamId);
            setIsCurrentUserAdmin(adminStatus)

        }

        checkUserStatus()
    }, [])

    const { isUserTeamAdmin } = useUserTeamData();

    return (
        <div className='team-member-item p-3 rounded-4 d-flex align-items-top justify-content-between gap-3 overflow-visible'>
            <div>
                <div className='d-flex align-items-center gap-3'>
                    <AvatarMid userId={member.uid} />
                    <div>
                        <div className="member-status">{isAdmin ? "Team administrator" : "Team member"}</div>
                        <span className='fw-bolder h5 m-0'>{member.fullName}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeamMemberItem;
