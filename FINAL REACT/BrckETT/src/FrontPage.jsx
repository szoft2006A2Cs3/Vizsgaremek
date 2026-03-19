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
    <>
      <div className="front-page-container">

      <section className="carousel-section">

        <div className="carousel-container">
          <div 
            className="image-carousel"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <button className="arrow left" onClick={prevImage}>
              &#10094;
            </button>

            <img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              className="carousel-image"
              draggable="false"
              style={{
                transform: `translateX(${translate}px)`,
                transition: isDragging ? "none" : "transform 0.3s ease"
              }}
            />

            <div className="dots">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>

            <button className="arrow right" onClick={nextImage}>
              &#10095;
            </button>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      <section className="preview-section">
        <div className="frontpage-previews">

          <div className="about-container front-preview">
            <h1>About Brckett</h1>
            <Link to="/about" className="frontpage-link">
              <p>
                <span>
                  Brckett is a scheduling application designed to help users manage their time effectively.
                </span>
              </p>
            </Link>
          </div>

          <div className="contact-container front-preview">
            <h1>Contact Us</h1>
            <Link to="/contact" className="frontpage-link">
              <p>
                <span>
                  If you have any questions, feedback, or need assistance with Brckett, please don't hesitate to reach out to us.
                </span>
              </p>
            </Link>
          </div>
          
              <div className="section-divider"></div>

          <section className="legal-section">
            <div className="legal-inner">

            <div className="legal-left">
            <span className="legal-date">
                2026.04.27
            </span>
              <span className="legal-copy">
                © 2026 BrckEtt
              </span>
            </div>

            <div className="legal-links">
            <Link to="/faq" className="legal-link">FAQ</Link>
            <Link to="/terms" className="legal-link">Felhasználói feltételek</Link>
            </div>

            </div>
          </section>

        </div>
      </section>

    </div>
        
        
    </>
    
  );
  

}
