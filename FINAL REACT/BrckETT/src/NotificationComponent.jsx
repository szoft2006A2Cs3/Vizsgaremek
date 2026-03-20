import { useEffect, useState } from "react";
import "./css/NotificationComponent.css";
import { p } from "motion/react-client";

export default function NotificationComponent({ userData, callAPIFunc, fetchUserDataFunc }) {
    const [overlaps, setOverlaps] = useState([]);
    const [ignoredOverlaps, setIgnoredOverlaps] = useState({});
    const [changedOverlap, setChangedOverlap] = useState(null);
    const [pendingGroups, setPendingGroups] = useState(userData.pendingGroups ?? []); // Ez a helyi állapot a függvényen belül, ami a userData-ból származó pendingGroups-t tartalmazza
    


    useEffect(() => 
        {
            const fetchOverlaps = async () => 
                {
                    let res = await callAPIFunc.callApiAsync("AdvancedInfo/OverLaps", "GET", null, true, callAPIFunc._token)
                    setOverlaps(res);
                    //console.log("Fetched overlaps:");
                    //console.log(res);

                    for(const date in res)
                        {
                            for(const block of res[date])
                                {
                                    setIgnoredOverlaps((prev) => ({
                                        ...prev,
                                        [block.blockId]: block.isIgnored || false,
                                    }));
                                }
                        }
                }
                fetchOverlaps();
        }, []);

    const handleIgnoreOverlapChange = (block, date, ix, checked) => {
        const overlapKey = block.blockId;
        setIgnoredOverlaps((prev) => ({
            ...prev,
            [overlapKey]: checked,
        }));
        overlaps[date][ix].isIgnored = checked; // Frissítjük a helyi overlaps állapotot, hogy tükrözze a változást
        setOverlaps([...overlaps]); // Triggereljük a re-renderelést, hogy a változás megjelenjen
        block.isIgnored = checked; // Frissítjük a blokk isIgnored értékét, hogy elküldhessük a backendnek
        // Küldés a backendnek useEffect-el, ami figyeli a changedOverlap állapotot
        setChangedOverlap(block);
    };



    function renderOverlaps(overlaps) {
        if (!overlaps || overlaps.length === 0) 
            {
                return <p>No schedule overlaps detected.</p>;
            }
            let result = [];
            overlaps.forEach((element, dateIndex) => {
                const date = <div className="overlap-date" key={dateIndex}><label>{element[0].date.split("T")[0]}</label>
                {
                    element.map((overlap,ix) => {
                        return (
                            OverlapItem(overlap,ix,dateIndex)
                        );
                    })

                }
                </div>
                result.push(date)
            });
            


            return result;
        }
        
        
    
    //Overlapping Blokk Lista Elemek Konstruktora
    function OverlapItem(block,ix,date) 
    {
        const overlapKey = block.blockId;

        return(
        <div className="overlap-item" key={ix}>
            <div className="overlap-item-row">


                <div className="overlap-item-column">{block.title}</div>
                <div className="overlap-item-column">{block.timeStart}</div>
                <div className="overlap-item-column">{block.timeEnd}</div>
                {/*Ignore gomb*/}
                <div className="overlap-item-column">
                    <div className='settings-category display-grid'>
                        <label className="radio-switch">
                            <input
                                type="checkbox"
                                checked={ignoredOverlaps[overlapKey] || false}
                                onChange={(e) => handleIgnoreOverlapChange(block, date, ix, e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

            </div>
        </div>
        );
    }

    //Ha változik az overlap ignorálásának állapota, akkor elküldjük a backendnek a változást
    useEffect(() => 
        {
            async function postToBackend() 
            {
                if (changedOverlap) {
                    await callAPIFunc.callApiAsync("AdvancedInfo/blockUpdate", "PUT", {"blockId": changedOverlap.blockId, 
                        "date": changedOverlap.date, 
                        "description": changedOverlap.description, 
                        "priority": changedOverlap.priority, 
                        "timeStart": changedOverlap.timeStart,
                        "timeEnd": changedOverlap.timeEnd,
                        "title": changedOverlap.title,
                        "isIgnored": changedOverlap.isIgnored}, true, `${callAPIFunc._token}/${changedOverlap.scheduleId}/${changedOverlap.blockId}`);

                    setChangedOverlap(null); // Reseteljük a változás állapotát, hogy ne küldjük újra véletlenül
                }
            }
            postToBackend();
        }, [changedOverlap]);

    async function handleInvites(groupId, action)
    {
        await callAPIFunc.callApiAsync("AdvancedInfo/GroupUserConn", "POST", {"Accept": action}, true, `${callAPIFunc._token}/${groupId}`)
        //Frissítjük a userData-t, hogy lekérjük a friss pendingGroups-t
        await fetchUserDataFunc();
        //Frissítjük a helyi pendingGroups állapotot is, hogy azonnal tükrözze a változást
        setPendingGroups((prev) => prev.filter((g) => g.groupId !== groupId));
    }


    function renderPendingInvites(pendingGroups) {
        if (!pendingGroups || pendingGroups.length === 0) {
            return <p>No pending group invites.</p>;
        }
        return pendingGroups.map((g) => {
            return (
                <div className="pending-invite-notification" key={g.groupId}>
                    <div className="pending-invite-item">{g.groupName}</div>
                    <div className="pending-invite-item"><button onClick={() => handleInvites(g.groupId,true)}>Accept</button></div>
                    <div className="pending-invite-item"><button onClick={() => handleInvites(g.groupId,false)}>Decline</button></div>
                </div>
            );
        });
    }

    



    return (
        <div className="notification-component-container">
            <div className="notifications-categories">
                <h1>Notifications</h1>
                <div className="pending-invite-notifications">
                    <h2>Pending Group Invites</h2>
                    {renderPendingInvites(pendingGroups)}
                </div>
                <div className="overlap-notifications">
                    <h2>Schedule Overlaps</h2>
                    {renderOverlaps(overlaps)}
                </div>
            </div>
        </div>
    );
}