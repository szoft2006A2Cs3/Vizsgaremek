import { useState } from "react";
import "./css/Calendar.css";

export default function DayView({ date, events, setEvents, onBack }) {
    const key = `${date.year}-${date.month}-${date.day}`;

    const addEvent = () => {
        const updated = { ...events };
        if (!updated[key]) updated[key] = [];
        updated[key].push("Új esemény.");
        setEvents(updated);
    };

    const deleteEvent = (index) => {
        const updated = { ...events };
        updated[key].splice(index, 1);
        setEvents(updated);
    };

    const dateObj = new Date(date.year, date.month - 1, date.day);
    const dayName = dateObj.toLocaleDateString("hu-HU", { weekday: "long" });

    return (
        <div className="DayviewContainer">

            <div className="CalendarNav">
                <div className="CalendarBtn" onClick={onBack}>◀ Vissza</div>

                <div style={{ fontSize: 20, fontWeight: "bold" }}>
                    {date.year}.{date.month}.{date.day}. {dayName}
                </div>

                <div className="PlusBtn" onClick={addEvent}>+</div>
            </div>

            <div className="CalendarEvents">
                {(events[key] || []).map((ev, index) => (
                    <div key={index} className="CalendarEventItem">
                        {ev}
                        <span
                            className="DeleteBtn"
                            onClick={() => deleteEvent(index)}
                        >
                            🗑
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}