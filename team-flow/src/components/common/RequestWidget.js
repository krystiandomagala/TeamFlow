import React, { useState, useEffect, startTransition } from 'react';
import AvatarMini from './AvatarMini';
import { useUser } from '../../contexts/UserContext'; // Zaktualizuj ścieżkę
import moment from 'moment';
import { ReactComponent as CalendarIcon } from '../../assets/calendar-filled.svg'
import { Alert, Button, Dropdown } from 'react-bootstrap';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import useTeamExists from '../../hooks/useTeamExists';
import { ReactComponent as DotsIcon } from '../../assets/ellipsis-vertical.svg'
import { CheckLg, XLg } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function RequestWidget({ request, isAdmin }) {
    const [userData, setUserData] = useState(null);
    const { getUserData } = useUser();
    const { teamId } = useTeamExists()

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


    return (
        <div className='p-3 rounded-3 request-item  overflow-visible'>
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

                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
