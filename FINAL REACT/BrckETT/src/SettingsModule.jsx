import './css/SettingsModule.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsModule({userData, setUserDataFunc})
{
    return (
        <div className="settings-module">
            <div className='settings-panel'>
                <h1>Settings</h1>

                <h2>Account Settings</h2>
                <div className='settings-category'>
                    <div className='settings-column'>
                    <p>Username: {userData ? userData.userName : "Loading..."}</p>
                    <p>Email: {userData ? userData.email : "Loading..."}</p>
                    <p>Display Name: {userData ? userData.displayName : "Loading..."}</p>
                    </div>
                    <div className='settings-column'>
                        <input type="text" defaultValue={userData ? userData.userName : "Loading..."}></input>
                        <input type="text" defaultValue={userData ? userData.email : "Loading..."}></input>
                        <input type="text" defaultValue={userData ? userData.displayName : "Loading..."}></input>
                    </div>
                    <div className='settings-column'>
                        <button>Change</button>
                        <button>Change</button>
                        <button>Change</button>
                    </div>
                    
                    
                </div>
                <button className='settings-save-btn'>Save</button>


                <h2>Display Settings</h2>
<div className='settings-category display-grid'>
    <p>Light / Dark Mode</p>

    <label className="theme-switch">
        <input
            type="checkbox"
            onChange={(e) => {
                if (e.target.checked) {
                    document.body.classList.remove("light-mode");
                    document.body.classList.add("dark-mode");
                } else {
                    document.body.classList.remove("dark-mode");
                    document.body.classList.add("light-mode");
                }
            }}
        />
        <span className="slider"></span>
    </label>
</div>

                <button className='settings-save-btn'>Save</button>




                



            </div>
        </div>
    );
}