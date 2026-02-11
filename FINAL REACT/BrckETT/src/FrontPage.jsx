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
      


     <div className="image-carousel">
        <button className="arrow left" onClick={prevImage}>&#10094;</button>
        <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
        <button className="arrow right" onClick={nextImage}>&#10095;</button>
      </div>
    </div>
  );

}
