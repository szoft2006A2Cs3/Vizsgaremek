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

    const [createScheduleInfo, setCreateScheduleInfo] = useState("");
    const [createTemplateInfo, setCreateTemplateInfo] = useState("");
    const [editScheduleInfo, setEditScheduleInfo] = useState("");
    const [editTemplateInfo, setEditTemplateInfo] = useState("");

    const [createSchedulePopup, setCreateSchedulePopup] = useState("hidden");
    const [editSchedulePopup, setEditSchedulePopup] = useState("hidden");

    const [selectedSchedule, setSelectedSchedule] = useState(schedulesList[0]);
    const navigate = useNavigate(); 

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    useEffect(() => {
        if (schedulesList.length > 0) {
            const currentSelected = schedulesList.find(s => s.scheduleId === selectedSchedule?.scheduleId) || schedulesList[0];
            setSelectedSchedule(currentSelected);
        } else {
            setSelectedSchedule(null);
        }
    }, [schedulesList]);

    useEffect(() => {
        console.log(selectedSchedule)
        if (fromDate && toDate && selectedSchedule) {
            getBlocksFromTo();
            console.log("FromDate: " + fromDate);
            console.log("ToDate: " + toDate);
        }
    }, [fromDate, toDate, selectedSchedule]);
    //Ezzel a useeffectel kellene a pontokat berenderelni
    useEffect(() => {console.log(events)}, [events]);

    async function getBlocksFromTo() {
        if (!selectedSchedule) {
            setEvents([]);
            return;
        }
        const params = callAPIFunc._token + "/" + selectedSchedule.scheduleId + "/" + fromDate + "/" + toDate;
        let result = await callAPIFunc.callApiAsync("AdvancedInfo/BlocksInRange", "GET", null, true, params);
        // A backend formátumát átalakítani a fenti egységes event formára, ha kell
        setEvents(result[0] || []);
    }
    async function UpdateSchedule(schedule) {
        let url = "AdvancedInfo";
        let params = null;
        if (selectedGroupId == null) {
            url += "/userUpdate";
            params = callAPIFunc._token;
        } else {
            url += "/scheduleUpdate";
            params = callAPIFunc._token + "/" + selectedGroupId;
        }
        params += "/" + selectedSchedule.scheduleId;
        await callAPIFunc.callApiAsync(url, "PUT", schedule, true, params);
        await fetchUserDataFunc();

    }

    async function CreateNewSchedule(schedule) {
        let url = "AdvancedInfo";
        let params = null;
        //console.log("Selected Group ID:", selectedGroupId);
        if (selectedGroupId == null) {
            url += "/userCreate";
            params = callAPIFunc._token;
        } else {
            url += "/scheduleCreate";
            params = callAPIFunc._token + "/" + selectedGroupId;
        }
        await callAPIFunc.callApiAsync(url, "POST", schedule, true, params);
        await fetchUserDataFunc();
    }

    async function DeleteSchedule() {
        await callAPIFunc.callApiAsync("AdvancedInfo/DeleteSchedule", "DELETE", null, false, callAPIFunc._token + "/" + selectedSchedule.scheduleId);
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


    function handleCreateSchedule() 
    {
        CreateNewSchedule({scheduleInfo: createScheduleInfo, templateInfo: createTemplateInfo});
        setCreateSchedulePopup("hidden");
        setCreateScheduleInfo("");
        setCreateTemplateInfo("");
    }
    function handleEditSchedule() 
    {
        UpdateSchedule({scheduleInfo: editScheduleInfo, templateInfo: editTemplateInfo});
        setEditSchedulePopup("hidden");
        setEditScheduleInfo("");
        setEditTemplateInfo("");
    }
    function handleDeleteSchedule()
    {
        DeleteSchedule();
        setEditSchedulePopup("hidden");
        setEditScheduleInfo("");
        setEditTemplateInfo("");
        fetchUserDataFunc();
    }


    useEffect(() => 
        {
            // console.log(selectedSchedule)
            if (selectedSchedule) {
                setEditScheduleInfo(selectedSchedule.scheduleInfo);
                setEditTemplateInfo(selectedSchedule.template.templateInfo);
            }
        }
        , [selectedSchedule]);

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

                <button onClick={() => setCreateSchedulePopup("visible")}>Create New</button>
                <button onClick={() => {setEditSchedulePopup("visible")}}>Edit Selected</button>
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

            {createSchedulePopup === "visible" && <div className="popup-overlay">
                <div className="popup-content hard-blur">
                    <h2>Create New Schedule</h2>
                    <input type="text" placeholder="Schedule Info" value={createScheduleInfo} onChange={(e) => setCreateScheduleInfo(e.target.value)} />
                    <input type="text" placeholder="Template Info" value={createTemplateInfo} onChange={(e) => setCreateTemplateInfo(e.target.value)} />
                    <div className='sch-edit-inputs'>
                        <button onClick={() => handleCreateSchedule()}>Create</button>
                        <button onClick={() => setCreateSchedulePopup("hidden")}>Cancel</button>
                    </div>
                    
                </div>
            </div>}

            {editSchedulePopup === "visible" && <div className="popup-overlay">
                <div className="popup-content hard-blur">
                    <h2>Edit Schedule</h2>
                    <input type="text" placeholder="Schedule Info" value={editScheduleInfo} onChange={(e) => setEditScheduleInfo(e.target.value)} />
                    <input type="text" placeholder="Template Info" value={editTemplateInfo} onChange={(e) => setEditTemplateInfo(e.target.value)} />
                    <button onClick={() => handleDeleteSchedule()} className='sch-dlt-btn'>Delete</button>
                    
                    <div className='sch-edit-inputs'>
                        <button onClick={() => handleEditSchedule()}>Save</button>
                        <button onClick={() => setEditSchedulePopup("hidden")}>Cancel</button>
                    </div>
                </div>
            </div>}

        </div>
    );
}