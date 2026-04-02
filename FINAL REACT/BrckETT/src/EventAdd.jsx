import { useState,useEffect } from "react"


export default function EventAdd({addEventFunc,formData,setFormData, onCancel}) {
    return (
        <div className="overlay">
            <div className="modal">
                <h2>Event Registration</h2>
                {/*Ide majd a username-t adjuk át */}
                {/*Meg kell a description is*/}
                <input
                    type="text"
                    placeholder="Név"
                    readOnly
                    value={formData.name}
                    className="modalDisabledInput"
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="modalRow">
                    <label>Start:</label>
                    <input
                        type="time"
                        value={formData.start}
                        onChange={e => setFormData({ ...formData, start: e.target.value })}
                    />
                </div>
                <div className="modalRow">
                    <label>End:</label>
                    <input
                        type="time"
                        value={formData.end}
                        onChange={e => setFormData({ ...formData, end: e.target.value })}
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
                    <button onClick={addEventFunc} className="modalSaveBtn">Save</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}