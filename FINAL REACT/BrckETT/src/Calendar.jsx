import { useState,useEffect } from "react";
import "./css/Calendar.css";

export default function Calendar({ onSelectDate, callAPIFunc, selectedSchedule, events, onRangeChange }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const monthNames = { 0: "January", 1: "February", 2: "March", 3: "April", 4: "May", 5: "June", 6: "July", 7: "August", 8: "September", 9: "October", 10: "November", 11: "December" }
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        onRangeChange(first, last);
    }, [currentDate]);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const reset = () => setCurrentDate(new Date());

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startOffSet = firstDay === 0 ? 6 : firstDay - 1;
    const endOffSet = 7 - ((startOffSet + daysInMonth) % 7) == 7 ? 0 : 7 - ((startOffSet + daysInMonth) % 7)

    const days = [];
    for (let i = 0; i < startOffSet; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    for (let e = 1; e <= endOffSet; e++) days.push(null);

    function getEventsForDay(day) {
        if (!day) return [];
        const key = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00`;
        const dayEvents = events.filter(ev => ev.date === key);
        
        //console.log(key);
        //console.log(dayEvents);

        return dayEvents;
    }

    function getPriorityClass(priority) {
        switch (priority) {
            case '1': return 'priority-1';
            case '2': return 'priority-2';
            case '3': return 'priority-3';
            default: return '';
        }
    }
    function drawDots(dayEvents)
    {
        //console.log(dayEvents);
        if(dayEvents.length <= 3 && dayEvents.length > 0){
            //console.log(dayEvents);
        return dayEvents.map(ev => (
            <div
                key={ev.blockId}
                className={`CalendarDayEventDot ${getPriorityClass(ev.priority)}`}
            />
    ))}
    else if(dayEvents.length > 3)
        {
            let list = [];
            for(let i = 0; i < 3; i++)
            {
                list.push(
                    <div
                    key={i}
                    className={`CalendarDayEventDot ${getPriorityClass(dayEvents[i].priority)}`}
                    />
                )  
            }
            list.push(<div className="CalendarDotPlus">+</div>);
            return list;
        }
    }



    return (
        <div className="Inner-Calendar-Wrapper">
            <h1>{selectedSchedule.scheduleInfo}</h1>

            <header className="CalendarHeader">
                <div className="CalendarNav">
                    <div className="CalendarBtn" onClick={prevMonth} id="previousBtn">◀ Previous</div>
                    <div id="currentSelectedMonthHeader" className="CalendarBtnReset" onClick={reset}>{year}. {monthNames[month]}</div>
                    <div className="CalendarBtn" onClick={nextMonth} id="nextBtn">Next ▶</div>
                </div>
            </header>

            <div className="CalendarWeekdays">
                <div>Monday</div>
                <div>Tuesday</div>
                <div>Wednesday</div>
                <div>Thursday</div>
                <div>Friday</div>
                <div>Saturday</div>
                <div>Sunday</div>
            </div>
            <div className="Calendar">
                {days.map((day, index) => {

                    let classname = "CalendarDiv";
                    if (day == new Date().getDate() && month == new Date().getMonth()) classname += " highlight";

                    const dayEvents = getEventsForDay(day);

                    return (
                        <div className={classname}
                            key={index}
                            onClick={() =>
                                day && onSelectDate({ year, month: month + 1, day })
                            }
                        >
                            <div className="CalendarDayNumber">{day}</div>
                            <div className="CalendarDayEvents">
                                {drawDots(dayEvents)}
                            </div>
                        </div>)
                })}
            </div>
        </div>
    );
}