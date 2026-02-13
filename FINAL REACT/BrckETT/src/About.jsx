import { Link, useNavigate } from "react-router-dom";
import "./css/About.css";

export default function About(){ 
    return (
         <div className="about-container"> 
            <h1>About Brckett</h1> 
            
            <p><span>Brckett is a scheduling application designed to help users manage their time effectively. With Brckett, you can create and organize your schedules, set reminders, and collaborate with others to stay on top of your tasks and appointments.</span></p> 
            
            <p><span>Our mission is to provide a user-friendly platform that simplifies the process of scheduling and time management. Whether you're a student, professional, or anyone looking to optimize their daily routine, Brckett is here to help you stay organized and productive.</span></p> 
            
            <p><span>Thank you for choosing Brckett as your scheduling solution. We are committed to continuously improving our application to meet your needs and enhance your scheduling experience.</span></p> 
        </div> 
    ); 
}


