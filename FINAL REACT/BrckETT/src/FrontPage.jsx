import "./css/FrontPage.css";
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from "react";
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

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, 5000);

  return () => clearInterval(interval);
}, [images.length]);

const [translate, setTranslate] = useState(0);
const [isDragging, setIsDragging] = useState(false);

const startX = useRef(0);



const handleMouseDown = (e) => {
  setIsDragging(true);
  startX.current = e.clientX;
};

const handleMouseMove = (e) => {
  if (!isDragging) return;
  const diff = e.clientX - startX.current;
  setTranslate(diff);
};

const handleMouseUp = () => {
  setIsDragging(false);

  if (translate > 100) {
    prevImage();
  } else if (translate < -100) {
    nextImage();
  }

  setTranslate(0);
};

 return (
  <div className="front-page-container">
      


    <div className="image-carousel" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}onMouseLeave={handleMouseUp}> 
        <button className="arrow left" onClick={prevImage}>&#10094;</button>
        <img key={currentIndex} src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} className="carousel-image" draggable="false" style={{transform: `translateX(${translate}px)`, transition: isDragging ? "none" : "transform 0.3s ease"}}/>

        <div className="dots">
            {images.map((_, index) => (
          <span 
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
          ))}
        </div>

        <button className="arrow right" onClick={nextImage}>&#10095;</button>
      </div>
    </div>
  );

}
