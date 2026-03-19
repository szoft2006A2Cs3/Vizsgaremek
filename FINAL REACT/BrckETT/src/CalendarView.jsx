import Calendar from './Calendar.jsx'
import EventView from './EventView.jsx'
import './css/CalendarView.css'
import CalendarDayView from './CalendarDayView.jsx';
import CalendarWeekView from './CalendarWeekView.jsx';
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
    const [events, setEvents] = useState([]);

    const [selectedSchedule, setSelectedSchedule] = useState(schedulesList[0]);
    const navigate = useNavigate(); 


    //Ezekbe a változókba kell hogy mitől, meddig kérje le a blokkokat (setter fügvényekkel, lehet LiftUpState-tel is)
    const [fromDate, setFromDate] = useState((new Date().getFullYear() +" - " + (new Date().getMonth()+1) + " - " + new Date().getDate()));
    const [toDate, setToDate] = useState((new Date().getFullYear() +" - " + (new Date().getMonth()+1) + " - " + new Date().getDate()));
    

    //UseEffect, ha változik a from/to Date
    useEffect(() => 
        {
            getBlocksFromTo();
        }, [fromDate, toDate, selectedSchedule])
    //Lekérdezi, a megadott schedule-hez, a megadott intervallumban lévő blokkokat, és beállítja azokat az events-be
    async function getBlocksFromTo() {
        const params = callAPIFunc._token + "/" + selectedSchedule.scheduleId + "/" + fromDate+ "/" + toDate;
        let result = await callAPIFunc.callApiAsync("AdvancedInfo/BlocksInRange", "GET", null, true, params)
        setEvents(result);
        console.log(result);
    }


    //A bemeneti schedule-t feltölti a backend-re, majd frissíti a userData-t (Group nézetben, a csoporthoz köti az új Schedule-t, egyéni nézetben a User-hoz)
    //schedule --->  {scheduleInfo: "string", templateInfo: "string"}
    async function CreateNewSchedule(schedule) 
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
        await callAPIFunc.callApiAsync(url, "POST", schedule, true, params)

        //Frissíti a userData-t, (LiftUpState)
        await fetchUserDataFunc();
    }

    //A bemeneti block-ot feltölti a backend-re, majd frissíti az events useState-et 
    //block ---> {"blockId": 0, "date": "2026-02-26", "description": "string", "priority": "string", "timeStart": 0, "timeEnd": 0, "title": "string", "IsIgnored": false}
    async function CreateBlock(block) {
        const params = callAPIFunc._token + "/" + selectedSchedule.scheduleId;
        await callAPIFunc.callApiAsync("AdvancedInfo/blockCreate", "POST", block, true, params)
        getBlocksFromTo();
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
            res = <CalendarWeekView events={events}></CalendarWeekView>;
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

            <button onClick={() => CreateNewSchedule({"scheduleInfo": "string", "templateInfo": "string"})}>Create New</button>
            <button onClick={() => CreateBlock({"blockId": 0, "date": "2026-02-27", "description": "string", "priority": "string", "timeStart": 0, "timeEnd": 0, "title": "string", "IsIgnored": false})}></button>
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