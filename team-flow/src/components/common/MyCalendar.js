import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserTeamData } from '../../contexts/TeamContext';
import useTeamExists from '../../hooks/useTeamExists';
import AvatarMini from './AvatarMini'
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button, Form, Alert, Modal, Dropdown } from 'react-bootstrap';
import { ReactComponent as CrossIcon } from '../../assets/x.svg'
import { ReactComponent as DotsIcon } from '../../assets/ellipsis-vertical.svg'
import CalendarTask from './CalendarTask';
import { useAuth } from '../../contexts/AuthContext';

const Calendar = () => {
    const [currentMoment, setCurrentMoment] = useState(moment());
    const [view, setView] = useState('week'); // 'week' lub 'month'
    const [teamUsers, setTeamUsers] = useState([]); // Przechowuj dane użytkowników z zespołu
    const [shifts, setShifts] = useState([]);
    const [newShift, setNewShift] = useState({ name: '', startTime: '', endTime: '' });
    const [error, setError] = useState('');
    const [calendarShifts, setCalendarShifts] = useState({});
    const [shiftType, setShiftType] = useState('shift');
    const [ooos, setOOOs] = useState([]); // Dodaj ten stan w komponencie
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const vacationItem = { id: "1", name: "Vacations", type: "vacation" };
    const [tasks, setTasks] = useState([]);
    const [workingHours, setWorkingHours] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { getTeamData, isUserTeamAdmin } = useUserTeamData();
    const { teamId } = useTeamExists();
    const [isAdmin, setIsAdmin] = useState(false);
    const { currentUser } = useAuth()

    useEffect(() => {
        async function fetchData() {
            const adminStatus = await isUserTeamAdmin(teamId);
            setIsAdmin(adminStatus);
        }

        fetchData();
    }, [teamId, getTeamData, isUserTeamAdmin]);

    useEffect(() => {
        const fetchWorkingHours = async () => {
            if (isEditMode) {
                setIsLoading(true);
                const fetchedWorkingHours = {};

                for (const user of teamUsers) {
                    const userWorkingHoursRef = doc(db, 'teams', teamId, 'teamMembers', user.uid, 'workingHours', currentMoment.format('YYYY-MM'));

                    try {
                        const docSnap = await getDoc(userWorkingHoursRef);
                        if (docSnap.exists()) {
                            fetchedWorkingHours[user.uid] = docSnap.data().hours;
                        } else {
                            fetchedWorkingHours[user.uid] = ''; // Brak danych o godzinach pracy
                        }
                    } catch (error) {
                        console.error('Błąd podczas pobierania godzin pracy:', error);
                    }
                }

                setWorkingHours(fetchedWorkingHours);
                setIsLoading(false);
            }
        };

        fetchWorkingHours();
    }, [isEditMode, teamUsers, teamId, currentMoment]);


    const handleWorkingHoursChange = (userId, hours) => {
        setWorkingHours(prev => ({ ...prev, [userId]: hours }));
    };

    const isDatePast = (dateString) => {
        const itemDate = moment(dateString);
        return itemDate.isBefore(moment(), 'day'); // 'day' sprawdza tylko datę bez czasu
    };

    useEffect(() => {
        teamUsers.forEach(user => {
            const userShiftsRef = collection(db, 'teams', teamId, 'teamMembers', user.uid, 'shiftItems');

            getDocs(userShiftsRef).then(snapshot => {
                snapshot.docs.forEach(doc => {
                    const shiftItem = doc.data();
                    const cellId = `${user.uid}_${shiftItem.date}`;

                    setCalendarShifts(prevShifts => ({
                        ...prevShifts,
                        [cellId]: shiftItem
                    }));
                });
            });
        });
    }, [teamId, teamUsers]);

    const sendNewSchedule = async () => {
        teamUsers.forEach(async (user) => {
            if (user.uid !== currentUser.uid) {
                try {
                    const notificationRef = collection(db, 'teams', teamId, 'teamMembers', user.uid, 'notifications');
                    await addDoc(notificationRef, {
                        type: 'schedule',
                        createdBy: currentUser.uid,
                        createdAt: serverTimestamp(),
                        isRead: false
                    });
                } catch (error) {
                    console.error('Error sending notification:', error);
                }
            }
        });
    }

    const finishEditing = async () => {
        Object.entries(calendarShifts).forEach(([cellId, shiftData]) => {
            const [userId, date] = cellId.split('_'); // Zakładając, że cellId to 'userId_date'
            const userShiftsRef = doc(db, 'teams', teamId, 'teamMembers', userId, 'shiftItems', cellId);

            console.log('date: ', date)
            console.log('shiftData: ', shiftData)
            setDoc(userShiftsRef, {
                ...shiftData,
                date: date
            });
        });

        for (const [userId, hours] of Object.entries(workingHours)) {
            const userWorkingHoursRef = doc(db, 'teams', teamId, 'teamMembers', userId, 'workingHours', currentMoment.format('YYYY-MM'));
            try {
                await setDoc(userWorkingHoursRef, { hours: hours || 0 });
            } catch (error) {
                console.error('Błąd podczas zapisywania godzin pracy:', error);
            }
        }

        sendNewSchedule()
    };



    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'teams', teamId, 'tasks'),
            (snapshot) => {
                const tasksData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTasks(tasksData);
            },
            (error) => {
                console.error("Error fetching tasks: ", error);
            }
        );

        return () => unsubscribe(); // Wyczyść nasłuchiwacz podczas odmontowywania komponentu
    }, [teamId]);

    // Inside your Calendar component...
    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const [shiftItemWidth, setShiftItemWidth] = useState(0);
    const tdRef = useRef(null); // Ref dla komórki tabeli

    const toggleEditMode = () => {
        if (!isAdmin) {
            setIsEditMode(false)
            return;
        }
        if (isEditMode) finishEditing()
        setIsEditMode(!isEditMode);
    };

    useEffect(() => {
        const td = tdRef.current;
        if (td) {
            // Funkcja, która aktualizuje stan na podstawie szerokości td
            const updateWidth = () => {
                setShiftItemWidth(td.offsetWidth);
            };

            // Utwórz instancję ResizeObserver
            const resizeObserver = new ResizeObserver(updateWidth);

            // Rozpocznij obserwację elementu td
            resizeObserver.observe(td);

            // Funkcja sprzątająca
            return () => resizeObserver.unobserve(td);
        }
    }, []);
    const handleSelectChange = (e) => {
        setShiftType(e.target.value);
    };

    useEffect(() => {
        const fetchShifts = async () => {
            try {
                const querySnapshot = await db.collection('teams').doc(teamId).collection('shifts').get();
                const fetchedShifts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setShifts(fetchedShifts);
            } catch (error) {
                console.error("Error fetching shifts:", error);
                setError('Failed to load shifts.');
            }
        };

        fetchShifts();
    }, [teamId]);

    useEffect(() => {
        const fetchOOOs = async () => {
            try {
                const querySnapshot = await db.collection('teams').doc(teamId).collection('ooos').get();
                const fetchedOOOs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOOOs(fetchedOOOs);
            } catch (error) {
                console.error("Error fetching OOOs:", error);
                // Obsługa błędów, np. ustawienie komunikatu o błędzie
            }
        };

        // Wywołanie funkcji do pobierania danych
        fetchOOOs();
    }, [teamId]); // Zależności: wywołaj ponownie, gdy teamId się zmienia

    // ... reszta kodu komponentu ...


    const handleInputChange = (e) => {
        setNewShift({ ...newShift, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 2000); // Error message will disappear after 3000 milliseconds (3 seconds)
            return () => clearTimeout(timer);
        }
    }, [error]);

    const addShift = () => {
        if (!newShift.startTime || !newShift.endTime) {
            setError('Start Time and End Time are required');
            return;
        }

        const shiftToAdd = {
            ...newShift,
            name: newShift.name.trim() === '' ? (shiftType === 'shift' ? 'Shift' : 'OOO') : newShift.name.trim(),
            type: shiftType,
            isActive: true
        };

        const collectionRef = db.collection('teams').doc(teamId).collection(shiftType === 'shift' ? 'shifts' : 'ooos');
        collectionRef.add(shiftToAdd)
            .then((docRef) => {
                const newShiftWithId = { id: docRef.id, ...shiftToAdd };
                if (shiftType === 'shift') {
                    setShifts([...shifts, newShiftWithId]);
                } else {
                    setOOOs([...ooos, newShiftWithId]);
                }
                // Reset form and clear errors
                setNewShift({ name: '', startTime: '', endTime: '' });
                setError('');
            })
            .catch(error => {
                setError('Error adding shift: ' + error.message);
            });

        setShowModal(false)
    };


    useEffect(() => {
        // Wywołaj funkcję getTeamData z teamId, aby pobrać dane zespołu
        const fetchTeamUsers = async () => {
            try {
                const teamData = await getTeamData(teamId);
                // Sprawdź, czy istnieje teamData.memberIds i ustaw go jako teamUsers
                if (teamData.memberIds) {
                    // Wywołaj funkcję fetchTeamMembers, aby pobrać dane użytkowników
                    await fetchTeamMembers(teamData.memberIds);
                }
            } catch (error) {
                console.error('Błąd podczas pobierania danych zespołu:', error);
            }
        };

        // Wywołaj funkcję do pobierania danych zespołu
        fetchTeamUsers();
    }, [getTeamData, teamId]);

    async function fetchTeamMembers(memberIds) {
        const membersData = await Promise.all(memberIds.map(async (memberId) => {
            const memberDoc = await getDoc(doc(db, 'users', memberId));
            return memberDoc.data();
        }));
        setTeamUsers(membersData);
    }

    const goToToday = () => {
        setCurrentMoment(moment());
    };

    const next = () => {
        setCurrentMoment(currentMoment.clone().add(1, view));
    };

    const prev = () => {
        setCurrentMoment(currentMoment.clone().subtract(1, view));
    };

    const renderCalendarHeader = () => {
        const dateFormat = view === 'month' ? 'MMMM YYYY' : 'MMM D YYYY';

        let weekRange = ''; // Przedział dat tygodnia

        if (view === 'week') {
            const startOfWeek = currentMoment.clone().startOf('isoWeek');
            const endOfWeek = currentMoment.clone().endOf('isoWeek');

            weekRange = `${startOfWeek.format('MMM D')} - ${endOfWeek.format('MMM D, YYYY')}`;
        }

        return (
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className='d-flex gap-2'>
                    <button onClick={() => setView('week')} className="btn btn-outline-primary">Week View</button>

                    {!isEditMode && (<button onClick={() => setView('month')} className="btn btn-outline-primary">Month View</button>)}
                </div>
                <div>{view === 'week' ? weekRange : currentMoment.format(dateFormat)}</div>
                <div className='d-flex gap-2'>
                    <button onClick={goToToday} className="btn btn-outline-primary">Today</button>
                    <button onClick={prev} className="btn btn-primary d-flex align-items-center justify-content-center"><ChevronLeft /></button>
                    <button onClick={next} className="btn btn-primary d-flex align-items-center justify-content-center"><ChevronRight /></button>
                </div>
            </div>
        );
    };

    const renderDaysOfWeek = () => {
        const daysOfWeek = [];
        const startOfWeek = currentMoment.clone().startOf('isoWeek');

        for (let i = 0; i < 7; i++) {
            const currentDate = startOfWeek.clone().add(i, 'days');
            const dayOfWeek = currentDate.format('ddd');
            const dayOfMonth = currentDate.format('D');
            const month = currentDate.format('MMM');

            daysOfWeek.push(
                <span key={i} className='d-flex align-items-center gap-2'>
                    <div>
                        <span className="calendar-dom">{dayOfMonth}</span>
                    </div>
                    <div className='d-flex flex-column lh-sm'>
                        <span className="calendar-dow">{dayOfWeek}</span>
                        <span className="calendar-month">{month}</span>
                    </div>
                </span>
            );
        }

        return daysOfWeek;
    };

    const calculateTotalShiftHours = (userId) => {
        const startOfMonth = currentMoment.clone().startOf('month');
        const endOfMonth = currentMoment.clone().endOf('month');
        let totalMinutes = 0;

        console.log(calendarShifts)

        Object.entries(calendarShifts).forEach(([cellId, shiftData]) => {
            if (cellId.startsWith(userId) && shiftData.date >= startOfMonth.format('YYYY-MM-DD') && shiftData.date <= endOfMonth.format('YYYY-MM-DD')) {
                const shift = shifts.find(s => s.id === shiftData.shiftId);
                if (shift) {
                    const startTime = moment(shift.startTime, 'HH:mm');
                    const endTime = moment(shift.endTime, 'HH:mm');

                    if (endTime.isBefore(startTime)) {
                        // Przypadek, gdy zmiana przechodzi przez północ
                        totalMinutes += moment.duration(endTime.add(1, 'day').diff(startTime)).asMinutes();
                    } else {
                        totalMinutes += moment.duration(endTime.diff(startTime)).asMinutes();
                    }
                }
            }
        });

        let hours = Math.floor(totalMinutes / 60);
        let minutes = Math.floor(totalMinutes % 60);

        return [hours, minutes];
    };


    const renderWeekView = () => {
        const daysOfWeek = renderDaysOfWeek();
        const today = moment(); // Dzisiejsza data
        const startOfWeek = currentMoment.clone().startOf('isoWeek'); // Data rozpoczęcia widoku tygodnia

        return (<>
            <table className="table table-bordered table-week-view">
                <thead>
                    <tr>
                        <th className='calendar-employees-header'>Team members</th>
                        {daysOfWeek.map((dayName, dayIndex) => {
                            const currentDay = startOfWeek.clone().add(dayIndex, 'days');
                            const isToday = currentDay.isSame(today, 'day');

                            return (
                                <th
                                    key={dayIndex}
                                    className={isToday ? 'today' : ''}
                                    ref={tdRef}
                                >
                                    {dayName}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {teamUsers.map((employee, index) => {

                        const [totalHours, totalMinutes] = calculateTotalShiftHours(employee.uid);
                        const totalShiftMinutes = totalHours * 60 + totalMinutes;
                        const employeeWorkingHoursLimit = parseFloat(workingHours[employee.uid] || 0);
                        const employeeWorkingHoursLimitInMinutes = employeeWorkingHoursLimit * 60;
                        const isOverHours = totalShiftMinutes > employeeWorkingHoursLimitInMinutes;

                        return (
                            <tr key={employee.uid}>
                                <td>
                                    <div className='d-flex align-items-center gap-2'>
                                        <div>
                                            {<AvatarMini userId={employee.uid} />}
                                        </div>
                                        <div style={{ fontWeight: "500" }}>
                                            {employee.fullName}
                                        </div>

                                    </div>
                                    <div className="user-info">
                                        {isEditMode && (
                                            <Form.Group className="my-2">
                                                <Form.Label>Set working hours</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    value={isLoading ? 'Loading' : (workingHours[employee.uid] || '')}
                                                    onChange={(e) => handleWorkingHoursChange(employee.uid, e.target.value)}
                                                    placeholder={isLoading ? 'Loading...' : 'Working hours'}
                                                />
                                            </Form.Group>
                                        )}
                                        {currentMoment.format('MMMM YYYY')}
                                        <div style={{ color: !isLoading && isEditMode && isOverHours ? 'red' : 'inherit' }}>
                                            {`${totalHours}h:${totalMinutes}m`}
                                        </div>
                                    </div>
                                </td>
                                {new Array(7).fill(null).map((_, dayIndex) => {
                                    const dayDate = currentMoment.clone().startOf('isoWeek').add(dayIndex, 'days').format('YYYY-MM-DD');
                                    const cellId = `${employee.uid}_${dayDate}`;
                                    const cellData = calendarShifts[cellId] || {};
                                    const shiftItem = shifts.find(s => s.id === cellData.shiftId);
                                    const oooItem = ooos.find(o => o.id === cellData.oooId);
                                    const isToday = currentMoment.clone().startOf('isoWeek').add(dayIndex, 'days').isSame(today, 'day');

                                    const removeItem = (type) => {
                                        // Update state to remove item from this cell
                                        console.log('removed')
                                        setCalendarShifts(prev => ({
                                            ...prev,
                                            [cellId]: {
                                                ...prev[cellId],
                                                [type]: null,
                                            }
                                        }));
                                    };

                                    return (
                                        <Droppable droppableId={cellId} key={cellId}>
                                            {(provided, snapshot) => (
                                                <td ref={provided.innerRef} {...provided.droppableProps} className={`${isToday ? 'today' : ''} ${snapshot.isDraggingOver ? 'highlight' : ''}`}>
                                                    {cellData.vacationId === vacationItem.id ? (<div className="vacation shift-item py-2 my-1 rounded-3" style={{ padding: "0 15px", opacity: isDatePast(dayDate) && !isEditMode ? 0.5 : 1 }}>
                                                        {isEditMode && (<div className="remove-icon" onClick={() => removeItem('vacationId')}><CrossIcon /></div>)}
                                                        <b>{vacationItem.name}</b>
                                                        <div className="hours">All day</div>
                                                    </div>) : (
                                                        <>

                                                            {shiftItem && (
                                                                <div className={`shift-item py-2 my-1 rounded-3`} style={{ padding: "0 15px", opacity: isDatePast(dayDate) && !isEditMode ? 0.5 : 1 }}>
                                                                    {isEditMode && (<div className="remove-icon" onClick={() => removeItem('shiftId')}><CrossIcon /></div>)}
                                                                    <b>{shiftItem.name}</b>
                                                                    <div className='hours'>{shiftItem.startTime} - {shiftItem.endTime}</div>
                                                                </div>
                                                            )}

                                                            {oooItem && (
                                                                <div className={`ooo shift-item py-2 my-1 rounded-3`} style={{ padding: "0 15px", opacity: isDatePast(dayDate) && !isEditMode ? 0.5 : 1 }}>
                                                                    {isEditMode && (<div className="remove-icon" onClick={() => removeItem('oooId')}><CrossIcon /></div>)}
                                                                    <b>{oooItem.name}</b>
                                                                    <div className='hours'>{oooItem.startTime} - {oooItem.endTime}</div>
                                                                </div>
                                                            )}

                                                        </>
                                                    )}
                                                    {provided.placeholder}
                                                </td>
                                            )}
                                        </Droppable>
                                    );
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {
                isAdmin &&
                (
                    <Button variant="secondary" onClick={toggleEditMode} className='my-2'>
                        {isEditMode ? "Finish Editing" : "Edit Schedule"}
                    </Button>
                )

            }

        </>
        );
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;

        if (source.droppableId === destination.droppableId) {
            const items = Array.from(source.droppableId === 'shifts' ? shifts : source.droppableId === 'ooo' ? ooos : []);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);

            if (source.droppableId === 'shifts') {
                setShifts(items);
            } else if (source.droppableId === 'ooo') {
                setOOOs(items);
            }
        } else {
            // Handle dragging to calendar cells
            const itemId = result.draggableId;
            const cellId = destination.droppableId;
            const itemType = source.droppableId; // 'shifts' or 'ooos'

            setCalendarShifts(prev => {
                // Tworzenie lub aktualizacja wpisu z przeciągniętym elementem
                const updatedShiftData = {
                    // Pobieranie istniejących danych z prev[cellId], jeśli istnieją
                    ...prev[cellId],
                    [itemType === 'shifts' ? 'shiftId' : 'oooId']: itemId,
                    vacationId: itemType === 'vacations' ? vacationItem.id : null,
                    // Przypisanie daty na podstawie cellId
                    date: cellId.split('_')[1] // zakładając, że cellId ma format 'userId_date'
                };

                return { ...prev, [cellId]: updatedShiftData };
            });
        }


        console.log(Object.entries(calendarShifts).length)

        console.log(ooos)
        console.log(shifts)
        console.log(vacationItem)

    };

    const renderMonthView = () => {
        const startDay = currentMoment.clone().startOf('month').startOf('isoWeek');
        const endDay = currentMoment.clone().endOf('month').endOf('isoWeek');
        const today = moment();
        let day = startDay.clone();
        const days = [];

        const dayHasTasks = (day) => {
            // Assuming each task has a 'deadline' property that's a Date object
            return tasks.filter(task => {
                const taskDate = new Date(task.deadline.seconds * 1000); // Convert Firestore timestamp to Date
                return taskDate.toISOString().split('T')[0] === day.format('YYYY-MM-DD');
            });
        };


        while (day.isBefore(endDay, 'day')) {
            days.push(day.clone());
            day.add(1, 'days');
        }

        // Uzupełniamy dni, aby zawsze mieć 5 pełnych tygodni
        const totalDays = 35; // 7 dni x 5 tygodni
        while (days.length < totalDays) {
            days.push(day.clone());
            day.add(1, 'days');
        }

        return (
            <table className="table table-bordered table-month-view">
                <thead>
                    <tr>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName) => (
                            <th key={dayName}>{dayName}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 5 }).map((_, weekIndex) => (
                        <tr key={weekIndex} >
                            {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map(day => {
                                const dayShifts = Object.entries(calendarShifts)
                                    .filter(([key, value]) => key.endsWith(day.format('YYYY-MM-DD')))
                                    .map(([key, value]) => ({ userId: key.split('_')[0], shiftItem: value, oooItem: value, vacationItem: value })); // Assuming the userID is part of the key


                                console.log(dayShifts)
                                return (
                                    <td
                                        key={day.format('YYYY-MM-DD')}
                                        className={
                                            day.isSame(today, 'day') ? 'today' :
                                                !day.isSame(currentMoment, 'month') ? 'text-muted' : ''
                                        }>
                                        {day.format('D')}
                                        <div className="tasks-for-day d-flex flex-column gap-2" style={{ opacity: isDatePast(day) ? 0.5 : 1 }}>
                                            {dayHasTasks(day).map(task => (
                                                <CalendarTask task={task} key={task.id} />
                                            ))}
                                            {dayShifts.map(({ userId, shiftItem }, index) => {
                                                // Find the corresponding shift in the shifts array
                                                const shift = shifts.find(s => s.id === shiftItem.shiftId);
                                                return shift ? (
                                                    <div key={index} className="shift-item p-1 rounded-2 d-flex align-items-center gap-2">
                                                        <AvatarMini userId={userId} />
                                                        <div className='hours'>{shift.startTime} - {shift.endTime}</div>
                                                    </div>
                                                ) : null; // If no matching shift is found, don't render anything
                                            })}
                                            {dayShifts.map(({ oooItem, userId }, index) => {
                                                // Find the corresponding shift in the shifts array
                                                const ooo = ooos.find(s => s.id === oooItem.oooId);
                                                return ooo ? (
                                                    <div key={index} className="shift-item ooo p-1 rounded-2 d-flex align-items-center gap-2">
                                                        <AvatarMini userId={userId} />
                                                        <div className='hours text-center'>{ooo.startTime} - {ooo.endTime}</div>
                                                    </div>
                                                ) : null; // If no matching shift is found, don't render anything
                                            })}
                                            {dayShifts.map(({ vacationItem, userId }, index) => {
                                                // Find the corresponding shift in the shifts array
                                                const vacation = vacationItem.vacationId
                                                return vacation ? (
                                                    <div key={index} className="shift-item vacation p-1 rounded-2 d-flex align-items-center gap-2">
                                                        <AvatarMini userId={userId} />
                                                        <div className='hours text-center'>All day</div>
                                                    </div>
                                                ) : null; // If no matching shift is found, don't render anything
                                            })}
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const removeShift = async (shiftId) => {
        try {
            const shiftRef = doc(db, 'teams', teamId, 'shifts', shiftId);
            await updateDoc(shiftRef, { isActive: false });  // Zarchiwizuj shift

            setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftId));

        } catch (error) {
            console.error("Error archiving shift:", error);
        }
    };

    const removeOOO = async (oooId) => {
        try {
            const OOORef = doc(db, 'teams', teamId, 'ooos', oooId);
            await updateDoc(OOORef, { isActive: false });  // Zarchiwizuj shift

            setOOOs(prevOOOs => prevOOOs.map(ooo => ooo.id === oooId ? { ...ooo, isActive: false } : ooo));
            // Optional: Show success feedback
        } catch (error) {
            console.error("Error removing OOO:", error);
            // Optional: Show error feedback
        }
    };

    const availableShifts = shifts.filter(shift => shift.isActive);
    const availableOOOs = ooos.filter(ooo => ooo.isActive);


    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <div className='mt-2 flex-grow-1 d-flex flex-column overflow-auto pe-3'>
                {renderCalendarHeader()}
                {view === 'week' ? renderWeekView() : renderMonthView()}
                {isEditMode && (

                    <div>
                        <div className='mb-4'>
                            <Button variant="primary" onClick={handleShowModal}>
                                + Add New Shift Item
                            </Button>
                            <Modal show={showModal} onHide={handleCloseModal} centered>
                                <Modal.Header closeButton>
                                    <Modal.Title>Add New Shift Item</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p className='subtitle'>
                                        Create shifts or OOO
                                    </p>
                                    <Form>
                                        <Form.Group className='mt-3'>
                                            <Form.Label>Type</Form.Label>
                                            <Form.Select name="type" value={shiftType} onChange={handleSelectChange}>
                                                <option value="shift">Shift</option>
                                                <option value="ooo">OOO</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className='mt-3'>
                                            <Form.Label>Shift Item Label</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                placeholder="Enter shift item name"
                                                value={newShift.name}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                        <Form.Group className='mt-3'>
                                            <Form.Label>Shift Item Start</Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="startTime"
                                                value={newShift.startTime}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                        <Form.Group className='mt-3'>
                                            <Form.Label>Shift Item End</Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="endTime"
                                                value={newShift.endTime}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                        {error && (
                                            <Alert variant="warning" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                                                {error}
                                            </Alert>
                                        )}
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleCloseModal}>
                                        Close
                                    </Button>
                                    <Button variant="primary" onClick={addShift}>Add {shiftType === 'shift' ? 'Shift' : 'OOO'}</Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                        <div>
                            <div className="divider mb-3 mt-4">
                                <span>
                                    Shifts
                                </span>
                            </div>
                            <Droppable droppableId="shifts" direction='horizontal' isDropDisabled={true}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className='d-flex'
                                    >
                                        {availableShifts.map((shift, index) => (
                                            <Draggable key={shift.id} draggableId={shift.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`shift-item py-2 me-2 rounded-3 ${snapshot.isDragging ? 'dragging' : ''}`}
                                                        style={{
                                                            ...provided.draggableProps.style, padding: "0 15px", width: `${shiftItemWidth - 16}px`
                                                        }}
                                                    >
                                                        <div className="remove-icon" onClick={() => removeShift(shift.id)}><CrossIcon /></div>
                                                        <b>{shift.name}</b>
                                                        <div className='hours'>{shift.startTime} - {shift.endTime}</div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                            <div className="divider mb-3 mt-4">
                                <span>
                                    Out Of Office
                                </span>
                            </div>
                            <Droppable droppableId='ooo' direction='horizontal' isDropDisabled={true}>
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className='d-flex'>
                                        {availableOOOs.map((ooo, index) => (
                                            <Draggable key={ooo.id} draggableId={ooo.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`shift-item py-2 me-2 rounded-3 ooo`}
                                                        style={{
                                                            ...provided.draggableProps.style, padding: "0 15px", width: `${shiftItemWidth - 16}px`
                                                        }}>
                                                        <div className="remove-icon" onClick={() => removeOOO(ooo.id)}><CrossIcon /></div>
                                                        <b>{ooo.name}</b>
                                                        <div className='hours'>{ooo.startTime} - {ooo.endTime}</div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                    </div>
                                )}
                            </Droppable>
                            <div className="divider mb-3 mt-4">
                                <span>
                                    Vacations
                                </span>
                            </div>
                            <Droppable droppableId='vacations' direction='horizontal' isDropDisabled={true}>
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className='d-flex'>
                                        <Draggable draggableId={vacationItem.id} index={1}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className='shift-item py-2 my-1 rounded-3 vacation'
                                                    style={{
                                                        ...provided.draggableProps.style, padding: "0 15px", width: `${shiftItemWidth - 16}px`
                                                    }}>
                                                    <b>{vacationItem.name}</b>
                                                    <div className='hours'>All day</div>
                                                </div>
                                            )}
                                        </Draggable>
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    </div>
                )}

            </div>
        </DragDropContext>
    );
};

export default Calendar;