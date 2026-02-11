import "/src/css/NavModule.css";
import { Link } from 'react-router-dom'

export default function NavModule()
{
    return (
    <nav className="top-navbar">


        <div className="nav-left">
          <button className="nav-button"><Link to="/loginReg">Home</Link></button>
          <button className="nav-button"><Link to="/loginReg">About</Link></button>
          <button className="nav-button"><Link to="/loginReg">Contact us</Link></button>
        </div>


        <button className="profile-button">B</button>
      </nav>)
}