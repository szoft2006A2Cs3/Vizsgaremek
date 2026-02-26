import { useState } from 'react';
import './css/CalendarDayView.css';

let dayViewHours = [
  1,2,3,4,5,6,7,8,9,10,11,12,
  13,14,15,16,17,18,19,20,21,22,23,24
];

let monthList = [
  "január","február","március","április","május","június",
  "július","augusztus","szeptember","október","november","december"
];

let weekDays = [
  "vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"
];

function CalendarDayView(){

  const [date, setDate] = useState(new Date());

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

  function handleHourClick(h){
    alert(h + ":00");
  }

  return(
    <div className='CalendarDayView-root'>
      
      <div className='CalendarDayView-Header'>
        <button className='CalendarDayView-Prev' onClick={prevDay}>Previous</button>

        <h2 className='CalendarDayView-Date'>
          {year + ". " + monthString + " " + day + ". " + weekDayString}
        </h2>

        <button className='CalendarDayView-Next' onClick={nextDay}>Next</button>
      </div>

      <div className='CalendarDayView-Body'>
        {dayViewHours.map(h => (
          <div 
            key={h} 
            className='CalendarDayView-HourRow'
            onClick={() => handleHourClick(h)}
          >
            <div className='CalendarDayView-HourLabel'>{h}:00</div>
            <div className='CalendarDayView-HourContent'></div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default CalendarDayView;