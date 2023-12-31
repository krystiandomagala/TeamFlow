import React, { useState } from 'react';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

const PriorityToggleSwitch = ({ onChange, initialPriority }) => {
    const [priority, setPriority] = useState(initialPriority || 'medium');

    const handleChange = (val) => {
        setPriority(val);
        if (onChange) {
            onChange(val);
        }
    };

    return (
        <div className="form-group d-flex flex-column mb-3">
            <label htmlFor="priority" className='mb-2'>Priority</label>
            <ToggleButtonGroup type="radio" name="priority" value={priority} onChange={handleChange}>
                <ToggleButton id="tbg-radio-1" value={'low'}>
                    Low
                </ToggleButton>
                <ToggleButton id="tbg-radio-2" value={'medium'}>
                    Medium
                </ToggleButton>
                <ToggleButton id="tbg-radio-3" value={'high'}>
                    High
                </ToggleButton>
            </ToggleButtonGroup>
        </div>
    );
};

export default PriorityToggleSwitch;
