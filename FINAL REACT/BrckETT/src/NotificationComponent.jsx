import { useEffect, useState } from "react";
import "./css/NotificationComponent.css";

export default function NotificationComponent({ userData, callAPIFunc, fetchUserDataFunc }) {
    const [overlaps, setOverlaps] = useState([]);
    const [ignoredOverlaps, setIgnoredOverlaps] = useState({});
    const [changedOverlap, setChangedOverlap] = useState(null);
    const [pendingGroups, setPendingGroups] = useState(userData.pendingGroups ?? []); // Ez a helyi állapot a függvényen belül, ami a userData-ból származó pendingGroups-t tartalmazza
    

    useEffect(() => {
        setPendingGroups(userData?.pendingGroups ?? []);
    }, [userData]);


    useEffect(() => 
        {
            const fetchOverlaps = async () => 
                {
                    let res = await callAPIFunc.callApiAsync("AdvancedInfo/OverLaps", "GET", null, true, callAPIFunc._token)
                    setOverlaps(res);
                    const nextIgnoredOverlaps = {};

                    for (const overlapGroup of res) {
                        for (const block of overlapGroup) {
                            nextIgnoredOverlaps[block.blockId] = block.isIgnored || false;
                        }
                    }

                    setIgnoredOverlaps(nextIgnoredOverlaps);
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
                return <p className="notification-empty-state">No schedule overlaps detected.</p>;
            }
            return overlaps.map((element, dateIndex) => {
                return (
                    <div className="overlap-date-card" key={dateIndex}>
                        <div className="overlap-date-header">
                            <div>
                                <span className="section-chip">Conflict Day</span>
                                <h3>{element[0].date.split("T")[0]}</h3>
                            </div>
                            <span className="overlap-count-pill">{element.length} item{element.length > 1 ? "s" : ""}</span>
                        </div>
                        <div className="overlap-list">
                            {element.map((overlap, ix) => {
                                return OverlapItem(overlap, ix, dateIndex);
                            })}
                        </div>
                    </div>
                );
            });
        }
        
        
    
    //Overlapping Blokk Lista Elemek Konstruktora
    function OverlapItem(block,ix,date) 
    {
        const overlapKey = block.blockId;

        return(
        <div className="overlap-item" key={overlapKey ?? ix}>
            <div className="overlap-item-row">


                <div className="overlap-item-main">
                    <span className="overlap-item-label">Event</span>
                    <div className="overlap-item-title">{block.title}</div>
                </div>
                <div className="overlap-time-group">
                    <div className="overlap-item-column">
                        <span className="overlap-item-label">Starts</span>
                        <span className="overlap-item-value">{block.timeStart}</span>
                    </div>
                    <div className="overlap-item-column">
                        <span className="overlap-item-label">Ends</span>
                        <span className="overlap-item-value">{block.timeEnd}</span>
                    </div>
                </div>
                <div className="overlap-toggle-column">
                    <span className="overlap-item-label">Ignore</span>
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
            return <p className="notification-empty-state">No pending group invites.</p>;
        }
        return pendingGroups.map((g) => {
            return (
                <div className="pending-invite-notification" key={g.groupId}>
                    <div className="pending-invite-copy">
                        <span className="section-chip">Group Invite</span>
                        <div className="pending-invite-title">{g.groupName}</div>
                        <p>You have a pending invitation waiting for a response.</p>
                    </div>
                    <div className="pending-invite-actions">
                        <button className="notification-action-button accept" type="button" onClick={() => handleInvites(g.groupId,true)}>Accept</button>
                        <button className="notification-action-button decline" type="button" onClick={() => handleInvites(g.groupId,false)}>Decline</button>
                    </div>
                </div>
            );
        });
    }

    



    return (
        <div className="notification-component-container">
            <div className="notifications-shell">
                <div className="notifications-hero">
                    <div className="notifications-title-block">
                        <span className="section-chip">Control Center</span>
                        <h1>Notifications</h1>
                        <p>Track invites and schedule conflicts in the same visual style as the rest of your dashboard.</p>
                    </div>
                    <div className="notifications-summary">
                        <div className="summary-card">
                            <span className="summary-label">Pending Invites</span>
                            <strong>{pendingGroups.length}</strong>
                            <p>Group requests that still need a decision.</p>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Overlap Alerts</span>
                            <strong>{overlaps.reduce((sum, overlapGroup) => sum + overlapGroup.length, 0)}</strong>
                            <p>Schedule items that collide on the calendar.</p>
                        </div>
                    </div>
                </div>

                <div className="notifications-categories">
                    <div className="notification-panel pending-invite-notifications">
                        <div className="notification-panel-header">
                            <div>
                                <span className="section-chip">Invites</span>
                                <h2>Pending Group Invites</h2>
                            </div>
                            <span className="notification-panel-count">{pendingGroups.length}</span>
                        </div>
                    {renderPendingInvites(pendingGroups)}
                    </div>
                    <div className="notification-panel overlap-notifications">
                        <div className="notification-panel-header">
                            <div>
                                <span className="section-chip">Calendar</span>
                                <h2>Schedule Overlaps</h2>
                            </div>
                            <span className="notification-panel-count">{overlaps.length}</span>
                        </div>
                        {renderOverlaps(overlaps)}
                    </div>
                </div>
            </div>
        </div>
    );
}