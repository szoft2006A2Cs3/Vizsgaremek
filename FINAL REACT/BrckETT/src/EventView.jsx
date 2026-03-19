import { useState, useEffect } from "react";
import "./css/Calendar.css";
import EventAdd from "./EventAdd";

export default function EventView({ date, events, setEvents, onBack, callAPIFunc, selectedSchedule}) {
    const key = `${date.year}-${date.month}-${date.day}`;

    const [formData,setFormData] = useState({
        name: '',
        start : '00:00',
        end : '23:59',
        eventName : '',
        priority : 1,
        year: date.year,
        month: date.month,
        day: date.day
    });

    const [popUpState, setPopUpState] = useState("hidden");

    const addEvent = () => {
        const newEvent = {
            id: Date.now(),
            year: formData.year,
            month: formData.month,
            day: formData.day,
            start: formData.start,
            end: formData.end,
            title: formData.eventName,
            priority: formData.priority
        };
        setEvents([...events, newEvent]);
        setPopUpState("hidden");
    };

    const deleteEvent = (id) => {
        const updated = events.filter(ev =>
            !(ev.id === id &&
              ev.year === date.year &&
              ev.month === date.month &&
              ev.day === date.day)
        );
        setEvents(updated);
    };

    const monthNames = {0:"Január",1:"Február",2:"Március",3:"Április",4:"Május",5:"Június",6:"Július",7:"Augusztus",8:"Szeptember",9:"Október",10:"November",11:"December"}
    const dateObj = new Date(date.year, date.month - 1, date.day);
    const dayName = dateObj.toLocaleDateString("hu-HU", { weekday: "long" });

    const dayEvents = events
        .filter(ev =>
            ev.year === date.year &&
            ev.month === date.month &&
            ev.day === date.day
        )
        .sort((a, b) => a.start.localeCompare(b.start));

    return (
        <div className="DayviewContainer">

            <div className="CalendarNav">
                <div className="CalendarBtn" onClick={onBack}>◀ Vissza</div>

                <div style={{ fontSize: 20, fontWeight: "bold" }}>
                    {date.year}. {monthNames[date.month - 1]} {date.day}. {dayName}
                </div>

                <div className="PlusBtn" onClick={() => setPopUpState(popUpState === "visible" ? "hidden" : "visible")}>+</div>
            </div>

            <div className="CalendarEvents">
                {dayEvents.map((ev) => (
                    <div key={ev.id} className="CalendarEventItem">
                        <span className={`CalendarEventPriorityDot priority-${ev.priority}`} />
                        {ev.start} - {ev.end} &nbsp; {ev.title}
                        <span
                            className="DeleteBtn"
                            onClick={() => deleteEvent(ev.id)}
                        >
                            🗑
                        </span>
                    </div>
                ))}
            </div>

            <div id="pop-up-container">
                {popUpState === "visible" && (
                    <EventAdd
                        formData={formData}
                        setFormData={setFormData}
                        addEventFunc={addEvent}
                        onCancel={() => setPopUpState("hidden")}
                    />
                )}
            </div>
        </div>
    );
}