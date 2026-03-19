import { useEffect, useState } from "react";
import "./css/NotificationComponent.css";

export default function NotificationComponent({ userData, callAPIFunc, fetchUserDataFunc }) {
    const [overLaps, setOverLaps] = useState([]);

    useEffect(() => {
        async function loadOverLaps() {
            const overLapsResult = await callAPIFunc.callApiAsync(
                "AdvancedInfo/OverLaps",
                "GET",
                null,
                true,
                callAPIFunc._token
            );
            setOverLaps(Array.isArray(overLapsResult) ? overLapsResult : []);
        }

        loadOverLaps();
    }, [userData, callAPIFunc, fetchUserDataFunc]);

    const pendingInviteList = (userData?.pendingGroups ?? []).map((g) => {
        return (
            <div className="pending-invite-notification" key={g.groupId ?? g.groupName}>
                {g.groupName}
            </div>
        );
    });

    const overLapsList = overLaps.map((b, index) => {
        return (
            <div className="overlap-notification" key={b.blockId ?? b.id ?? index}>
                {b.isIgnored ? "Ignored" : "Not Ignored"}
            </div>
        );
    });
    
    
    //Overlapping Blokk Lista (div elementek, amikben benne van a cím, és a beállítási lehetőség, hogy ignore-olva legyen-e a blokk, vagy sem)
    //NEM MUKSZIK
    
    
    
    return (
        <div className="notification-component-container">
            <div className="notifications-categories">
                <h1>Notifications</h1>
                <div className="pending-invite-notifications">
                    <h2>Pending Group Invites</h2>
                    {pendingInviteList}
                </div>
                <div className="overlap-notifications">
                    <h2>Schedule Overlaps</h2>
                    {overLapsList}
                </div>
            </div>
        </div>
    );
}