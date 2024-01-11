import React, { useState, useEffect } from 'react';
import AvatarMini from './AvatarMini';
import { useUser } from '../../contexts/UserContext'; // Zaktualizuj ścieżkę
import moment from 'moment';
import { ReactComponent as CalendarIcon } from '../../assets/calendar-filled.svg'
import { Alert, Button, Dropdown } from 'react-bootstrap';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import useTeamExists from '../../hooks/useTeamExists';
import { ReactComponent as DotsIcon } from '../../assets/ellipsis-vertical.svg'
import { CheckLg, XLg } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function RequestItem({ request, isAdmin }) {
    const [userData, setUserData] = useState(null);
    const { getUserData } = useUser();
    const { teamId } = useTeamExists()
    const [editMode, setEditMode] = useState(false); // State to manage edit mode
    const { currentUser } = useAuth()
    const handleEdit = () => {
        setEditMode(true); // Enable edit mode
    };

    useEffect(() => {
        async function fetchUserData() {
            const data = await getUserData(request.user);
            setUserData(data);
        }

        if (request.user) {
            fetchUserData();
        }
    }, [request.user, getUserData]);

    const formatDate = (timestamp) => {
        return timestamp ? moment(timestamp.toDate()).format('DD/MM/YYYY') : '';
    };

    const requestStatus = (status) => {
        switch (status) {
            case 'requested':
                return 'warning';
            case 'accepted':
                return 'success';
            case 'declined':
                return 'danger';
            default:
                return 'warning';
        }

    }
    console.log(request)

    const handleAccept = async () => {
        setEditMode(false)
        const requestRef = doc(db, "teams", teamId, "time-offs", request.id);
        try {
            await updateDoc(requestRef, {
                status: "accepted"
            });
        } catch (error) {
            console.error("Error updating request: ", error);
        }
    };

    const handleDecline = async () => {
        setEditMode(false)
        const requestRef = doc(db, "teams", teamId, "time-offs", request.id);
        try {
            await updateDoc(requestRef, {
                status: "declined"
            });
        } catch (error) {
            console.error("Error updating request: ", error);
        }
    };


    return (
        <div className='p-3 rounded-3 request-item my-2 overflow-visible'>
            {userData && (
                <div>
                    <div className='d-flex justify-content-between'>
                        <div className='d-flex align-items-center gap-2'>
                            <AvatarMini userId={request.user} />
                            {userData.fullName}
                        </div>
                        <div className='d-flex gap-4'>
                            <div className='d-flex align-items-center gap-2 deadline-text'>
                                <CalendarIcon />
                                {
                                    formatDate(request.startDate) === formatDate(request.endDate) ? (
                                        <span>{formatDate(request.startDate)}</span>

                                    ) : (
                                        <span>{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                                    )
                                }
                            </div>
                            <Alert variant={requestStatus(request.status)} className='rounded-5 px-3 py-1 m-0 d-flex align-items-center' style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{request.status}</Alert>
                            {
                                isAdmin && (
                                    <>
                                        {(request.status === 'requested' || editMode) && (
                                            <div className='d-flex gap-2' style={{ height: '30px' }}>
                                                <Button onClick={handleAccept} variant="outline-primary" className='request-btn p-0 m-0'><CheckLg /></Button>
                                                <Button onClick={handleDecline} variant="outline-primary" className='request-btn p-0 m-0'><XLg /></Button>
                                            </div>
                                        )}
                                        <Dropdown>
                                            <Dropdown.Toggle style={{ backgroundColor: 'transparent', border: 'none', color: "black" }} bsPrefix='p-0' >
                                                <DotsIcon />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu >
                                                <Dropdown.Item onClick={handleEdit}>Edit</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </>
                                )
                            }
                        </div>
                    </div>
                    {(isAdmin || request.user === currentUser.uid) && (
                        <>
                            {request.note.length > 0 && (<div className='mt-3 user-info'>{request.note}</div>)}
                        </>
                    )}
                </div>
            )
            }
        </div >
    );
}
