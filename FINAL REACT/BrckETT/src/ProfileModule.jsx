import { Link, useNavigate } from "react-router-dom";
import "./css/ProfileModule.css";
import User from "./js/UserClass";
import { useState, useEffect } from "react";
//import {User} from "./assets/UserClass.js";

export default function ProfileModule({user, logInTrigger, setUserFunc, setUserDataFunc, userData, fetchUserDataFunc, callAPIFunc}) 
{
    const navigate = useNavigate();
    const [notifVisibility, setNotifVisibility] = useState("hidden");

    async function logOutSequence()
    {
        setUserFunc(new User())
        setUserDataFunc(null)
        logInTrigger(false)
        localStorage.removeItem('token');
        navigate("/")
    }

    useEffect(() => {
        const updateNotifVisibility = async () => {
            const hasNotifications = await userData?.hasNotifications(callAPIFunc);
            setNotifVisibility(hasNotifications ? "visible" : "hidden");
        };
        updateNotifVisibility();
    }, [userData, callAPIFunc]);
    
    return (
        <div className="profile-container">
            {/* User Profile Section */}
            <div className="profile-greeting">
                <div className="profile-banner">
                    <div className="profile-avatar-section">
                        <Link to={"/profile"} className="avatar-link">
                            <img id="profileIMG" src={user.img} alt="Profile Picture" className="profile-avatar" />
                        </Link>
                        <div className="profile-meta">
                            <h1 id="Name" className="greeting-name">Welcome, {user.displayName}!</h1>
                            <p id="UName" className="greeting-username">@{user.username}</p>
                            
                        </div>
                    </div>
                    <Link to={"/notifications"} 
                          style={{visibility: notifVisibility}} 
                          id="notification-icon" 
                          className="notification-btn">
                        !
                    </Link>
                </div>
            </div>

            {/* Action Cards Grid */}
            <div className="actions-grid">
                <Link to={"/Schedules"} className="action-card-link">
                    <div className="action-card card-schedules">
                        <div className="card-content">
                            <h3>Schedules</h3>
                            <p>Manage your calendar</p>
                        </div>
                    </div>
                </Link>

                <Link to={"/Groups"} className="action-card-link">
                    <div className="action-card card-groups">
                        <div className="card-content">
                            <h3>Groups</h3>
                            <p>Join communities</p>
                        </div>
                    </div>
                </Link>

                <Link to={"/Settings"} className="action-card-link">
                    <div className="action-card card-settings">
                        <div className="card-content">
                            <h3>Settings</h3>
                            <p>Customize your profile</p>
                        </div>
                    </div>
                </Link>

                <Link to={"/Notifications"} className="action-card-link">
                    <div className="action-card card-notifications">
                        <div className="card-content">
                            <h3>Notifications</h3>
                            <p>View all updates</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Logout Section */}
            <div className="logout-section">
                <button id="Logout-Btn" className="logout-button" onClick={logOutSequence}>
                    <span className="logout-text">Sign Out</span>
                </button>
            </div>
        </div>
    );
}