import "./css/FrontPage.css";
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from "react";
import Image from "./assets/Brckett Logo.png";
import Image2 from "./assets/naptar.png";
import Image3 from "./assets/masem.png";
import BgVideo from "./assets/BrckEtt_BG.mp4";

const slides = [
  {
    image: Image,
    alt: "Brckett logo",
  },
  {
    image: Image2,
    alt: "Random Calendar",
  },
  {
    image: Image3,
    alt: "Horcsog",
  },
];


export default function FrontPage()
{
    const [currentIndex, setCurrentIndex] = useState(0);
    const [translate, setTranslate] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const prevImage = () => {
    setCurrentIndex((currentIndex - 1 + slides.length) % slides.length);
  };

    const nextImage = () => {
    setCurrentIndex((currentIndex + 1) % slides.length);
  };

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex(prev => (prev + 1) % slides.length);
  }, 5000);

  return () => clearInterval(interval);
}, []);

const startX = useRef(0);
const pointerIdRef = useRef(null);
const sectionRef = useRef(null);
const videoRef = useRef(null);
const currentSlide = slides[currentIndex];


// Átvett kód az internetről a videó körbevágásához, hogy csak a carousel szakaszban látszódjon
useEffect(() => {
  const updateClip = () => {
    if (!sectionRef.current || !videoRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const top = Math.max(0, rect.top);
    const left = Math.max(0, rect.left);
    const right = Math.max(0, vw - rect.right);
    const bottom = Math.max(0, vh - rect.bottom);
    videoRef.current.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  };
  updateClip();
  window.addEventListener('scroll', updateClip);
  window.addEventListener('resize', updateClip);
  return () => {
    window.removeEventListener('scroll', updateClip);
    window.removeEventListener('resize', updateClip);
  };
}, []);



const handlePointerDown = (e) => {
  setIsDragging(true);
  startX.current = e.clientX;
  pointerIdRef.current = e.pointerId;
  e.currentTarget.setPointerCapture?.(e.pointerId);
};

const handlePointerMove = (e) => {
  if (!isDragging) return;
  const diff = e.clientX - startX.current;
  setTranslate(diff);
};

const handlePointerUp = (e) => {
  if (pointerIdRef.current !== null && e.currentTarget.hasPointerCapture?.(pointerIdRef.current)) {
    e.currentTarget.releasePointerCapture(pointerIdRef.current);
  }
  pointerIdRef.current = null;
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

      <section className="carousel-section" ref={sectionRef}>
        <video className="carousel-bg-video" ref={videoRef} autoPlay muted loop playsInline>
          <source src={BgVideo} type="video/mp4" />
        </video>

        <div className="shell">
          <div className="copy">
            <span className="nameplate">Brckett Schedule Manager</span>
            <h1>Plan your week without the usual clutter.</h1>

            <p></p>

            <div className="actions">
              <Link to="/loginReg" className="action-button start-button-primary">Get stared</Link>
              <Link to="/about" className="action-button learn-button-secondary">Learn more</Link>
            </div>
          </div>

          <div className="carousel-container">
            <div className="image-carousel">
              <div className="carousel-topbar">
                <span className="carousel-featured">Featured</span>
                <span className="carousel-count">{String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
              </div>

              <div
                className="carousel-media"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <button type="button" className="arrow left" aria-label="Previous slide" onPointerDown={(e) => e.stopPropagation()} onClick={prevImage}>
                  &#10094;
                </button>

                <img
                  key={currentIndex}
                  src={currentSlide.image}
                  alt={currentSlide.alt}
                  className="carousel-image"
                  draggable="false"
                  style={{
                    transform: `translateX(${translate}px)`,
                    transition: isDragging ? "none" : "transform 0.3s ease"
                  }}
                />

                <button type="button" className="arrow right" aria-label="Next slide" onPointerDown={(e) => e.stopPropagation()} onClick={nextImage}>
                  &#10095;
                </button>
              </div>

              <div className="dots" aria-label="Carousel navigation">
                {slides.map((slide, index) => (
                  <button
                    key={slide.alt}
                    type="button"
                    className={`dot ${index === currentIndex ? "active" : ""}`}
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </div>
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

  </div>
</section>

<div className="section-divider"></div>

      <section className="legal-section">
        <div className="legal-inner">
          <div className="legal-left">
            <span className="legal-date">2026.04.27</span>
            <span className="legal-copy">© 2026 BrckEtt</span>
          </div>

          <div className="legal-links">
            <Link to="/faq" className="legal-link">FAQ</Link>
            <Link to="/terms" className="legal-link">Terms of Use</Link>
          </div>
        </div>
      </section>
    </div>
        
        
    </>
    
  );
  

}
