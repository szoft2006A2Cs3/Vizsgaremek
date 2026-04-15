import { useState,useEffect } from "react";
import "./css/CalendarWeekView.css";

function CalendarWeekView({ events, onSelectDate, onRangeChange }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    function getWeekDays(date) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        return days;
    }

    const weekDays = getWeekDays(currentDate);

    useEffect(() => {
        const start = weekDays[0];
        const end = weekDays[6];
        onRangeChange(start, end);
    }, [currentDate]);

    function goToPreviousWeek() {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    }

    function goToNextWeek() {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    }

    function handleDayClick(day) {
        onSelectDate({
            year: day.getFullYear(),
            month: day.getMonth() + 1,
            day: day.getDate()
        });
    }

    function getEventsForDayAndHour(day, hour) {
        const y = day.getFullYear();
        const m = day.getMonth() + 1;
        const d = day.getDate();
        return events.filter(ev =>
            ev.year === y &&
            ev.month === m &&
            ev.day === d &&
            parseInt(ev.start.split(':')[0], 10) === hour
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

    const monthName = currentDate.toLocaleString("hu-HU", { month: "long" });
    const year = currentDate.getFullYear();

    return (
        <div className="CalendarweekViewContainer">

            <div className="CalendarweekViewHeader">
                <button onClick={goToPreviousWeek} className="CalendarWeekViewNavBtn">◀</button>
                <div className="CalendarweekViewHeaderTitle">
                    {year}. {monthName}
                </div>
                <button onClick={goToNextWeek} className="CalendarWeekViewNavBtn">▶</button>
            </div>

            <div className="CalendarWeekViewBody">
                {weekDays.map(function(day, index) {
                    return (
                        <div 
                            key={index} 
                            className="CalendarWeekViewDayColumn"
                            onClick={() => handleDayClick(day)}
                        >
                            <div className="CalendarWeekViewDayHeader">
                                {day.toLocaleString("hu-HU", { weekday: "long" })}
                                <br />
                                {day.getFullYear()}.{day.getMonth()+1}.{day.getDate()}
                            </div>

                            {/* óránkénti sorok helyett 1440 perces grid */}
                            <div className="CalendarWeekView-MinuteGrid">
                                {events
                                    .filter(ev =>
                                        ev.year === day.getFullYear() &&
                                        ev.month === (day.getMonth() + 1) &&
                                        ev.day === day.getDate()
                                    )
                                    .map(ev => (
                                        <div
                                            key={ev.id}
                                            className={`CalendarWeekView-EventBlock ${getPriorityClass(ev.priority)}`}
                                            style={{
                                                gridRowStart: ev.timeStart,
                                                gridRowEnd: ev.timeEnd
                                            }}
                                        >
                                            {ev.title}
                                        </div>
                                    ))}
                            </div>

                        </div>
                    );
                })}
            </div>

        </div>
    );
}

export default CalendarWeekView;
