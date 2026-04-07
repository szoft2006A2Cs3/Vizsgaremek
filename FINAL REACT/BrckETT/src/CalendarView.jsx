import Calendar from './Calendar.jsx'
import EventView from './EventView.jsx'
import './css/CalendarView.css'
import CalendarDayView from './CalendarDayView.jsx';
import CalendarWeekView from './CalendarWeekView.jsx';
import { useState, useEffect, use } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


export default function CalendarView({schedulesList, callAPIFunc, LayoutSettings, userData, fetchUserDataFunc}) {
    const location = useLocation();
    let selectedGroupId = location.state?.selectedGroupId || null;
    if (selectedGroupId != null) {
        schedulesList = userData.groups.find(g => g.groupId == location.state.selectedGroupId).schedules;
    }

    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]); //egységes event objektumokhoz

    const [selectedSchedule, setSelectedSchedule] = useState(schedulesList[0]);
    const navigate = useNavigate(); 

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    useEffect(() => {
        if (fromDate && toDate) {
            getBlocksFromTo();
            console.log("FromDate: " + fromDate);
            console.log("ToDate: " + toDate);
        }
    }, [fromDate, toDate, selectedSchedule]);
    //Ezzel a useeffectel kellene a pontokat berenderelni
    useEffect(() => {console.log(events)}, [events]);

    async function getBlocksFromTo() {
        const params = callAPIFunc._token + "/" + selectedSchedule.scheduleId + "/" + fromDate + "/" + toDate;
        let result = await callAPIFunc.callApiAsync("AdvancedInfo/BlocksInRange", "GET", null, true, params);
        // A backend formátumát átalakítani a fenti egységes event formára, ha kell
        setEvents(result[0]);
    }

    async function CreateNewSchedule(schedule) {
        let url = "AdvancedInfo";
        let params = null;
        //console.log("Selected Group ID:", selectedGroupId);
        if (selectedGroupId == null) {
            url += "/userCreate";
            params = callAPIFunc._token;
        } else {
            url += "/groupCreate";
            params = callAPIFunc._token + "/" + selectedGroupId;
        }
        await callAPIFunc.callApiAsync(url, "POST", schedule, true, params);
        await fetchUserDataFunc();
    }

    //A bemeneti block-ot feltölti a backend-re, majd frissíti az events useState-et 
    //block ---> {"blockId": 0, "date": "2026-02-26", "description": "string", "priority": "string", "timeStart": 0, "timeEnd": 0, "title": "string", "IsIgnored": false}
    async function CreateBlock(block) {
        const params = callAPIFunc._token + "/" + selectedSchedule.scheduleId;
        await callAPIFunc.callApiAsync("AdvancedInfo/blockCreate", "POST", block, true, params);
        getBlocksFromTo();
    }

    async function UpdateBlock(block) {
        const params = callAPIFunc._token + "/" + selectedSchedule.scheduleId + "/" + block.blockId;
        await callAPIFunc.callApiAsync("AdvancedInfo/blockUpdate", "PUT", block, true, params);
        getBlocksFromTo();
    }



    function handleRangeChange(from, to) {
        const fmt = d => `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
        setFromDate(fmt(from));
        setToDate(fmt(to));
    }

    function renderCalendar() {
        if (selectedDate !== null) {
            return (
                <EventView
                    callAPIFunc={callAPIFunc}
                    selectedSchedule={selectedSchedule}
                    date={selectedDate}
                    events={events}
                    setEvents={setEvents}
                    createNewBlockFunc={CreateBlock}
                    updateBlockFunc={UpdateBlock}
                    onBack={() => setSelectedDate(null)}
                />
            );
        }

        switch (LayoutSettings) {
            case "day":
                return (
                    <CalendarDayView
                        events={events}
                        onSelectDate={setSelectedDate}
                        onRangeChange={handleRangeChange}
                    />
                );
            case "week":
                return (
                    <CalendarWeekView
                        events={events}
                        onSelectDate={setSelectedDate}
                        onRangeChange={handleRangeChange}
                    />
                );
            case "month":
                return (
                    <Calendar
                        selectedSchedule={selectedSchedule}
                        events={events}
                        callAPIFunc={callAPIFunc}
                        onSelectDate={setSelectedDate}
                        onRangeChange={handleRangeChange}
                    />
                );
            case "year":
                return <></>;
        }
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
                
            </div>
        );
    }

    return (
        <div className='calendarView-container'>
            <div className='calendarView-leftSide'>
                {renderScheduleList()}
            </div>

            <div className='calendarView-rightSide'>
                {renderCalendar()}
            </div>
        </div>
    );
}