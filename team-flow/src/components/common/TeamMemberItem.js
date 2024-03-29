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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const { currentUser } = useAuth()
    const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
    const [showGrantAdminConfirmModal, setShowGrantAdminConfirmModal] = useState(false);
    const [showRevokeAdminConfirmModal, setShowRevokeAdminConfirmModal] = useState(false);

    const navigate = useNavigate();


    const handleRevokeAdminClick = () => {
        setShowRevokeAdminConfirmModal(true);
    };

    const handleConfirmRevokeAdmin = () => {
        onRevokeAdmin(member.uid);
        setShowRevokeAdminConfirmModal(false);
    };

    const handleGrantAdminClick = () => {
        setShowGrantAdminConfirmModal(true);
    };

    const handleConfirmGrantAdmin = () => {
        onGrantAdmin(member.uid);
        setShowGrantAdminConfirmModal(false);
    };

    const handleConfirmLeave = () => {
        // Logic to leave the team
        // After leaving the team, redirect the user
        onLeaveTeam(); // Call the function passed from parent
        // Don't forget to close the modal
        setShowLeaveConfirmModal(false);
    };

    const handleLeaveClick = () => {
        setShowLeaveConfirmModal(true);
    };

    const handleRemoveClick = () => {
        setShowConfirmModal(true);
    };

    const handleConfirmRemove = () => {
        onRemove(member.uid);
        setShowConfirmModal(false);
    };
    useEffect(() => {
        async function checkUserStatus() {
            const adminStatus = await isUserTeamAdmin(teamId);
            setIsCurrentUserAdmin(adminStatus)
        }

        checkUserStatus()
    }, [])

    const { isUserTeamAdmin } = useUserTeamData();

    return (
        <div className='team-member-item p-3 rounded-4 my-2 d-flex align-items-top justify-content-between gap-3 overflow-visible'>
            <div>
                <div className='d-flex align-items-center gap-3'>
                    <AvatarMid userId={member.uid} />
                    <div>
                        <div className="member-status">{isAdmin ? "Team administrator" : "Team member"}</div>
                        <span className='fw-bolder h5 m-0'>{member.fullName}</span>
                    </div>
                </div>
            </div>
            {isCurrentUserAdmin && currentUser.uid !== member.uid && (
                <Dropdown >
                    <Dropdown.Toggle style={{ backgroundColor: 'transparent', border: 'none', color: 'black' }} bsPrefix='p-0'>
                        <DotsIcon />
                    </Dropdown.Toggle>
                    <Dropdown.Menu >
                        {
                            isAdmin ? (
                                <Dropdown.Item onClick={handleRevokeAdminClick}>Revoke Admin</Dropdown.Item>
                            ) : (
                                <Dropdown.Item onClick={handleGrantAdminClick}>Grant Admin</Dropdown.Item>
                            )
                        }
                        <Dropdown.Item onClick={handleRemoveClick}>Remove</Dropdown.Item>

                    </Dropdown.Menu>
                </Dropdown>
            )}

            {currentUser.uid === member.uid && (
                <Dropdown>
                    <Dropdown.Toggle style={{ backgroundColor: 'transparent', border: 'none', color: 'black' }} bsPrefix='p-0'>
                        <DotsIcon />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleLeaveClick}>Leave team</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )}

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Remove User</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to remove this user?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmRemove}>
                        Remove
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showLeaveConfirmModal} onHide={() => setShowLeaveConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Leave Team</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to leave the team?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLeaveConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmLeave}>
                        Leave Team
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showGrantAdminConfirmModal} onHide={() => setShowGrantAdminConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Grant Admin Permissions</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to grant admin permissions to this user?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGrantAdminConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirmGrantAdmin}>
                        Grant Admin
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showRevokeAdminConfirmModal} onHide={() => setShowRevokeAdminConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Revoke Admin Permissions</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to revoke admin permissions from this user?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRevokeAdminConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmRevokeAdmin}>
                        Revoke Admin
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default TeamMemberItem;
