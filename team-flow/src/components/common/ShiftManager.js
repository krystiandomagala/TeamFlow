import React, { useState, useEffect } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import useTeamExists from '../../hooks/useTeamExists';
import { db } from '../../firebase';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

function ShiftManager() {
    const [shifts, setShifts] = useState([]);
    const [newShift, setNewShift] = useState({ name: '', startTime: '', endTime: '' });
    const [error, setError] = useState('');
    const { teamId } = useTeamExists();

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
            setError('Start Time and End Time are required to add a shift');
            return;
        }

        // If the name field is empty, use "shift" as the default name
        const shiftToAdd = {
            ...newShift,
            name: newShift.name.trim() === '' ? 'Shift' : newShift.name
        };

        const teamRef = db.collection('teams').doc(teamId);
        teamRef.collection('shifts').add(shiftToAdd)
            .then(() => {
                setShifts([...shifts, shiftToAdd]);
                setNewShift({ name: '', startTime: '', endTime: '' }); // Reset form
                setError(''); // Clear any existing errors
            })
            .catch(error => {
                setError('Error adding shift: ' + error.message);
            });
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(shifts);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setShifts(items);
    };

    return (
        <div className='d-flex gap-4'>
            <div>
                <h2>Add New Shift</h2>
                <p className='subtitle'>
                    Create shifts
                </p>
                <Form>
                    <Form.Group>
                        <Form.Label>Shift Label</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            placeholder="Enter shift name"
                            value={newShift.name}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group className='mt-3'>
                        <Form.Label>Shift Start</Form.Label>
                        <Form.Control
                            type="time"
                            name="startTime"
                            value={newShift.startTime}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group className='mt-3'>
                        <Form.Label>Shift End</Form.Label>
                        <Form.Control
                            type="time"
                            name="endTime"
                            value={newShift.endTime}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={addShift} className='mt-3'>Add Shift</Button>
                    {error && (
                        <Alert variant="warning" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                            {error}
                        </Alert>
                    )}
                </Form>
            </div>
            <div className='d-flex flex-column'>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="shifts">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className='d-flex flex-column'
                            >
                                {shifts.map((shift, index) => (
                                    <Draggable key={shift.id} draggableId={shift.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`shift-item py-2 my-1 rounded-3 ${snapshot.isDragging ? 'dragging' : ''}`}
                                                style={{ ...provided.draggableProps.style, padding: "0 15px" }}
                                            >
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
                </DragDropContext>
            </div>
        </div>
    );
}

export default ShiftManager;

// #FF9A1F
// #00D370