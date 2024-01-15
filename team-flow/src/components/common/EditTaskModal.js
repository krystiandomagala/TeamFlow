import React, { useState, useRef, useEffect } from 'react'
import { ReactComponent as ExclamationIcon } from '../../assets/exclamation.svg'
import { ReactComponent as DotsIcon } from '../../assets/ellipsis-vertical.svg'
import { ReactComponent as CalendarIcon } from '../../assets/calendar-filled.svg'
import { ReactComponent as ArrowUpIcon } from '../../assets/arrow-up.svg'
import { ReactComponent as ArrowDownIcon } from '../../assets/arrow-down.svg'
import { deleteDoc, doc, updateDoc, Timestamp, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { Button, Dropdown, Form, Modal, ModalBody, ModalFooter } from 'react-bootstrap'
import AvatarMini from './AvatarMini'
import { useAuth } from '../../contexts/AuthContext'
import ToggleSwitch from '../common/ToggleSwitch'
import Select from 'react-select';
import { useUser } from '../../contexts/UserContext'
import SubtaskItemEdit from './SubtaskItemEdit'
import useTeamExists from '../../hooks/useTeamExists'
import { UserTeamDataProvider, useUserTeamData } from '../../contexts/TeamContext'


export default function EditTaskModal({ show, handleClose: close, task }) {
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [taskDeadline, setTaskDeadline] = useState('');
    const [priority, setPriority] = useState();
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [teamUsers, setTeamUsers] = useState([]);
    const { currentUser } = useAuth()
    const [modalPage, setModalPage] = useState(1);
    const [subtaskInput, setSubtaskInput] = useState('');

    const { getUserData } = useUser()
    const { teamId } = useTeamExists()
    const { getTeamData } = useUserTeamData()


    const removeSubtask = (indexToRemove) => {
        setSubtasks(subtasks.filter((_, index) => index !== indexToRemove));
    };

    useEffect(() => {
        const fetchTeamData = async () => {
            if (teamId) {
                const teamData = await getTeamData(teamId);
                if (teamData && teamData.memberIds) {
                    const userOptions = await Promise.all(
                        teamData.memberIds.map(async userId => {
                            const userData = await getUserData(userId);
                            return {
                                value: userId,
                                label: userData.fullName, // Załóżmy, że każdy użytkownik ma pole fullName
                            };
                        })
                    );

                    setTeamUsers(userOptions);
                }
            }
        };

        fetchTeamData();
    }, [teamId, getUserData]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (task) {

                const deadlineDate = task.deadline && task.deadline.seconds
                    ? new Date(task.deadline.seconds * 1000).toISOString().split('T')[0]
                    : '';
                setTaskDeadline(deadlineDate);

                const userOptions = await Promise.all(
                    task.assignedUsers.map(async userId => {
                        const userData = await getUserData(userId);
                        return {
                            value: userId,
                            label: userData.fullName // Assuming fullName is the property you want
                        };
                    })
                );
                setAssignedUsers(userOptions);

                setTaskTitle(task.title);
                setTaskDescription(task.description);
                setSubtasks(task.subtasks);
                setPriority(task.priority);
            }
        };

        fetchUserData();
    }, [task, getUserData, show]);


    const updateSubtask = (index, newName, newAssignedUsers, newIsCompleted) => {
        setSubtasks(subtasks.map((subtask, subtaskIndex) => {
            if (index === subtaskIndex) {
                // Aktualizacja subtaska z nową listą przypisanych użytkowników
                return { ...subtask, name: newName, assignedUsers: newAssignedUsers, isCompleted: newIsCompleted };
            }
            return subtask;
        }));
    };


    const handleClose = async () => {
        // Resetowanie stanów do wartości początkowych z obiektu task
        if (task) {
            setTaskTitle(task.title);
            setTaskDescription(task.description);
            setSubtasks(task.subtasks);
            let deadlineDate = '';
            if (task.deadline && task.deadline.seconds) {
                const deadlineTimestamp = new Date(task.deadline.seconds * 1000);
                deadlineDate = deadlineTimestamp.toISOString().split('T')[0];
            }
            setTaskDeadline(deadlineDate);
            setPriority(task.priority);
            const userOptions = await Promise.all(
                task.assignedUsers.map(async userId => {
                    const userData = await getUserData(userId);
                    return {
                        value: userId,
                        label: userData.fullName // Assuming fullName is the property you want
                    };
                })
            );
            setAssignedUsers(userOptions);
            setModalPage(1);

        }

        // Zamykanie modalu
        close();
    };

    const handlePriorityChange = (newPriority) => {
        setPriority(newPriority);
    };

    const handleAssignedUsersChange = (selectedUsers) => {
        setAssignedUsers(selectedUsers);
    };

    const addSubtask = () => {
        if (subtaskInput.trim() !== '') {
            setSubtasks([...subtasks, { name: subtaskInput, isCompleted: false, assignedUsers: [] }]);
            setSubtaskInput('');
        }
    };

    const sendTaskUpdateNotifications = async (assignedUserIds, taskData) => {
        try {
            assignedUserIds.forEach(async userId => {
                // Nie wysyłaj powiadomienia do użytkownika, który aktualizuje zadanie
                if (userId !== currentUser.uid) {
                    const notificationRef = collection(db, "teams", teamId, "teamMembers", userId, "notifications");
                    await addDoc(notificationRef, {
                        createdBy: currentUser.uid,
                        title: `Task updated: ${taskData.title}`,
                        createdAt: serverTimestamp(),
                        isRead: false,
                        type: 'task-update',
                        taskId: taskData.id
                    });
                }
            });
        } catch (error) {
            console.error("Error sending task update notifications: ", error);
        }
    };

    // W EditTaskModal
    const handleUpdateTask = async () => {
        const updatedDeadline = taskDeadline ? new Date(taskDeadline) : null;
        const assignedUserIds = assignedUsers.map(user => user.value);


        const filteredSubtasks = subtasks.map(subtask => {
            const filteredUsers = subtask.assignedUsers.filter(userId =>
                assignedUserIds.includes(userId)
            );
            return { ...subtask, assignedUsers: filteredUsers };
        });

        const updatedTask = {
            ...task,
            title: taskTitle,
            description: taskDescription,
            subtasks: filteredSubtasks,
            deadline: updatedDeadline ? Timestamp.fromDate(updatedDeadline) : null,
            priority: priority,
            assignedUsers: assignedUserIds,
        };

        try {
            const taskRef = doc(db, 'teams', teamId, 'tasks', task.id);
            await updateDoc(taskRef, updatedTask);
            console.log('Task updated successfully');
            sendTaskUpdateNotifications(assignedUserIds, updatedTask);

            handleClose(); // Zamknij modal po udanej aktualizacji
        } catch (error) {
            console.error('Error updating task: ', error);
        }
    };


    const goToNextPage = () => {
        setModalPage(2);
    };

    const goBackToFirstPage = () => {
        setModalPage(1);
    };

    const CustomOption = props => {
        return (
            <div {...props.innerProps} className="d-flex align-items-center p-3 task-select-user">
                <AvatarMini userId={props.data.value} alt={props.data.label} style={{ outline: "none" }} />
                <span className="ms-2">{props.data.label}</span>
            </div>
        );
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    modalPage === 1 ? (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter task title"
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter task description"
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Deadline</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={taskDeadline}
                                    onChange={(e) => setTaskDeadline(e.target.value)}
                                />
                            </Form.Group>
                            <ToggleSwitch onChange={handlePriorityChange} initialPriority={priority} />
                            <Select
                                isMulti
                                onChange={handleAssignedUsersChange}
                                value={assignedUsers}
                                options={teamUsers}
                                className="mb-3"
                                placeholder="No users assigned"
                                components={{ Option: CustomOption }}
                            />
                        </Form>) : (
                        <div>
                            <div className='d-flex gap-2 mb-3'>
                                <Form.Group>
                                    <Form.Control
                                        type="text"
                                        value={subtaskInput}
                                        onChange={(e) => setSubtaskInput(e.target.value)}
                                        placeholder="Enter subtask name"
                                    />
                                </Form.Group>
                                <Button onClick={addSubtask}>Add subtask</Button>
                            </div>
                            <ol className='subtask-list-add d-flex gap-2 flex-column pe-2'>
                                {subtasks.map((subtask, index) => (
                                    <SubtaskItemEdit
                                        key={index}
                                        subtask={subtask}
                                        index={index}
                                        updateSubtask={updateSubtask}
                                        removeSubtask={removeSubtask}
                                        assignedUsers={assignedUsers}
                                    />
                                ))}
                            </ol>
                        </div>
                    )
                }
            </Modal.Body>
            <Modal.Footer>
                {
                    modalPage === 1 ? (
                        <>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={goToNextPage}>
                                Next
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={goBackToFirstPage}>
                                Go Back
                            </Button>
                            <Button variant="success" onClick={handleUpdateTask}>
                                Save
                            </Button>
                        </>
                    )
                }

            </Modal.Footer>
        </Modal>
    );
};