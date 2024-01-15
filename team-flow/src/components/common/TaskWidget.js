import React, { useState, useRef, useEffect } from 'react'
import { ReactComponent as ExclamationIcon } from '../../assets/exclamation.svg'
import { ReactComponent as DotsIcon } from '../../assets/ellipsis-vertical.svg'
import { ReactComponent as CalendarIcon } from '../../assets/calendar-filled.svg'
import { ReactComponent as ArrowUpIcon } from '../../assets/arrow-up.svg'
import { ReactComponent as ArrowDownIcon } from '../../assets/arrow-down.svg'
import { deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { Button, Dropdown, Form, Modal } from 'react-bootstrap'
import AvatarMini from './AvatarMini'
import { useAuth } from '../../contexts/AuthContext'

export default function TaskWidget({ task, teamId }) {

    function getPriorityClass(priority) {
        switch (priority) {
            case 'high':
                return 'text-danger';
            case 'medium':
                return 'text-warning';
            case 'low':
                return 'text-success';
            default:
                return '';
        }
    }
    const priorityClass = getPriorityClass(task.priority);

    const calculateTaskStatus = () => {
        const currentTimestamp = new Date().getTime();
        const deadlineTimestamp = new Date(task.deadline.seconds * 1000).getTime();

        const allSubtasksCompleted = task.subtasks.every(subtask => subtask.isCompleted);
        const hasSubtasks = task.subtasks.length > 0;

        if (!hasSubtasks) {
            if (currentTimestamp > deadlineTimestamp) return 'Late'
            if (currentTimestamp <= deadlineTimestamp) return 'In progress'
        }

        if (allSubtasksCompleted) {
            return 'Done';
        } else if (currentTimestamp > deadlineTimestamp) {
            return 'Late';
        } else if (!hasSubtasks || currentTimestamp <= deadlineTimestamp) {
            return 'In progress';
        }
    };

    const taskStatus = calculateTaskStatus();
    const stateClass = getStateClass(taskStatus);

    function getStateClass(state) {
        switch (state) {
            case 'Late':
                return 'task-late';
            case 'In progress':
                return 'task-in-progress';
            case 'Done':
                return 'task-done';
            default:
                return '';
        }
    }

    const convertTimestampToDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) {
            return 'Nieokreślona data'; // lub inna domyślna wartość
        }
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateCompletedPercentage = () => {
        const totalSubtasks = task.subtasks.length;
        if (totalSubtasks === 0) {
            return 0; // Jeśli nie ma subtasków, zwróć 0%
        }
        const completedSubtasks = task.subtasks.filter(subtask => subtask.isCompleted).length;
        return (completedSubtasks / totalSubtasks) * 100;
    };

    const completedPercentage = calculateCompletedPercentage();

    const deadlineDate = convertTimestampToDate(task.deadline);

    function truncateDescription(description, maxLength = 200) {
        if (description.length > maxLength) {
            return description.substring(0, maxLength) + '...';
        }
        return description;
    }
    const truncatedDescription = truncateDescription(task.description);


    return (
        <div className='task-item p-3 rounded-4'>
            <div className='d-flex justify-content-between mb-3' >
                <div className='d-flex gap-3'>
                    <span className='d-inline-flex align-items-center gap-1 task-priority'>
                        <ExclamationIcon className={`exclamation-icon ${priorityClass}`} />
                        <span><span className='text-capitalize'>{task.priority}</span> priority</span>
                    </span>
                    <div className='d-flex align-items-center gap-1 task-progress'>
                        <span className={`progress-icon ${stateClass}`}></span>
                        <span>{taskStatus}</span>
                    </div>
                </div>
                <div className='d-flex align-items-center gap-2 deadline-text'>
                    <CalendarIcon />
                    <span>{deadlineDate}</span>
                </div>
            </div>

            <div>
                <span className='fw-bolder h4'>{task.title}</span>
                <div className='subtitle'>{truncatedDescription}</div>
            </div>
            <div className='mt-2 d-flex align-items-center gap-3'>
                <div className='progress' style={{ maxWidth: "350px" }}>
                    <div className="progress-bar bg-primary" style={{ width: `${completedPercentage}%` }}></div>
                </div>
                <span className='progress-number'>{calculateCompletedPercentage().toFixed(0)}%</span>
                <div className=' d-flex align-items-center no-outline'>
                    {task.assignedUsers.slice(0, 3).map((user) => (
                        <AvatarMini key={user} userId={user} />
                    ))}
                    {task.assignedUsers.length > 3 && (
                        <span className='ps-2 num-of-hidden-users'>+{task.assignedUsers.length - 3}</span>
                    )}
                </div>
            </div>
        </div>
    )
}
