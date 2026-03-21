import { useState,useEffect } from "react"


export default function EventAdd({addEventFunc,formData,setFormData, onCancel}) {
    return (
        <div className="overlay">
            <div className="modal">
                <h2>Esemény rögzítése</h2>
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
                    <label>Kezdet:</label>
                    <input
                        type="time"
                        value={formData.start}
                        onChange={e => setFormData({ ...formData, start: e.target.value })}
                    />
                </div>
                <div className="modalRow">
                    <label>Vég:</label>
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

                <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                >
                    <option value={1}>Fontos</option>
                    <option value={2}>Közepes</option>
                    <option value={3}>Alacsony</option>
                </select>
                <div className="modalButtonGroup">
                    <button onClick={addEventFunc} className="modalSaveBtn">Mentés</button>
                    <button onClick={onCancel}>Mégse</button>
                </div>
            </div>
        </div>
    );
}