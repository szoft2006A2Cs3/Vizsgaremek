import "/src/css/FooterModule.css";
import { Link } from 'react-router-dom'

export default function FooterModule()
{
    return (
        <footer className="bottom-footer">
            <button className="footer-button register"><Link to="/loginReg">Registration</Link></button>
            <button className="footer-button login"><Link to="/loginReg">Login</Link></button>
        </footer>
    )
}