import Calendar from './Calendar.jsx'
import DayView from './EventView.jsx'
import './css/CalendarView.css'
import { useState } from 'react';


export default function CalendarView({schedulesList}) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState({});
<<<<<<< HEAD
    const [selectedSchedule, setSelectedSchedule] = useState(0);

    function renderScheduleList() {
      const numbers = [1, 2, 3, 4, 5];
=======

    const [selectedSchedule, setSelectedSchedule] = useState(schedulesList[0]);
    const navigate = useNavigate(); 

    //console.log(schedulesList);
    //console.log(activeSchedulesList);
    
    function renderCalendar()
    {
        var res;

        switch(LayoutSettings)
        {
        case "day":
            res = <></>;
            break;
        case "week":
            res = <></>;
            break;
        case "month":
            res = (selectedDate === null ? (
                    <Calendar
                        selectedSchedule={selectedSchedule}
                        events={events}
                        callAPIFunc={callAPIFunc}
                        onSelectDate={setSelectedDate}
                    />
                ) : (
                    <DayView
                        callAPIFunc={callAPIFunc}
                        selectedSchedule={selectedSchedule}
                        date={selectedDate}
                        events={events}
                        setEvents={setEvents}
                        onBack={() => setSelectedDate(null)}
                />));
            break;
        case "year":
            res = <></>;
            break;
        }    

        return res;
    }

    function renderScheduleList() {
>>>>>>> f76390a257aef87bc513786c7fd352c939a563b4

      return (
        <div className="leftSide-list">
          {schedulesList.map(function (schedule, index) {
            return (
              <div key={index} className="leftSide-item" onClick={() => { setSelectedSchedule(schedule) }}>
                {schedule.scheduleInfo}
              </div>
            );
          })}
        </div>
      );
    }

    return (
        <div className='calendarView-container'>
            <div id='render-schedule-list-here' className='calendarView-leftSide'>
                {renderScheduleList()}
            </div>
<<<<<<< HEAD
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
=======



            <div id='render-calendar-here' className='calendarView-rightSide'>
                {renderCalendar()}
>>>>>>> f76390a257aef87bc513786c7fd352c939a563b4
            </div>
        </div>
)}