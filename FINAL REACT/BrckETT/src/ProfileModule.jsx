import { Link } from "react-router-dom";
import "./css/ProfileModule.css";
//import {User} from "./assets/UserClass.js";

export default function ProfileModule({user}) 
{
    //console.log({user});
    return (
        <div className="profile-container">
            <div className="center-piece">
            <img id="profileIMG" src={user.img} alt="Profile Picture" className="profile-img" />
            <h2 id="Name" className="profile-name">{user.displayName}</h2>
            <p id="UName" className="profile-username">@{user.username}</p>
            </div>




            <div className="button-panel">
                <button><Link to={"/Editor"}>Editor</Link></button>
                <button><Link to={"/Schedules"}>Schedules</Link></button>
                <button><Link to={"/Groups"}>Groups</Link></button>
                <button><Link to={"/Settings"}>Settings</Link></button>
                <button id="Logout-Btn"><Link>Logout</Link></button>
            </div>
        </div>
    );
}

/*<p className="profile-email">{user.email}</p>*/