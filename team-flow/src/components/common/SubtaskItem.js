import React, { useState } from 'react'
import { Dropdown } from 'react-bootstrap';
import { ReactComponent as DotsIcon } from '../../assets/ellipsis-vertical.svg'

export default function SubtaskItem({ subtask, index, updateSubtask, removeSubtask }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(subtask.name);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        updateSubtask(index, editedName);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <div className='subtask-item align-items-center justify-content-between gap-2'>
            {isEditing ? (
                <>
                    <input
                        type="text"
                        className='form-control'
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                    />
                    <div className='d-flex gap-3 mx-2'>
                        <span className='subtask-btn text-danger' onClick={handleCancel}>Cancel</span>
                        <span className='subtask-btn text-primary' onClick={handleSave}>Save</span>
                    </div>

                </>
            ) : (
                <>
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
                </>
            )}


        </div>
    );
}
