import "/src/css/NavModule.css";
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";

export default function NavModule({links, profileLetter, setActiveForm}) {
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

  return (
    <nav className={`top-navbar ${visible ? "visible" : "hidden"}`}>
      <div className="nav-left">
        <button className="nav-button"><Link to={links.home}>Home</Link></button>
        <button className="nav-button"><Link to={links.about}>About</Link></button>
        <button className="nav-button"><Link to={links.contact}>Contact us</Link></button>
      </div>

      <button className="profile-button" onClick={() => setActiveForm('login')}><Link to={links.profile}>{profileLetter}</Link></button>
    </nav>
  );
}
