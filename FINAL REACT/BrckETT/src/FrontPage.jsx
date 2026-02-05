import "./css/FrontPage.css";
import { Link } from 'react-router-dom'
import { useState } from "react";
import Image from "./assets/Brckett Logo.png";
import Image2 from "./assets/naptar.png";
import Image3 from "./assets/masem.png";

export default function FrontPage()
{
    const images = [Image, Image2, Image3];

    const [currentIndex, setCurrentIndex] = useState(0);

    const prevImage = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

    const nextImage = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };
 return (
  <div className="front-page-container">
      <nav className="top-navbar">


        <div className="nav-left">
          <button className="nav-button"><Link to="/loginReg">Home</Link></button>
          <button className="nav-button"><Link to="/loginReg">About</Link></button>
          <button className="nav-button"><Link to="/loginReg">Contact us</Link></button>
        </div>


        <button className="profile-button">B</button>
      </nav>


     <div className="image-carousel">
        <button className="arrow left" onClick={prevImage}>&#10094;</button>
        <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
        <button className="arrow right" onClick={nextImage}>&#10095;</button>
      </div>


      <footer className="bottom-footer">
        <button className="footer-button register"><Link to="/loginReg">Registration</Link></button>
        <button className="footer-button login"><Link to="/loginReg">Login</Link></button>
      </footer>
    </div>
  );

}
