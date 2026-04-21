import { useState,useEffect } from "react"
import "./css/EventAdd.css";

export default function EventAdd({addEventFunc,formData,setFormData, onCancel, updateEventFunc}) {
    function convertTimeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    function convertMinutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
    let res = addEventFunc ? addEventFunc : updateEventFunc;

    


    return (
        <div className="overlay">
            <div className="modal">
                <h2>Event Registration</h2>
                {/*Ide majd a username-t adjuk át */}
                {/*Meg kell a description is*/}
                <div className="modalRow">
                    <label>Start:</label>
                    <input
                        type="time"
                        value={convertMinutesToTime(formData.timeStart)}
                        onChange={e => {
                            const newStart = convertTimeToMinutes(e.target.value);
                            // Cap start time to 23:54 (1434 minutes)
                            const cappedStart = Math.min(newStart, 1434);
                            // If end time is not at least 5 minutes more than start, adjust it
                            const newEnd = Math.max(formData.timeEnd, cappedStart + 5);
                            setFormData({ ...formData, timeStart: cappedStart, timeEnd: newEnd });
                        }} 
                    />
                </div>
                <div className="modalRow">
                    <label>End:</label>
                    <input
                        type="time"
                        value={convertMinutesToTime(formData.timeEnd)}
                        onChange={e => {
                            const newEnd = convertTimeToMinutes(e.target.value);
                            // Ensure end is at least 5 minutes more than start
                            const validEnd = Math.max(newEnd, formData.timeStart + 5);
                            setFormData({ ...formData, timeEnd: validEnd });
                        }}
                    />
                </div>
                <input
                    type="text"
                    placeholder="Esemény neve"
                    value={formData.eventName}
                    onChange={e => setFormData({ ...formData, eventName: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Leírás"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                <label>Priority:</label>
                <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                >
                    <option value={1}>Important</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Low</option>
                </select>
                <div className="modalButtonGroup">
                    <button onClick={res} className="modalSaveBtn">Save</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}