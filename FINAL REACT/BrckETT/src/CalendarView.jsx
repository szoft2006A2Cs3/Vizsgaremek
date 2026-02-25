import Calendar from './Calendar.jsx'
import DayView from './EventView.jsx'
import './css/CalendarView.css'
import { useState } from 'react';


export default function CalendarView({schedulesList}) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState({});
    const [selectedSchedule, setSelectedSchedule] = useState(0);

    function renderScheduleList() {
      const numbers = [1, 2, 3, 4, 5];

      return (
        <div className="leftSide-list">
          {numbers.map(function (num, index) {
            return (
              <div key={index} className="leftSide-item">
                {num}
              </div>
            );
          })}
        </div>
      );
    }

    return (
        <div className='calendarView-container'>
            <div className='calendarView-leftSide'>
                {renderScheduleList()}
            </div>
            <div className='calendarView-rightSide'>
                {selectedDate === null ? (
                    <Calendar
                        events={events}
                        onSelectDate={setSelectedDate}
                    />
                ) : (
                    <DayView
                        date={selectedDate}
                        events={events}
                        setEvents={setEvents}
                        onBack={() => setSelectedDate(null)}
                />)}
            </div>
        </div>
)}