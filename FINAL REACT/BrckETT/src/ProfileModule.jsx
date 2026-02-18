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
        //Delete Local storage token here WHEN IMPLEMENTED ---------------------------------------------------------------------------------------------------------------------------------------
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
                <button><Link to={"/Editor"}>Editor</Link></button>
                <button><Link to={"/Schedules"}>Schedules</Link></button>
                <button><Link to={"/Groups"}>Groups</Link></button>
                <button><Link to={"/Settings"}>Settings</Link></button>
                <button id="Logout-Btn" onClick={logOutSequence}><Link to={"/"}><img className="logoutIcon" src="/src/assets/logoutIcon.png"></img></Link></button>
            </div>
        </div>
    );
}


/*<p className="profile-email">{user.email}</p>*/