import Calendar from './Calendar.jsx'
import DayView from './EventView.jsx'
import './css/CalendarView.css'
import { useState } from 'react';


export default function CalendarView({schedulesList}) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState({});

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



            <div id='render-calendar-here' className='calendarView-rightSide'>
                {renderCalendar()}
            </div>
        </div>
)}