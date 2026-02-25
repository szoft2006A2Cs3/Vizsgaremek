import { tr } from 'motion/react-client';
import './css/SettingsModule.css';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsModule({userData, setUserDataFunc, callAPIFunc})
{
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all password fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        // Call API to update password and show success only on HTTP OK
        if (!callAPIFunc) {
            alert('API client not available');
            return;
        }

        const payload = { currentPassword: currentPassword, newPassword: newPassword };
        try {
            callAPIFunc.prepareCall('PUT', payload);
            const tokenSegment = userData && userData.user && userData.user.token ? `/${userData.user.token}` : '';
            const url = `${callAPIFunc._baseUrl}/login${tokenSegment}`;
            const resp = await fetch(url, callAPIFunc._options);
            if (resp.ok) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordPopup(false);
                alert('Password updated successfully');
            } else {
                const text = await resp.text();
                alert('Password update failed: ' + (text || resp.statusText));
            }
        } catch (err) {
            console.error('Password update error', err);
            alert('Password update failed. See console for details.');
        }
    };

    const handleClosePasswordPopup = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setShowPasswordPopup(false);
    };

    return (
        <div className="settings-module">
            <div className='settings-panel'>
                <h1>Settings</h1>

                <h2>Account Settings</h2>
                <div className='settings-category'>
                    <div className='settings-column align-left'>
                    <p>Username: {userData.user ? userData.user.username : "Loading..."}</p>
                    <p>Email: {userData.user ? userData.user.email : "Loading..."}</p>
                    <p>Display Name: {userData.user ? userData.user.displayName : "Loading..."}</p>
                    </div>
                    <div className='settings-column'>
                        <input type="text" defaultValue={userData.user ? userData.user.username : "Loading..."}></input>
                        <input type="text" defaultValue={userData.user ? userData.user.email : "Loading..."}></input>
                        <input type="text" defaultValue={userData.user ? userData.user.displayName : "Loading..."}></input>
                    </div>
                    <div className='settings-column'>
                        <button>Change</button>
                        <button>Change</button>
                        <button>Change</button>
                    </div>
                </div>
                <button className='settings-save-btn'>Save</button>

                <h2>Password Settings</h2>
                <div className='settings-category'>
                    <div className='settings-column align-left'>
                        <p>Password</p>
                    </div>
                    <div className='settings-column'>
                    </div>
                    <div className='settings-column'>
                        <button onClick={() => setShowPasswordPopup(true)}>Update</button>
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

            {showPasswordPopup && (
                <div className='password-popup-overlay'>
                    <div className='password-popup'>
                        <h3>Change Password</h3>
                        <div className='password-popup-content'>
                            <div className='password-input-group'>
                                <label>Current Password</label>
                                <div className='password-input-wrapper'>
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="Enter your current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className='password-toggle-btn'
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>
                            <div className='password-input-group'>
                                <label>New Password</label>
                                <div className='password-input-wrapper'>
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter your new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className='password-toggle-btn'
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>
                            <div className='password-input-group'>
                                <label>Confirm New Password</label>
                                <div className='password-input-wrapper'>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className='password-toggle-btn'
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='password-popup-buttons'>
                            <button onClick={handlePasswordUpdate} className='btn-confirm'>Update Password</button>
                            <button onClick={handleClosePasswordPopup} className='btn-cancel'>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}