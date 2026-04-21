import "/src/css/NavModule.css";
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";

export default function NavModule({longFormat, profileLetter, setActiveForm}) {
  if(profileLetter === undefined) profileLetter = "B";

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleMouseMove(e) {
      if (e.clientY < 50) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return longFormat ? (
    <nav className={`top-navbar ${visible ? "visible" : "hidden"}`}>
      <div className="nav-left">
        <button className="nav-button"><Link to="/">Home</Link></button>
        <button className="nav-button"><Link to="/about">About</Link></button>
        <button className="nav-button"><Link to="/contact">Contact us</Link></button>
        <button className="nav-button"><Link to="/Schedules">Schedules</Link></button>
        <button className="nav-button"><Link to="/Groups">Groups</Link></button>
        <button className="nav-button"><Link to="/notifications">Notifications</Link></button>
        <button className="nav-button"><Link to="/Settings">Settings</Link></button>
      </div>

      <button className="profile-button" onClick={() => setActiveForm('login')}><Link to="/profile">{profileLetter}</Link></button>
    </nav>
  ) : 
  (<nav className={`top-navbar ${visible ? "visible" : "hidden"}`}>
      <div className="nav-left">
        <button className="nav-button"><Link to="/">Home</Link></button>
        <button className="nav-button"><Link to="/about">About</Link></button>
        <button className="nav-button"><Link to="/contact">Contact us</Link></button>
      </div>

      <button className="profile-button" onClick={() => setActiveForm('login')}><Link to="/profile">{profileLetter}</Link></button>
    </nav>);
}
