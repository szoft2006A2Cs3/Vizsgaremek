import Calendar from './Calendar.jsx'
import DayView from './DayView.jsx'
import './css/CalendarView.css'
import { useState, useEffect, use } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


export default function CalendarView({schedulesList, callAPIFunc, LayoutSettings}) {
    const location = useLocation();
    schedulesList = location.state?.schedulesList || schedulesList;
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState({});

    const [selectedSchedule, setSelectedSchedule] = useState(schedulesList[0]);
    const navigate = useNavigate();

    //console.log(schedulesList);
    //console.log(activeSchedulesList);
    

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


    function renderScheduleList() {


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
                {res}
            </div>
        </div>
)}