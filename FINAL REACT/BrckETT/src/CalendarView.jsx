import Calendar from './Calendar.jsx'
import EventView from './EventView.jsx'
import './css/CalendarView.css'
import CalendarDayView from './CalendarDayView.jsx';
import { useState, useEffect, use } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


export default function CalendarView({schedulesList, callAPIFunc, LayoutSettings, userData, fetchUserDataFunc}) {
    const location = useLocation();
    //Ha state-ban át lett adva selectedGroupId, akkor azt használja, különben null-ra állítja
    let selectedGroupId = location.state?.selectedGroupId || null;
    if(selectedGroupId != null)
        {
            schedulesList = userData.groups.find(g => g.groupId == location.state.selectedGroupId).schedules;
        }
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState({});

    const [selectedSchedule, setSelectedSchedule] = useState(schedulesList[0]);
    const navigate = useNavigate(); 

    
    //A bemeneti schedule-t feltölti a backend-re, majd frissíti a userData-t (Group nézetben, a csoporthoz köti az új Schedule-t, egyéni nézetben a User-hoz)
    async function createNewSchedule(schedule) 
    {
        let url = "AdvancedInfo"
        let params = null;

        if(selectedGroupId == null)
            {
                url += "/userCreate"
                params = callAPIFunc._token;
            }
        else
            {
                url += "/groupCreate";
                params = callAPIFunc._token + "/" + selectedGroupId;
            }
        await callAPIFunc.callApiAsync(url, "POST", {scheduleInfo:"test", templateInfo:"test"}, true, params)

        //Frissíti a userData-t, (LiftUpState)
        await fetchUserDataFunc();
    }


    function renderCalendar()
    {
        var res;

        switch(LayoutSettings)
        {
        case "day":
            res = <CalendarDayView events={events}></CalendarDayView>;
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
                    <EventView
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
        <div className='leftSide'>
            <div className="leftSide-list">
            {schedulesList.map(function (schedule, index) {
                return (
                <div key={index} className="leftSide-item" onClick={() => { setSelectedSchedule(schedule) }}>
                    {schedule.scheduleInfo}
                </div>
                
                );
            })}
            </div>

            <button onClick={createNewSchedule}>Create New</button>
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