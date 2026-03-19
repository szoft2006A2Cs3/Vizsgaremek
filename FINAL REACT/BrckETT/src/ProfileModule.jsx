import { Link, useNavigate } from "react-router-dom";
import "./css/ProfileModule.css";
import User from "./js/UserClass";
import { useState, useEffect, use } from "react";
//import {User} from "./assets/UserClass.js";

export default function ProfileModule({user, logInTrigger, setUserFunc, setUserDataFunc, userData, fetchUserDataFunc}) 
{
    const navigate = useNavigate();
    async function logOutSequence()
    {
        setUserFunc(new User())
        setUserDataFunc(null)
        logInTrigger(false)
        localStorage.removeItem('token');
        navigate("/")
    }
    const [notifVisibility, setNotifVisibility] = useState("");

    useEffect(() => {
        const updateNotifVisibility = async () => {
            const hasNotifications = await userData?.hasNotifications();
            setNotifVisibility(hasNotifications ? "visible" : "hidden");
        };
        updateNotifVisibility();
    }, [userData]);
    
    

    //console.log(userData.hasNotifications());
    //console.log({user});
    return (
        <div className="profile-container">
            <div className="center-piece">
            <Link to={"/profile"}><img id="profileIMG" src={user.img} alt="Profile Picture" className="profile-img" /></Link>
            <div className="name-notif-container">
                <h2 id="Name" className="profile-name">{user.displayName}</h2>
                <Link to={"/notifications"} style={{visibility: notifVisibility}} id="notification-icon">!</Link>
            </div>
            <p id="UName" className="profile-username">@{user.username}</p>
            </div>




            <div className="button-panel">
                <Link to={"/Schedules"}><button><link-text>Schedules</link-text></button></Link>
                <Link to={"/Groups"}><button><link-text>Groups</link-text></button></Link>
                <Link to={"/Settings"}><button><link-text>Settings</link-text></button></Link>
                <button id="Logout-Btn" onClick={logOutSequence}><Link to={"/"}><img className="logoutIcon" src="/src/assets/logoutIcon.png"></img></Link></button>
                
            </div>
        </div>
    );
}


/*<p className="profile-email">{user.email}</p>*/