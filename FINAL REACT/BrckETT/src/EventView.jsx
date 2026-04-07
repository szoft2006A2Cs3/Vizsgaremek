import { useState, useEffect, use } from "react";
import "./css/Calendar.css";
import EventAdd from "./EventAdd";

export default function EventView({ date, events, setEvents, onBack, callAPIFunc, selectedSchedule, createNewBlockFunc, updateBlockFunc }) {
    const key = `${date.year}-${date.month}-${date.day}`;

    const [formData,setFormData] = useState({
        blockId:0,
        timeStart : 0,
        timeEnd : 0,
        eventName : '',
        priority : '1',
        date: new Date(date.year, date.month - 1, date.day),
        description : ''
    });

    useEffect(() => {console.log(events)}, [events]);

    const [popUpState, setPopUpState] = useState("hidden");
    const [popUpStateUpdate, setPopUpStateUpdate] = useState("hidden");
    const [eventToUpdateId, setEventToUpdateId] = useState(null);

    const updateEvent = (id) => {
        const eventToUpdate = events.find(ev => ev.blockId === id);
        if (eventToUpdate) {
            setFormData({
                timeStart: eventToUpdate.timeStart,
                timeEnd: eventToUpdate.timeEnd,
                eventName: eventToUpdate.title,
                priority: eventToUpdate.priority,
                date: new Date(date.year, date.month - 1, date.day),
                description: eventToUpdate.description
            });
        }
        setEventToUpdateId(id);
        setPopUpStateUpdate("visible");
    };
    const updateFinalize = (id) => 
        {

            console.log(id);
            setPopUpStateUpdate("hidden");
            const updatedEvent = {
                blockId: id,
                date: `${date.year}-${(date.month).toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}T00:00:00`,
                timeStart: formData.timeStart,
                timeEnd: formData.timeEnd,
                title: formData.eventName,
                priority: `${formData.priority}`,
                description: formData.description,
            };
            let updatedEvents = events
            for(let elem in updatedEvents)
                {
                    if(updatedEvents[elem].blockId === id)
                    {
                        updatedEvents[elem] = updatedEvent;
                    }
                }
            setEvents(updatedEvents);
            console.log(events);
            // Itt kellene meghívni a backend API-t, hogy elmentsük a frissített eseményt
            updateBlockFunc(updatedEvent);
        }

    const addEvent = () => {
        const newEvent = {
            blockId: 0,
            date: new Date(date.year, date.month - 1, date.day+1),
            timeStart: formData.timeStart,
            timeEnd: formData.timeEnd,
            title: formData.eventName,
            priority: `${formData.priority}`,
            description: formData.description,
        };
        setEvents([...events, newEvent]);
        setPopUpState("hidden");

        // Itt kellene meghívni a backend API-t, hogy elmentsük az új eseményt
        createNewBlockFunc(newEvent);
    };

    const deleteEvent = (id) => {
        const updated = events.filter(ev =>
            !(ev.blockId === id &&
              ev.date === `${date.year}-${(date.month).toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}T00:00:00`)
        );
        setEvents(updated);

        // Itt kellene meghívni a backend API-t, hogy töröljük az eseményt
        callAPIFunc.callApiAsync("AdvancedInfo/DeleteBlock", "DELETE", null, true, `${callAPIFunc._token}/${selectedSchedule.scheduleId}/${id}`);
    };

    const monthNames = {0:"Január",1:"Február",2:"Március",3:"Április",4:"Május",5:"Június",6:"Július",7:"Augusztus",8:"Szeptember",9:"Október",10:"November",11:"December"}
    const dateObj = new Date(date.year, date.month - 1, date.day);
    const dayName = dateObj.toLocaleDateString("hu-HU", { weekday: "long" });

    const dayEvents = events
        .filter(ev =>
            ev.date === `${date.year}-${(date.month).toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}T00:00:00`
        )
        .sort((a, b) => a.timeStart - b.timeStart);
        
    



    function minutesToTime(minutes) {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }


        
    return (
        <div className="DayviewContainer">

            <div className="CalendarNav">
                <div className="CalendarBtn" onClick={onBack}>◀ Back</div>

                <div style={{ fontSize: 20, fontWeight: "bold" }}>
                    {date.year}. {monthNames[date.month - 1]} {date.day}. {dayName}
                </div>

                <div className="PlusBtn" onClick={() => setPopUpState(popUpState === "visible" ? "hidden" : "visible")}>+</div>
            </div>

            <div className="CalendarEvents">
                {dayEvents.map((ev) => (
                    <div key={ev.blockId} className="CalendarEventItem">
                        <span className={`CalendarEventPriorityDot priority-${ev.priority}`} />
                        {minutesToTime(ev.timeStart)} - {minutesToTime(ev.timeEnd)} &nbsp; {ev.title}
                        <span
                            className="UpdateBtn"
                            onClick={() => updateEvent(ev.blockId)}
                        >
                            Edit
                        </span>
                        
                        <span
                            className="DeleteBtn"
                            onClick={() => deleteEvent(ev.blockId)}
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
                {popUpStateUpdate === "visible" && (
                    <EventAdd
                        formData={formData}
                        setFormData={setFormData}
                        updateEventFunc={() => updateFinalize(eventToUpdateId)}
                        onCancel={() => setPopUpStateUpdate("hidden")}
                    />
                )}
            </div>
        </div>
    );
}