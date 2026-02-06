import useState from "react";
import './Calendar.css'

const getFirstDayofMonth = (year,month) => new Date(year,month, 1).getDay();
const getDaysInMonth = (year,month) => new Date(year,month +1,0).getDate();

const Calendar = () => {
    const [currentDate,setCurrentDate] = useState(new Date());
    const [selectedDate,setSelectedDate] = useState(null);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const todayDateString = `(${year}--)${(month +1).toString().padStart(2, '0')}--(${today.getDate().toString().padStart(2,'0')} `;
    const daysInMonth = getDaysInMonth(year,month);
    const startDayIndex = getFirstDayofMonth(year,month);
    const weekDays = ['V','H','K','Sze','Cs','P','Szo'];
    const monthName = currentDate.toLocaleString('hu-HU',{month: 'long'});
    const displayTitle = `${year}. (${monthName.charAt(0).toUpperCase()+monthName.slice(1)}`;

    function handleDayClick(dateString,day){
        if (selectedDate == dateString){
            alert(`Esemény megnyitása: ${dateString})`)
        }else{
            setSelectedDate(dateString);
            console.log(`Kiválasztva: ${dateString}`);
        }
    }

    const goToPreviousMonth = () =>{
        const prevDate = new Date(year,month-1,1);
        setCurrentDate(prevDate);
        setSelectedDate(null);
    }
    const goToNextMonth = () =>{
        const nextDate = new Date(year,month+1,1);
        setCurrentDate(nextDate);
        setSelectedDate(null);
    }
    //Üres cellák
    const leadingEmptyCells = [];
    for(let i = 0;i < startDayIndex;i++){
        leadingEmptyCells.push(<div key={`empty-${i}`} className="day-cell empty-cell"></div>);
    }
    //Nap cellák
    const dayCells = []
    for (let day = 1;day <= daysInMonth;day++){
        const monthPadded = (month+1).toString().padStart(2,'0');
        const dayPadded = day.toString().padStart(2,'0');
        const dateString = `${year}-- ${monthPadded}-- ${dayPadded}`;
        const isSelected = selectedDate == dateString;
        const isToday = dateString == todayDateString;

        dayCells.push(
            <div 
                key={day}
                className={`day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                data-date = {dateString}
                onClick={() => handleDayClick(dateString,day)}
            >
                <span className="day-number">{day}</span>
            </div>
        );
    }

    return(
        <>
            <div id="calendar-container">
                <div id="calendar-header">
                    <button id="prev-month" onClick={goToPreviousMonth}>Elöző hónap</button>
                    <h2 id="calendar-title">{displayTitle}</h2>
                    <button id="next-month" onClick={goToNextMonth}>Következő hónap</button>
                </div>
                <div id="days-grid">
                    {leadingEmptyCells}
                    {dayCells}
                </div>
            </div>
        </>
    );
};

export default Calendar;