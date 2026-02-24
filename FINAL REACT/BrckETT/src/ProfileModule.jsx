import { Link, useNavigate } from "react-router-dom";
import "./css/ProfileModule.css";
import User from "./js/UserClass";
//import {User} from "./assets/UserClass.js";

export default function ProfileModule({user, logInTrigger, setUserFunc, setUserDataFunc}) 
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
    //console.log({user});
    return (
        <div className="profile-container">
            <div className="center-piece">
            <Link to={"/profile"}><img id="profileIMG" src={user.img} alt="Profile Picture" className="profile-img" /></Link>
            <h2 id="Name" className="profile-name">{user.displayName}</h2>
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