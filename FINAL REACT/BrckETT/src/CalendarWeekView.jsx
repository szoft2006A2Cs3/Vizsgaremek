import { useState } from "react";
import "./css/CalendarWeekView.css";

function CalendarWeekView() {

    const [currentDate, setCurrentDate] = useState(new Date());

    function getWeekDays(date) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // vasárnap

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        return days;
    }

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

    function openEventViewAlert() {
        alert("EventView csatolást csináld meg és annak a kinézetét is!!!!!!!!!!");
    }

    const weekDays = getWeekDays(currentDate);

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
                            onClick={openEventViewAlert}
                        >
                            <div className="CalendarWeekViewDayHeader">
                                {day.toLocaleString("hu-HU", { weekday: "long" })}
                                <br />
                                {day.getFullYear()}.{day.getMonth()+1}.{day.getDate()}
                            </div>

                            <div className="CalendarWeekViewDayHours">
                                {Array.from({ length: 24 }).map(function(_, hour) {
                                    return (
                                        <div key={hour} className="CalendarWeekViewHourCell">
                                            {hour}:00
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

export default CalendarWeekView;