import { useState } from "react"


export default function EventAdd({addEventFunc,formData,setFormData, onCancel}) {
    

    return (
        <div className="overlay">
            <div className="modal">
                <h2>Esemény rögzitése</h2>
                <input type="text" placeholder="Név" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}></input>
                <div className="modalRow">
                    <label>Kezdet:</label>
                    <input type="time" value={formData.start} onChange={e => setFormData({ ...formData, start: e.target.value })}></input>
                </div>
                <div className="modalRow">
                    <label>Vég:</label>
                    <input type="time" value={formData.end} onChange={e => setFormData({ ...formData, end: e.target.value })}></input>
                </div>
                <input type="text" placeholder="Esemény neve" value={formData.eventName} onChange={e => setFormData({ ...formData, eventName: e.target.value })}></input>
                <input type="text" value="" readOnly className="modalDisabledInput"></input>
                <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
                <div className="modalButtonGroup">
                    <button onClick={addEventFunc} className="modalSaveBtn">Mentés</button>
                    <button onClick={onCancel}>Mégse</button>
                </div>
            </div>
        </div>
    )
}