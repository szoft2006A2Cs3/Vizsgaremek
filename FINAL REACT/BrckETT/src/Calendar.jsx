import { useState } from "react";
import "./css/Calendar.css";

export default function Calendar({ onSelectDate, callAPIFunc, selectedSchedule }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const monthNames = {0:"Január",1:"Február",2:"Március",3:"Április",4:"Május",5:"Június",6:"Július",7:"Augusztus",8:"Szeptember",9:"Október",10:"November",11:"December"}
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const reset = () => setCurrentDate(new Date());




    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startOffSet = firstDay === 0 ? 6 : firstDay - 1;
    const endOffSet = 7-((startOffSet + daysInMonth) % 7) == 7 ? 0 : 7-((startOffSet + daysInMonth) % 7)

    const days = [];
    for (let i = 0; i < startOffSet; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    for (let e = 1;e <= endOffSet;e++) days.push(null);


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
                        //console.log(index, new Date().getDate());
                        if(day == new Date().getDate() && month == new Date().getMonth()) classname += " highlight";

                        return(
                        <div className={classname}
                            key={index}
                            onClick={() =>
                                day && onSelectDate({ year, month: month + 1, day })

                            }
                        >
                            {day}
                        </div>)
        })}
                </div>
        </div>
    );

}