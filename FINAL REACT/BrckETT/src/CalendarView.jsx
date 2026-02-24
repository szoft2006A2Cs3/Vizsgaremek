import Calendar from './Calendar.jsx'
import DayView from './DayView.jsx'
import './css/CalendarView.css'
import { useState } from 'react';


export default function CalendarView({schedulesList}) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState({});
    const [selectedSchedule, setSelectedSchedule] = useState(0);




    return (
        <div className='calendarView-container'>
            <div className='calendarView-leftSide'>
                
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