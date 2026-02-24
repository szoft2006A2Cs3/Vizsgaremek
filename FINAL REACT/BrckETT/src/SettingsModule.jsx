import './css/SettingsModule.css';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsModule({userData, setUserDataFunc})
{
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Load theme preference on component mount
        const savedTheme = localStorage.getItem('theme') || 'light-mode';
        setIsDarkMode(savedTheme === 'dark-mode');
    }, []);

    const handleThemeChange = (e) => {
        const newTheme = e.target.checked ? 'dark-mode' : 'light-mode';
        setIsDarkMode(e.target.checked);
        localStorage.setItem('theme', newTheme);
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(newTheme);
    };

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
            checked={isDarkMode}
            onChange={handleThemeChange}
        />
        <span className="slider"></span>
    </label>
</div>

                <button className='settings-save-btn'>Save</button>




                



            </div>
        </div>
    );
}