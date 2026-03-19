import { useState,useEffect } from "react";
import "./css/Calendar.css";

export default function Calendar({ onSelectDate, callAPIFunc, selectedSchedule, events, onRangeChange }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const monthNames = { 0: "Január", 1: "Február", 2: "Március", 3: "Április", 4: "Május", 5: "Június", 6: "Július", 7: "Augusztus", 8: "Szeptember", 9: "Október", 10: "November", 11: "December" }
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
        return events.filter(ev =>
            ev.year === year &&
            ev.month === (month + 1) &&
            ev.day === day
        );
    }

    function getPriorityClass(priority) {
        switch (priority) {
            case 1: return 'priority-1';
            case 2: return 'priority-2';
            case 3: return 'priority-3';
            default: return '';
        }
    }

    return (
        <div className="Inner-Calendar-Wrapper">
            <h1>{selectedSchedule.scheduleInfo}</h1>

            <header className="CalendarHeader">
                <div className="CalendarNav">
                    <div className="CalendarBtn" onClick={prevMonth} id="previousBtn">◀ Előző</div>
                    <div id="currentSelectedMonthHeader" className="CalendarBtnReset" onClick={reset}>{year}. {monthNames[month]}</div>
                    <div className="CalendarBtn" onClick={nextMonth} id="nextBtn">Következő ▶</div>
                </div>
            </header>

            <div className="CalendarWeekdays">
                <div>Hétfő</div>
                <div>Kedd</div>
                <div>Szerda</div>
                <div>Csütörtök</div>
                <div>Péntek</div>
                <div>Szombat</div>
                <div>Vasárnap</div>
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
                                {dayEvents.map(ev => (
                                    <div
                                        key={ev.id}
                                        className={`CalendarDayEventDot ${getPriorityClass(ev.priority)}`}
                                    />
                                ))}
                            </div>
                        </div>)
                })}
            </div>
        </div>
    );
}