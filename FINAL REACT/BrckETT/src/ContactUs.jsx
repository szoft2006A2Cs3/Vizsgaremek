import { Link, useNavigate } from "react-router-dom";
import "./css/ContactUs.css";

export default function ContactUs(){
    return ( 
    
    <div className="contact-container"> 
    
    <h1>Contact Us</h1> 
    
    <p><span>If you have any questions, feedback, or need assistance with Brckett, please don't hesitate to reach out to us. We value your input and are here to help you make the most of our scheduling application.</span></p> 
    <p><span>You can contact us through the following channels:</span></p> 
    
    <ul> 
        <li>Email: IstvanTheSaint@magyar.kiraly.hu</li> 
        <li>Phone: +36 70 420 6767</li> 
        <li>Address: idk, a bar probably</li>
    </ul> 
    
    </div> 
    )
}