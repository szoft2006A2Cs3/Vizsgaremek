import './css/SettingsModule.css';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import User from './js/UserClass';

export default function SettingsModule({userData, fetchUserDataFunc, callAPIFunc, setIsLoggedInFunc})
{
    const [usernameSettings, setUsernameSettings] = useState(userData.user ? userData.user.username : '');
    const [displayNameSettings, setDisplayNameSettings] = useState(userData.user ? userData.user.displayName : '');
    const [descriptionSettings, setDescriptionSettings] = useState(userData.user ? userData.user.description : '');

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [navbarCollapse, setNavbarCollapse] = useState(false);
    const [layout, setLayout] = useState('month');
    
    // mentes nelkul settings alap allapotba allitas
    const originalSettings = useRef({ theme: '', navbarCollapse: false, layout: 'month' });
    const settingsSaved = useRef(false);
    
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [showDescriptionPopup, setShowDescriptionPopup] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);


    const [passwordError, setPasswordError] = useState([]);
    const [accountError, setAccountError] = useState('');


    useEffect(() => {
        // Priority 1: Load from userData.userSettings (format: "theme/hiddenNavbar/scheduleLayout")
        // Priority 2: Fall back to localStorage
        let theme, navbarHidden, layoutValue;

        if (userData?.userSettings?.settings) {
            const settings = userData.userSettings.settings.split('/');
            theme = settings[0] || 'light-mode';
            navbarHidden = settings[1] === 'true';
            layoutValue = settings[2] || 'month';

            //console.log('Loaded settings from userData:', { theme, navbarHidden, layoutValue });
        } else {
            //console.warn('User settings not found, falling back to localStorage');
            // Fall back to localStorage
            theme = localStorage.getItem('theme') || 'light-mode';
            navbarHidden = localStorage.getItem('navbarCollapse') === 'true';
            layoutValue = localStorage.getItem('layout') || 'month';
        }

        // eredeti beallitasok tarolasa esetleges visszaallitas eseten
        originalSettings.current = {
            theme: theme,
            navbarCollapse: navbarHidden,
            layout: layoutValue
        };
        settingsSaved.current = false;

        // tema beallitasa
        setIsDarkMode(theme === 'dark-mode');
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(theme);
        
        // navbar collapse beallitas
        setNavbarCollapse(navbarHidden);
        if (navbarHidden) {
            document.body.classList.add('collapse-on');
        } else {
            document.body.classList.remove('collapse-on');
        }

        // layout beallitasa
        setLayout(layoutValue);
    }, [userData]);

    useEffect(() => {
        if (!userData?.user) return;
        setDescriptionSettings(userData.user.description || '');
    }, [userData]);

    // Cleanup: Revert unsaved changes when component unmounts
    useEffect(() => {
        return () => {
            if (!settingsSaved.current) {
                // tema visszaallitasa
                document.body.classList.remove('light-mode', 'dark-mode');
                document.body.classList.add(originalSettings.current.theme);
                
                // navbar collapse visszaallitasa
                if (originalSettings.current.navbarCollapse) {
                    document.body.classList.add('collapse-on');
                } else {
                    document.body.classList.remove('collapse-on');
                }
            }
        };
    }, []);

    const handleThemeChange = (e) => {
        const newTheme = e.target.checked ? 'dark-mode' : 'light-mode';
        setIsDarkMode(e.target.checked);
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(newTheme);
    };

    const handleNavbarCollapseChange = (e) => {
        const shouldCollapse = e.target.checked;
        setNavbarCollapse(shouldCollapse);
        if (shouldCollapse) {
            document.body.classList.add('collapse-on');
        } else {
            document.body.classList.remove('collapse-on');
        }
    };

    const handleLayoutChange = (e) => {
        const newLayout = e.target.value;
        setLayout(newLayout);
    };

    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            if (!currentPassword) {
                document.getElementById('passwd1').classList.add('input-error');
            }
            else {
                document.getElementById('passwd1').classList.remove('input-error');
            }
            if (!newPassword) {
                document.getElementById('passwd2').classList.add('input-error');
            }
            else {
                document.getElementById('passwd2').classList.remove('input-error');
            }
            if (!confirmPassword) {
                document.getElementById('passwd3').classList.add('input-error');
            }
            else {
                document.getElementById('passwd3').classList.remove('input-error');
            }

            if (!currentPassword) {
                setPasswordError(['Current password is required.']);
            } else if (!newPassword) {
                setPasswordError(['New password is required.']);
            } else {
                setPasswordError(['Please confirm your new password.']);
            }
            return;
        }

        setPasswordError([]);

        if (newPassword !== confirmPassword) {
            document.getElementById('passwd2').classList.add('input-error');
            document.getElementById('passwd3').classList.add('input-error');
            setPasswordError(['New passwords do not match.']);
            return;
        }
        else {
            document.getElementById('passwd2').classList.remove('input-error');
            document.getElementById('passwd3').classList.remove('input-error');
        }

        var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(newPassword)) {
            document.getElementById('passwd2').classList.add('input-error');
            setPasswordError(['Password must be at least 8 characters and include uppercase, lowercase, number and special character (@$!%*?&).']);
            return;
        }
        document.getElementById('passwd2').classList.remove('input-error');


        if (!callAPIFunc) {
            alert('API client not available');
            return;
        }

        try {
            await callAPIFunc.callApiAsync('login', 'PUT', { currentPassword, newPassword }, false, userData.user.token)
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError([]);
            setShowPasswordPopup(false);
        } catch (err) { 
            setPasswordError([err?.message || 'Password update failed. Please check your current password and try again.']);
        }
    };

    const handleClosePasswordPopup = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setPasswordError([]);
        setShowPasswordPopup(false);
    };

    const handleCloseDescriptionPopup = () => {
        setDescriptionSettings(userData?.user?.description || '');
        setShowDescriptionPopup(false);
    };

    const handleProfileDataChange = async () => 
        {
            if (!callAPIFunc || !userData?.user) return;

            const usernameInput = document.getElementById('acc-username');
            const displayNameInput = document.getElementById('acc-displayname');

            const usernameRegex = /^[A-Za-z0-9_áéíóöőúüűÁÉÍÓÖŐÚÜŰ]{3,24}$/;
            const displayNameRegex = /^[A-Za-záéíóöőúüűÁÉÍÓÖŐÚÜŰ\s_\-]{2,40}$/u;

            let errorMessage = '';

            if (!usernameRegex.test(usernameSettings)) {
                usernameInput?.classList.add('input-error');
                errorMessage = 'Username must be 3-24 characters and can only contain letters, numbers and underscore.';
            } else {
                usernameInput?.classList.remove('input-error');
            }

            if (!displayNameRegex.test(displayNameSettings)) {
                displayNameInput?.classList.add('input-error');
                if (!errorMessage) {
                    errorMessage = 'Display name must be 2-40 characters and can only contain letters, spaces and underscores.';
                }
            } else {
                displayNameInput?.classList.remove('input-error');
            }

            if (errorMessage) {
                setAccountError(errorMessage);
                return;
            }

            setAccountError('');

            try {
                await callAPIFunc.callApiAsync('Users', 'PUT', {"userId": userData.user.userId, "userName": usernameSettings, "email": userData.user.email, "displayName": displayNameSettings, "password": userData.user.password ?? "", "description": descriptionSettings, "role": userData.user.role, "token": userData.user.token ?? ""}, false, userData.user.token);
                await fetchUserDataFunc();
            } catch (error) {
                console.error('Profile update failed:', error);
                
            }
        }

    //usersettings es userdata mentese backendbe es api hivasa
    const saveDisplaySettings = async () => {
        if (!callAPIFunc || !userData?.user) return;

        try {
            // Build settings string: "theme/hiddenNavbar/scheduleLayout"
            const theme = isDarkMode ? 'dark-mode' : 'light-mode';
            const settingsString = `${theme}/${navbarCollapse}/${layout}`;

            //localStorage-ba mentes
            localStorage.setItem('theme', theme);
            localStorage.setItem('navbarCollapse', navbarCollapse);
            localStorage.setItem('layout', layout);

            //saved beallitasa szvl nem all vissza eredeti allapotba
            settingsSaved.current = true;
            
            // er4edeti beallitasok felulirasa
            originalSettings.current = {
                theme: theme,
                navbarCollapse: navbarCollapse,
                layout: layout
            };

            await callAPIFunc.callApiAsync('Usersettings', 'PUT', {"userId": userData.user.userId, "settings": `${theme}/${navbarCollapse}/${layout}`}, true, userData.user.token);
            await fetchUserDataFunc();
        } catch (error) {
            console.error('Display settings save failed:', error);
            alert('Failed to save display settings. Please try again.');
        }
    };



    function deleteAccount() 
    {
        callAPIFunc.callApiAsync('Users', 'DELETE', null, true, userData.user.token)
    }

    return (
        <div className="settings-module">
            <div className='settings-panel'>
                <h1>Settings</h1>

                <h2>Account Settings</h2>
                <div className='settings-category'>
                    <div className='settings-column align-left'>
                    <p>Username: {userData.user ? userData.user.username : "Loading..."}</p>
                    <p>Display Name: {userData.user ? userData.user.displayName : "Loading..."}</p>
                    <p>Description</p>
                    </div>
                    <div className='settings-column'>
                        
                    </div>
                    <div className='settings-column'>
                        <input id='acc-username' type="text" defaultValue={userData.user ? userData.user.username : "Loading..."} onChange={(e) => setUsernameSettings(e.target.value)}></input>
                        <input id='acc-displayname' type="text" defaultValue={userData.user ? userData.user.displayName : "Loading..."} onChange={(e) => setDisplayNameSettings(e.target.value)}></input>
                        <button id='THISBTNHERE' onClick={() => setShowDescriptionPopup(true)}> Change</button>
                    </div>
                </div>
                {accountError && <div className='error-text'>{accountError}</div>}
                <button className='settings-save-btn' onClick={handleProfileDataChange}>Save</button>

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

                <div className='settings-category display-grid'>
                    <p>Collapse Navbar</p>

                    <label className="theme-switch">
                        <input
                            type="checkbox"
                            checked={navbarCollapse}
                            onChange={handleNavbarCollapseChange}
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className='settings-category display-grid'>
                    <p>Layout</p>

                    <select 
                        className="layout-select"
                        value={layout}
                        onChange={handleLayoutChange}
                    >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        {/*<option value="year">Year</option>*/}
                    </select>
                </div>
                <button className='settings-save-btn' onClick={saveDisplaySettings}>Save</button>
                <button className='settings-delete-account-btn' onClick={() => setShowDeleteAccountPopup(true)}>
                    Delete Account
                </button>
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
                                        id='passwd1'
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
                                        id='passwd2'
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
                                        id='passwd3'
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
                        <div className='password-error-messages'>
                            {passwordError.length > 0 && <div className='error-text'>{passwordError[0]}</div>}
                        </div>
                        <div className='password-popup-buttons'>
                            <button onClick={handlePasswordUpdate} className='btn-confirm'>Update Password</button>
                            <button onClick={handleClosePasswordPopup} className='btn-cancel'>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showDescriptionPopup && (
                <div className='password-popup-overlay'>
                    <div className='password-popup'>
                        <h3>Change Description</h3>
                        <div className='password-popup-content'>
                            <div className='password-input-group'>
                                <label>Description</label>
                                <textarea
                                    value={descriptionSettings}
                                    className='description-textarea'
                                    onChange={(e) => setDescriptionSettings(e.target.value)}
                                    placeholder='Enter your new description'
                                    rows={5}
                                />
                            </div>
                        </div>
                        <div className='password-popup-buttons'>
                            <button onClick={() => setShowDescriptionPopup(false)} className='btn-confirm'>Done</button>
                            <button onClick={handleCloseDescriptionPopup} className='btn-cancel'>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteAccountPopup && (
                <div className='password-popup-overlay'>
                    <div className='password-popup'>
                        <h3>Delete Account</h3>
                        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                        <div className='password-popup-buttons'>
                            <button onClick={() => {setShowDeleteAccountPopup(false); deleteAccount() ;setIsLoggedInFunc(false)}} className='btn-confirm'>Yes, Delete Account</button>
                            <button onClick={() => setShowDeleteAccountPopup(false)} className='btn-cancel'>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}