import "./css/ProfileModule.css";
//import {User} from "./assets/UserClass.js";

export default function ProfileModule({user}) 
{
    //console.log({user});
    return (
        <div className="profile-container">
            <img src={user.img} alt="Profile Picture" className="profile-img" />
            <h2 className="profile-name">{user.displayName}</h2>
            <p className="profile-username">@{user.username}</p>
            <p className="profile-email">{user.email}</p>
        </div>
    );
}