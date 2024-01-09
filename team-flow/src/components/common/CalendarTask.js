import React, { useState } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ReactComponent as ExclamationIcon } from '../../assets/exclamation.svg'
import AvatarMini from './AvatarMini';
export default function CalendarTask({ task }) {

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

    const formatDate = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('pl-PL', {
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

    // Tooltip z dodatkowymi informacjami o zadaniu
    const renderTooltip = (props) => (
        <Tooltip id="task-tooltip" {...props} className="tooltip-left-align">
            <div className='tooltip-inner d-flex gap-2 mt-2' style={{ width: '250px' }}>
                <div className='d-inline-flex align-items-center gap-1 task-priority'>
                    <ExclamationIcon className={`exclamation-icon ${priorityClass}`} />
                </div>
                <div className='d-flex align-items-center gap-1 task-progress'>
                    <span className={`progress-icon ${stateClass}`}></span>
                </div>
            </div>
            <div className='tooltip-inner'><strong className='h6'>Title</strong> <div>{task.title}</div></div>
            <div className='tooltip-inner'><strong className='h6'>Deadline</strong> <div>{formatDate(task.deadline)}</div></div>
            <div className='tooltip-inner'><strong className='h6'>Description</strong><div>{task.description}</div></div>
            <div className='tooltip-inner mt-1'>
                <div className='progress' style={{ maxWidth: "350px" }}>
                    <div className="progress-bar bg-primary" style={{ width: `${completedPercentage}%` }}></div>
                </div>
                <span className='progress-number'>{calculateCompletedPercentage().toFixed(0)}%</span>
            </div>
            <div className='tooltip-inner d-flex align-items-center mb-2'>
                {task.assignedUsers.slice(0, 3).map((user) => (
                    <AvatarMini key={user} userId={user} />
                ))}
                {task.assignedUsers.length > 3 && (
                    <span className='ps-2 num-of-hidden-users'>+{task.assignedUsers.length - 3}</span>
                )}

            </div>
        </Tooltip>
    );

    return (
        <OverlayTrigger
            placement="top"
            overlay={renderTooltip}
        >
            <div className='task-item-calendar rounded-2' style={{ padding: '0.3rem 0.5rem' }}>
                <span>{task.title}</span>
            </div>
        </OverlayTrigger>
    )
}
