import "./css/FrontPage.css";
import { Link } from 'react-router-dom'

export default function FrontPage()
{
    return (
    <Front-Page className="front-page">
        <button><Link to={"/dev"}>Dev</Link></button>
        <button><Link to={"/loginReg"}>LoginReg</Link></button>
    </Front-Page>
    )
}
