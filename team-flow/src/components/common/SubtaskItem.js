import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import Select from 'react-select';
import { ReactComponent as DotsIcon } from '../../assets/ellipsis-vertical.svg';

export default function SubtaskItem({ subtask, index, updateSubtask, removeSubtask, selectedUsers }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(subtask.name);
    const [tempSelectedSubtaskUser, setTempSelectedSubtaskUser] = useState(subtask.assignedUsers || []); // tymczasowy stan dla przypisanych użytkowników
    const [selectedSubtaskUser, setSelectedSubtaskUser] = useState(subtask.assignedUsers || []); // aktualny stan przypisanych użytkowników

    const handleEdit = () => {
        setIsEditing(true);
        setTempSelectedSubtaskUser(selectedSubtaskUser); // inicjalizacja tymczasowego stanu
    };

    const handleSave = () => {
        updateSubtask(index, editedName, tempSelectedSubtaskUser);
        setSelectedSubtaskUser(tempSelectedSubtaskUser); // aktualizacja głównego stanu po zapisaniu
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempSelectedSubtaskUser(selectedSubtaskUser); // przywrócenie oryginalnego stanu po anulowaniu
        setIsEditing(false);
    };

    const handleSubtaskSelectChange = selectedSubtaskUsers => {
        setTempSelectedSubtaskUser(selectedSubtaskUsers); // aktualizacja tylko tymczasowego stanu
    };

    return (
        <div className='d-flex flex-column subtask-item gap-2'>
            {isEditing ? (
                <>
                    <input
                        type="text"
                        className='form-control'
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                    />
                    <Select
                        isMulti
                        options={selectedUsers}
                        value={tempSelectedSubtaskUser}
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
                        <li>{subtask.name}</li>
                        <Dropdown className='p-0'>
                            <Dropdown.Toggle style={{ backgroundColor: 'transparent', border: 'none' }} className='d-flex align-items-center' bsPrefix='p-0'>
                                <DotsIcon />
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ position: 'absolute' }} >
                                <Dropdown.Item onClick={handleEdit}>Edit</Dropdown.Item>
                                <Dropdown.Item onClick={() => removeSubtask(index)}>Remove</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    {selectedSubtaskUser.length > 0 ? (<div>
                        {selectedSubtaskUser.map(user => (
                            <span key={user.value} className="badge bg-primary me-2">{user.label}</span>
                        ))}
                    </div>) : ''}

                </>
            )}
        </div>
    );
}
