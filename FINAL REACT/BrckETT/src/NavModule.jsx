import "/src/css/NavModule.css";
import { Link } from 'react-router-dom'

export default function NavModule({links, profileLetter})
{
  if(profileLetter === undefined)
  {
    profileLetter = "B"
  }

    return (
    <nav className="top-navbar">


        <div className="nav-left">
          <button className="nav-button"><Link to={links.home}>Home</Link></button>
          <button className="nav-button"><Link to={links.about}>About</Link></button>
          <button className="nav-button"><Link to={links.contact}>Contact us</Link></button>
        </div>


        <button className="profile-button">{profileLetter}</button>
      </nav>)
}