import Calendar from './Calendar.jsx'
import DayView from './DayView.jsx'
import './css/CalendarView.css'
import { useState } from 'react';


export default function CalendarView() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState({});




    return (
        <div className='calendarView-container'>
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
)}