import { Link, useNavigate } from "react-router-dom";
import "./css/ContactUs.css";

export default function ContactUs(){
    return ( 
    
    <div className="contact-container"> 
    
    <h1>Contact Us</h1> 
    
    <p><span>If you have any questions, feedback, or need assistance with Brckett, please don't hesitate to reach out to us. We value your input and are here to help you make the most of our scheduling application.</span></p> 
    <p><span>You can contact us through the following channels:</span></p> 
    
    <ul> 
        <li>fulop.laszlo.andras@gmail.com</li> 
        <li>feher.agoston07@gmail.com</li>
        <li>muller.balint06@gmail.com</li>
        <li>Phone: +36 20 123 4567</li> 
        <li>Address: Szombathely, Hungary</li>
    </ul> 
    
    </div> 
    )
}