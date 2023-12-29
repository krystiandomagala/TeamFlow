import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserTeamData } from '../../contexts/TeamContext';
import useTeamExists from '../../hooks/useTeamExists';
import AvatarMini from './AvatarMini'
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import ShiftManager from '../common/ShiftManager';
import { DragDropContext } from '@hello-pangea/dnd';

const Calendar = () => {
    const [currentMoment, setCurrentMoment] = useState(moment());
    const [view, setView] = useState('week'); // 'week' lub 'month'
    const [teamUsers, setTeamUsers] = useState([]); // Przechowuj dane użytkowników z zespołu
    const { getTeamData } = useUserTeamData();
    const { teamId } = useTeamExists();


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
                    <button onClick={() => setView('month')} className="btn btn-outline-primary">Month View</button>
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

    const renderWeekView = () => {
        const daysOfWeek = renderDaysOfWeek();
        const today = moment(); // Dzisiejsza data
        const startOfWeek = currentMoment.clone().startOf('isoWeek'); // Data rozpoczęcia widoku tygodnia

        return (
            <table className="table table-bordered">
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
                                >
                                    {dayName}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {teamUsers.map((employee, index) => (
                        <tr key={index}>
                            <td>
                                <div className='d-flex align-items-center gap-2'>
                                    <div>
                                        {<AvatarMini userId={employee.uid} />}
                                    </div>
                                    <div style={{ fontWeight: "500" }}>
                                        {employee.fullName}
                                    </div>
                                </div>
                            </td>
                            {new Array(7).fill(null).map((_, dayIndex) => {
                                const currentDay = startOfWeek.clone().add(dayIndex, 'days');
                                const isToday = currentDay.isSame(today, 'day');

                                return (
                                    <td
                                        key={dayIndex}
                                        className={isToday ? 'today' : ''}
                                    >
                                        {/* Shift info here */}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderMonthView = () => {
        const startDay = currentMoment.clone().startOf('month').startOf('isoWeek');
        const endDay = currentMoment.clone().endOf('month').endOf('isoWeek');
        const today = moment();
        let day = startDay.clone();
        const days = [];

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
            <table className="table table-bordered table-month-view flex-grow-1">
                <thead>
                    <tr>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName) => (
                            <th ey={dayName}>{dayName}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 5 }).map((_, weekIndex) => (
                        <tr key={weekIndex}>
                            {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map(day => (
                                <td
                                    key={day.format('YYYY-MM-DD')}
                                    className={
                                        day.isSame(today, 'day') ? 'today' :
                                            !day.isSame(currentMoment, 'month') ? 'text-muted' : ''
                                    }
                                >
                                    {day.format('D')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className='mt-2 flex-grow-1 d-flex flex-column'>
            {renderCalendarHeader()}
            {view === 'week' ? renderWeekView() : renderMonthView()}
            <ShiftManager />
        </div>
    );
};

export default Calendar;
