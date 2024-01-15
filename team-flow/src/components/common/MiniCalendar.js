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
    const [error, setError] = useState('');
    const [calendarShifts, setCalendarShifts] = useState({});
    const [ooos, setOOOs] = useState([]); // Dodaj ten stan w komponencie
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

    const [shiftItemWidth, setShiftItemWidth] = useState(0);
    const tdRef = useRef(null); // Ref dla komórki tabeli

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
            const dayOfMonth = currentDate.format('D');

            daysOfWeek.push(
                <span key={i} className='d-flex align-items-center text-center gap-2'>
                    <div>
                        <span className="">{dayOfMonth}</span>
                    </div>
                </span>
            );
        }

        return daysOfWeek;
    };


    const renderWeekView = () => {
        const daysOfWeek = renderDaysOfWeek();
        const today = moment(); // Dzisiejsza data
        const startOfWeek = currentMoment.clone().startOf('isoWeek'); // Data rozpoczęcia widoku tygodnia

        return (<>
            <table className="table table-bordered table-week-view-mini">
                <thead>
                    <tr>
                        <th>Team members</th>
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
                        return (
                            <tr key={employee.uid}>
                                <td>
                                    <div className='d-flex align-items-center gap-2'>
                                        <div style={{ fontWeight: "500" }}>
                                            {employee.fullName}
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
                                                        <div className="hours">All day</div>
                                                    </div>) : (
                                                        <>

                                                            {shiftItem && (
                                                                <div className={`shift-item py-2 my-1 rounded-3`} style={{ padding: "0 15px", opacity: isDatePast(dayDate) && !isEditMode ? 0.5 : 1 }}>
                                                                    {isEditMode && (<div className="remove-icon" onClick={() => removeItem('shiftId')}><CrossIcon /></div>)}
                                                                    <div className='hours'>{shiftItem.startTime} - {shiftItem.endTime}</div>
                                                                </div>
                                                            )}

                                                            {oooItem && (
                                                                <div className={`ooo shift-item py-2 my-1 rounded-3`} style={{ padding: "0 15px", opacity: isDatePast(dayDate) && !isEditMode ? 0.5 : 1 }}>
                                                                    {isEditMode && (<div className="remove-icon" onClick={() => removeItem('oooId')}><CrossIcon /></div>)}
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
        </>
        );
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
            <table className="table table-bordered table-month-view-mini overflow-auto">
                <thead>
                    <tr>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => (
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

    return (
        <DragDropContext>
            <div className='d-flex flex-column'>
                {renderCalendarHeader()}
                {view === 'week' ? renderWeekView() : renderMonthView()}
            </div>
        </DragDropContext>
    );
};

export default Calendar;


