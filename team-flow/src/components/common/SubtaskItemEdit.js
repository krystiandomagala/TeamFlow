import React, { useEffect, useState } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import Select from 'react-select';
import { ReactComponent as DotsIcon } from '../../assets/ellipsis-vertical.svg';

export default function SubtaskItem({ subtask, index, updateSubtask, removeSubtask, assignedUsers }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(subtask.name);
    const [tempAssignedSubtaskUsers, setTempAssignedSubtaskUsers] = useState(subtask.assignedUsers || []); // tymczasowy stan dla przypisanych użytkowników
    const [assignedSubtaskUsers, setAssignedSubtaskUsers] = useState(subtask.assignedUsers || []); // aktualny stan przypisanych użytkowników
    const [isCompleted, setIsCompleted] = useState(subtask.isCompleted);

    useEffect(() => {
        setIsCompleted(subtask.isCompleted);
    }, [subtask]);

    useEffect(() => {
        // Filtruj subtask.assignedUsers, aby zachować tylko tych użytkowników, którzy są w assignedUsers
        const filteredAssignedUsers = subtask.assignedUsers.filter(userId =>
            assignedUsers.some(assignedUser => assignedUser.value === userId)
        );

        // Dopasuj przefiltrowanych użytkowników z selectedUsers
        const matchedUsers = filteredAssignedUsers.map(userId => {
            const matchedUser = assignedUsers.find(user => user.value === userId);
            return matchedUser || { value: userId, label: 'Nieznany użytkownik' };
        });

        setAssignedSubtaskUsers(matchedUsers);
        setTempAssignedSubtaskUsers(matchedUsers);
    }, [subtask.assignedUsers, assignedUsers]);

    const handleEdit = () => {
        setIsEditing(true);
        setTempAssignedSubtaskUsers(assignedSubtaskUsers); // inicjalizacja tymczasowego stanu
    };

    console.log(tempAssignedSubtaskUsers)

    const handleSave = () => {
        const idsForUpdate = tempAssignedSubtaskUsers.map(user => user.value);
        console.log("Saving subtask with user IDs:", idsForUpdate); // Sprawdź, jakie ID są zapisywane

        // Aktualizacja zadania z nowymi przypisanymi użytkownikami
        updateSubtask(index, editedName, idsForUpdate, isCompleted);

        // Aktualizacja stanu z nowymi przypisanymi użytkownikami
        const updatedAssigned = tempAssignedSubtaskUsers.map(user => {
            const matchedUser = assignedUsers.find(selectedUser => selectedUser.value === user.value);
            return matchedUser || { value: user.value, label: 'Nieznany użytkownik' };
        });

        setAssignedSubtaskUsers(updatedAssigned);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempAssignedSubtaskUsers(assignedSubtaskUsers); // przywrócenie oryginalnego stanu po anulowaniu
        setIsEditing(false);
    };

    const handleSubtaskSelectChange = selectedSubtaskUsers => {
        setTempAssignedSubtaskUsers(selectedSubtaskUsers); // aktualizacja tylko tymczasowego stanu
    };

    return (
        <div className='d-flex flex-column subtask-item gap-2'>
            {isEditing ? (
                <>
                    <div className='d-flex align-items-center gap-2'>
                        <Form.Check
                            checked={isCompleted}
                            onChange={(e) => setIsCompleted(e.target.checked)}
                        />
                        <input
                            type="text"
                            className='form-control'
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                        />
                    </div>
                    <Select
                        isMulti
                        options={assignedUsers}
                        value={tempAssignedSubtaskUsers}
                        onChange={handleSubtaskSelectChange}
                        placeholder="No user assigned"
                        className=''
                    />

                    <div className='d-flex gap-3 mx-2'>
                        <span className='subtask-btn text-danger' onClick={handleCancel}>Cancel</span>
                        <span className='subtask-btn text-primary' onClick={handleSave}>Save</span>
                    </div>
                </>
            ) : (
                <>
                    <div className='d-flex justify-content-between align-items-center'>
                        <Form.Check
                            label={subtask.name}
                            checked={isCompleted}
                            onChange={(e) => setIsCompleted(e.target.checked)}
                            disabled
                        />
                        <Dropdown className='p-0'>
                            <Dropdown.Toggle style={{ backgroundColor: 'transparent', border: 'none', color: 'black' }} className='d-flex align-items-center' bsPrefix='p-0'>
                                <DotsIcon />
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ position: 'absolute' }} >
                                <Dropdown.Item onClick={handleEdit}>Edit</Dropdown.Item>
                                <Dropdown.Item onClick={() => removeSubtask(index)}>Remove</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    {assignedSubtaskUsers.length > 0 ? (<div>
                        {assignedSubtaskUsers.map((user, key) => (
                            <span key={key} className="badge bg-primary me-2">{user.label}</span>
                        ))}
                    </div>) : ''}
                </>
            )}
        </div>
    );
}
