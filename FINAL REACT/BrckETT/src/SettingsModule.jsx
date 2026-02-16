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
                        <input type="text" defaultValue={userData ? userData.displayName : "Loading..."}></input>
                        <input type="text" defaultValue={userData ? userData.email : "Loading..."}></input>
                        <input type="text" defaultValue={userData ? userData.userName : "Loading..."}></input>
                    </div>
                    <div className='settings-column'>
                        <button>Change</button>
                        <button>Change</button>
                        <button>Change</button>
                    </div>
                    
                    
                </div>
                <button className='settings-save-btn'>Save</button>


                <h2>Display Settings</h2>
                <div className='settings-category'>
                    <div className='settings-column'>
                    <p>Light/Dark Mode: </p>
                    </div>
                    <div className='settings-column'>
                        <input type="radio" name="theme" value="light"></input>
                        
                    </div>
                    <div className='settings-column'>
                        <input type="radio" name="theme" value="dark"></input>
                    </div>
                    
                    
                </div>
                <button className='settings-save-btn'>Save</button>




                <h2>Custom Settings</h2>
                <div className='settings-category'>
                    <div className='settings-column'>
                    <p>Background Color:</p>
                    <p>Secondary BackGround Color:</p>
                    <p>Font Color:</p>
                    <p>Font Size:</p>
                    </div>
                    <div className='settings-column'>
                        <input type="text" ></input>
                        <input type="text" ></input>
                        <input type="text" ></input>
                        <input type="text" ></input>
                    </div>
                    <div className='settings-column'>
                        <button>Change</button>
                        <button>Change</button>
                        <button>Change</button>
                        <button>Change</button>
                    </div>
                    
                    
                </div>
                <button className='settings-save-btn'>Save</button>



            </div>
        </div>
    );
}