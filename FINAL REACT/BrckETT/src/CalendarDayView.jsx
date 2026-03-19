import { useState,useEffect } from 'react';
import './css/CalendarDayView.css';

let dayViewHours = [
  0,1,2,3,4,5,6,7,8,9,10,11,12,
  13,14,15,16,17,18,19,20,21,22,23
];

let monthList = [
  "január","február","március","április","május","június",
  "július","augusztus","szeptember","október","november","december"
];

let weekDays = [
  "vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"
];

function CalendarDayView({ events, onSelectDate, onRangeChange }) {

  const [date, setDate] = useState(new Date());

  useEffect(() => {
    onRangeChange(date, date);
  }, [date]);

  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  let monthString = monthList[month];
  let weekDayString = weekDays[date.getDay()];

  function prevDay(){
    setDate(new Date(year, month, day - 1));
  }

  function nextDay(){
    setDate(new Date(year, month, day + 1));
  }

  function handleDayClick() {
    onSelectDate({ year, month: month + 1, day });
  }

  function getEventsForHour(h) {
    return events.filter(ev =>
      ev.year === year &&
      ev.month === (month + 1) &&
      ev.day === day &&
      parseInt(ev.start.split(':')[0], 10) === h
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

  return(
    <div className='CalendarDayView-root'>
      
      <div className='CalendarDayView-Header'>
        <button className='CalendarDayView-Prev' onClick={prevDay}>Previous</button>

        <h2 className='CalendarDayView-Date' onClick={handleDayClick}>
          {year + ". " + monthString + " " + day + ". " + weekDayString}
        </h2>

        <button className='CalendarDayView-Next' onClick={nextDay}>Next</button>
      </div>

      <div className='CalendarDayView-Body'>
        {dayViewHours.map(h => (
          <div 
            key={h} 
            className='CalendarDayView-HourRow'
          >
            <div className='CalendarDayView-HourLabel'>{h}:00</div>
            <div className='CalendarDayView-HourContent'>
              {getEventsForHour(h).map(ev => (
                <div
                  key={ev.id}
                  className={`CalendarDayView-Event ${getPriorityClass(ev.priority)}`}
                >
                  {ev.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default CalendarDayView;