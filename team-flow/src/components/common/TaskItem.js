import React, { useState, useRef, useEffect } from 'react'
import { ReactComponent as ExclamationIcon } from '../../assets/exclamation.svg'
import { ReactComponent as DotsIcon } from '../../assets/ellipsis-vertical.svg'
import { ReactComponent as CalendarIcon } from '../../assets/calendar-filled.svg'
import { ReactComponent as ArrowUpIcon } from '../../assets/arrow-up.svg'
import { ReactComponent as ArrowDownIcon } from '../../assets/arrow-down.svg'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { Button, Dropdown, Form, Modal } from 'react-bootstrap'
import AvatarMini from './AvatarMini'
import { useAuth } from '../../contexts/AuthContext'

export default function TaskItem({ task, teamId }) {

    const [isExpanded, setIsExpanded] = useState(false);
    const [maxHeight, setMaxHeight] = useState(0);
    const contentRef = useRef(null);
    const { currentUser } = useAuth()
    const isPinnedByCurrentUser = task.pinned.includes(currentUser.uid);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleRemoveClick = () => {
        setShowConfirmModal(true);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
    };

    const confirmRemoveTask = async () => {
        const taskRef = doc(db, 'teams', teamId, 'tasks', task.id);
        try {
            await deleteDoc(taskRef);
            console.log('Task successfully removed');
            setShowConfirmModal(false);
        } catch (error) {
            console.error('Error removing task: ', error);
        }
    };

    const togglePinTask = async () => {
        const taskRef = doc(db, 'teams', teamId, 'tasks', task.id);
        try {
            const updatedPinned = isPinnedByCurrentUser
                ? task.pinned.filter(uid => uid !== currentUser.uid) // Usuń ID użytkownika
                : [...task.pinned, currentUser.uid]; // Dodaj ID użytkownika

            await updateDoc(taskRef, { pinned: updatedPinned });
            console.log('Task pin state changed successfully');
        } catch (error) {
            console.error('Error changing task pin state: ', error);
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        if (contentRef.current) {
            setMaxHeight(isExpanded ? contentRef.current.scrollHeight : 0);
        }
    }, [isExpanded]);

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

    function getStateClass(state) {
        switch (state) {
            case 'late':
                return 'task-late';
            case 'in progress':
                return 'task-in-progress';
            case 'done':
                return 'task-done';
            default:
                return '';
        }
    }
    const stateClass = getStateClass(task.state);

    const convertTimestampToDate = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateCompletedPercentage = () => {
        const totalSubtasks = task.subtasks.length;
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
        <div className='task-item p-3 rounded-4 my-2 '>
            <div className='d-flex justify-content-between mb-3' >
                <div className='d-flex gap-3'>
                    <span className='d-inline-flex align-items-center gap-1 task-priority'>
                        <ExclamationIcon className={`exclamation-icon ${priorityClass}`} />
                        <span><span className='text-capitalize'>{task.priority}</span> priority</span>
                    </span>
                    <div className='d-flex align-items-center gap-1 task-progress'>
                        <span className={`progress-icon ${stateClass}`}></span>
                        <span>In progress</span>
                    </div>
                </div>
                <Dropdown>
                    <Dropdown.Toggle style={{ backgroundColor: 'transparent', border: 'none' }} bsPrefix='p-0'>
                        <DotsIcon />
                    </Dropdown.Toggle>
                    <Dropdown.Menu >
                        <Dropdown.Item>Edit</Dropdown.Item>
                        <Dropdown.Item onClick={togglePinTask}> {isPinnedByCurrentUser ? 'Unpin' : 'Pin'}</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleRemoveClick}>Remove</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Removal</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to remove this task?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseConfirmModal}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmRemoveTask}>
                            Remove
                        </Button>
                    </Modal.Footer>
                </Modal>

            </div>
            <div className='mb-2 d-flex align-items-center gap-2 deadline-text'>
                <CalendarIcon />
                <span>{deadlineDate}</span>
            </div>
            <div>
                <span className='fw-bolder h4'>{task.title}</span>
                <div className='subtitle'>{truncatedDescription}</div>
            </div>
            <div className='mt-2 d-flex align-items-center gap-3'>
                <div className='progress' style={{ maxWidth: "350px" }}>
                    <div className="progress-bar bg-primary" style={{ width: `${completedPercentage}%` }}></div>
                </div>
                <span className='progress-number'>{completedPercentage.toFixed(0)}%</span>
            </div>
            <div className='mt-1 d-flex align-items-center mt-3'>
                {task.assignedUsers.slice(0, 3).map((user) => (
                    <AvatarMini key={user} userId={user} />
                ))}
                {task.assignedUsers.length > 3 && (
                    <span className='ps-2 num-of-hidden-users'>+{task.assignedUsers.length - 3}</span>
                )}

            </div>
            <div ref={contentRef} style={{ maxHeight: `${maxHeight}px`, overflow: 'hidden', transition: 'max-height 0.15s ease' }}>
                {isExpanded && (
                    <div className='mt-3'>
                        <h5>Subtasks</h5>
                        {task.subtasks.map((subtask, index) => (
                            <div key={index}>
                                <Form.Check
                                    type="checkbox"
                                    label={subtask.name}
                                    checked={subtask.isCompleted}
                                    disabled={true}
                                />

                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className='d-flex justify-content-end me-1 show-less-more' onClick={toggleExpand}>
                {isExpanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </div>
        </div>
    )
}
