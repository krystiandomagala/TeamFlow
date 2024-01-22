import React, { useState, useEffect } from 'react'
import useTeamExists from '../../hooks/useTeamExists';
import MainLayout from '../../layouts/MainLayout'
import Loading from '../common/Loading';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { addDoc, collection, serverTimestamp, query, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Zaktualizuj tę ścieżkę
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';
import RequestItem from '../common/RequestItem';
import { useUser } from '../../contexts/UserContext';
import { UserTeamDataProvider, useUserTeamData } from '../../contexts/TeamContext';
import { ReactComponent as ArrowUpIcon } from '../../assets/arrow-up.svg'
import { ReactComponent as ArrowDownIcon } from '../../assets/arrow-down.svg'

export default function TimeOff() {
    const { isLoading } = useTeamExists();
    const tomorrow = moment().add(1, 'days');
    const [show, setShow] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: tomorrow,
        endDate: tomorrow
    });
    const [note, setNote] = useState('');
    const { teamId } = useTeamExists()
    const { currentUser } = useAuth()
    const [showAlert, setShowAlert] = useState(false);
    const [requests, setRequests] = useState([]);
    const { isUserTeamAdmin } = useUserTeamData()
    const [isAdmin, setIsAdmin] = useState(false);
    const [isRequestsExpanded, setIsRequestsExpanded] = useState(false);
    const [isYourRequestsExpanded, setIsYourRequestsExpanded] = useState(false);

    // Function to toggle the expanded state
    const toggleRequestsExpanded = () => {
        setIsRequestsExpanded(!isRequestsExpanded);
    };

    const toggleYourRequestsExpanded = () => {
        setIsYourRequestsExpanded(!isYourRequestsExpanded);
    };



    useEffect(() => {
        const checkAdminPermissions = async () => {
            const adminStatus = await isUserTeamAdmin(teamId);
            setIsAdmin(adminStatus);
        }
        checkAdminPermissions()
    }, [teamId])

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "teams", teamId, "time-offs"),
            (snapshot) => {
                const requestsData = snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .sort((a, b) => {
                        // Convert 'createdAt' to a comparable value (like timestamp)
                        const timeA = a.createdAt?.seconds || 0;
                        const timeB = b.createdAt?.seconds || 0;

                        // Sort in descending order (newest first)
                        return timeB - timeA;
                    });
                setRequests(requestsData);
            },
            (error) => {
                console.error("Error fetching requests: ", error);
            }
        );

        // Cleanup function
        return () => unsubscribe();
    }, [teamId]);

    const handleClose = () => {
        setShow(false)
        setDateRange({
            startDate: tomorrow,
            endDate: tomorrow
        })
        setNote('')
    }

    const handleShow = () => setShow(true);

    const displayDateValue = () => {
        return `${dateRange.startDate.format('MM/DD/YYYY')} - ${dateRange.endDate.format('MM/DD/YYYY')}`;
    };

    const dateRangePickerOptions = {
        minDate: moment().add(1, 'days').toDate(), // Ustawia minimalną datę na następny dzień
    };

    const handleNoteChange = (e) => {
        setNote(e.target.value);
    };

    const handleApply = (event, picker) => {
        setDateRange({
            startDate: picker.startDate,
            endDate: picker.endDate
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!dateRange.startDate || !dateRange.endDate) {
            console.error("Please select a date range.");
            return;
        }

        try {
            // Dodaj wniosek o urlop
            const docRef = await addDoc(collection(db, "teams", teamId, "time-offs"), {
                user: currentUser.uid,
                startDate: dateRange.startDate.toDate(),
                endDate: dateRange.endDate.toDate(),
                note: note,
                status: "requested",
                createdAt: serverTimestamp()
            });

            // Pobierz adminIds z dokumentu zespołu
            const teamDoc = await getDoc(doc(db, "teams", teamId));
            const adminIds = teamDoc.data()?.adminIds || [];
            // Pobierz członków zespołu
            const teamMembersSnapshot = await getDocs(collection(db, "teams", teamId, "teamMembers"));
            console.log(teamMembersSnapshot)

            // Filtruj i wyślij powiadomienia tylko do administratorów
            teamMembersSnapshot.docs.forEach(async (memberDoc) => {
                if (adminIds.includes(memberDoc.id) && memberDoc.id !== currentUser.uid) { // Sprawdź, czy ID użytkownika jest wśród adminIds i nie jest równy currentUser.uid
                    await addDoc(collection(db, "teams", teamId, "teamMembers", memberDoc.id, "notifications"), {
                        timeOffRequestId: docRef.id,
                        createdBy: currentUser.uid,
                        status: "requested",
                        createdAt: serverTimestamp(),
                        isRead: false,
                        type: 'time-off-request'
                    });
                }
            });
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 2000);
            handleClose();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };



    if (isLoading) {
        return <MainLayout><Loading /></MainLayout>;
    }

    const currentUserRequests = requests.filter(request => request.user === currentUser.uid);

    return (
        <MainLayout>
            <div className='my-3 pe-3 d-flex flex-column w-100 overflow-auto time-off-item'>
                <h1>Time off requests</h1>
                <Button onClick={handleShow}>+ New Request</Button>
                <div className="divider mb-3 mt-4">
                    <span>
                        Time-off requests
                    </span>
                </div>
                <div>
                    {(isRequestsExpanded ? requests : requests.slice(0, 3)).map(request => (
                        <RequestItem key={request.id} request={request} isAdmin={isAdmin} />
                    ))}
                    {requests.length > 3 && (
                        <div onClick={toggleRequestsExpanded} className='show-less-more'>
                            {isRequestsExpanded ? <><ArrowUpIcon /> Show less </> : <> <ArrowDownIcon />Show more</>}
                        </div>
                    )}
                    {requests.length < 1 && (
                        <div className="lack-of-data mt-3">
                            No time-off requests in your team
                        </div>)}
                </div>
                <div className="divider mb-3 mt-4">
                    <span>Your Requests</span>
                </div>
                <div>
                    {(isYourRequestsExpanded ? currentUserRequests : currentUserRequests.slice(0, 3)).map(request => (
                        <RequestItem key={request.id} request={request} isAdmin={isAdmin} />
                    ))}
                    {currentUserRequests.length > 3 && (
                        <div onClick={toggleYourRequestsExpanded} className='show-less-more'>
                            {isYourRequestsExpanded ? <><ArrowUpIcon /> Show less </> : <> <ArrowDownIcon />Show more</>}
                        </div>
                    )}
                    {currentUserRequests.length < 1 && (
                        <div className="lack-of-data mt-3">
                            You don't have any time-off rquests
                        </div>)}
                </div>
            </div>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title className='fw-bolder'>Request Time Off</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form >
                        <Form.Group>
                            <Form.Label>Date Range</Form.Label>
                            <DateRangePicker onApply={handleApply} initialSettings={{ minDate: { tomorrow } }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    readOnly
                                    value={displayDateValue()}
                                />
                            </DateRangePicker>
                        </Form.Group>

                        <Form.Group className='mt-3'>
                            <Form.Label>Note</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder='Enter note'
                            />
                        </Form.Group>

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleClose} variant='secondary'>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </Modal.Footer>
            </Modal>
            {showAlert && (
                <Alert variant="success" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                    Time off request submitted successfully!
                </Alert>
            )}
        </MainLayout>
    )
}
