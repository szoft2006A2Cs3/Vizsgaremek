import "./css/FrontPage.css";
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from "react";
import Image from "./assets/Brckett Logo.png";
import Image2 from "./assets/ProfileModule.png";
import Image3 from "./assets/SchedulesWeekly.png";
import Image4 from "./assets/SchedulesDaily.png";
import Image5 from "./assets/SchedulesMonthly.png";
import BgVideo from "./assets/BrckEtt_BG.mp4";

const slides = [
  {
    image: Image,
    alt: "Brckett logo",
  },
  {
    image: Image2,
    alt: "ProfileModule",
  },
  {
    image: Image3,
    alt: "Weekly Schedules",
  },
  {
    image: Image4,
    alt: "Daily Schedules",
  },
  {
    image: Image5,
    alt: "Monthly Schedules",
  },
];

const faqItems = [
  {
    question: "How do I create an account?",
    answer: "Click 'Get started' to go to the registration form, provide a username, email and password, then follow any on-screen instructions to finish setup."
  },
  {
    question: "Can I use Brckett offline?",
    answer: "The app is primarily online and needs a network connection to sync changes."
  },
  {
    question: "Does Brckett sync with Google Calendar or other services?",
    answer: "Direct calendar integration is not available in the current version. You can export your schedule and import it into other services where supported."
  },
  {
    question: "How can I delete my account?",
    answer: "Account deletion may be available in Settings. If you don't see a delete option, please contact support to request account removal."
  },
  {
    question: "How do I change my email address or username?",
    answer: "Open your profile settings and update your account details. Changes will be saved after you confirm them."
  },
  {
    question: "Where can I get help or report a bug?",
    answer: "Use the Contact Us page to send feedback or bug reports. Include details and screenshots to help us investigate."
  }
];


export default function FrontPage()
{
    const [currentIndex, setCurrentIndex] = useState(0);
    const [translate, setTranslate] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const slideCount = slides.length;

    const prevImage = () => {
    setCurrentIndex(prev => (prev === 0 ? slideCount - 1 : prev - 1));
  };

    const nextImage = () => {
    setCurrentIndex(prev => (prev === slideCount - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex(prev => (prev === slideCount - 1 ? 0 : prev + 1));
  }, 5000);

  return () => clearInterval(interval);
}, [slideCount]);

useEffect(() => {
  if (currentIndex >= slideCount) {
    setCurrentIndex(0);
  }
}, [currentIndex, slideCount]);

const startX = useRef(0);
const pointerIdRef = useRef(null);
const sectionRef = useRef(null);
const videoRef = useRef(null);
const currentSlide = slides[currentIndex];

useEffect(() => {
  if (!activePopup) {
    document.body.style.overflow = "";
    return undefined;
  }

  const handleEscape = (event) => {
    if (event.key === "Escape") {
      setActivePopup(null);
    }
  };

  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", handleEscape);

  return () => {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", handleEscape);
  };
}, [activePopup]);


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
            <button type="button" className="legal-link legal-button" onClick={() => setActivePopup("faq")}>FAQ</button>
            <button type="button" className="legal-link legal-button" onClick={() => setActivePopup("terms")}>Terms of Use</button>
          </div>
        </div>
      </section>

      {activePopup === "faq" && (
        <div className="faq-modal-backdrop" onClick={() => setActivePopup(null)}>
          <div className="faq-modal" role="dialog" aria-modal="true" aria-labelledby="faq-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="faq-modal-topbar">
              <div>
                <h2 id="faq-modal-title">Frequently Asked Questions</h2>
              </div>

              <button type="button" className="faq-close-button" aria-label="Back to site" onClick={() => setActivePopup(null)}>
                Back to site
              </button>
            </div>

            <div className="faq-grid">
              {faqItems.map((item, index) => (
                <article className="faq-card" key={item.question} tabIndex="0">
                  <span className="faq-index">{String(index + 1).padStart(2, "0")}</span>

                  <div className="faq-card-copy">
                    <span className="faq-card-text faq-question">{item.question}</span>
                    <span className="faq-card-text faq-answer">{item.answer}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {activePopup === "terms" && (
        <div className="faq-modal-backdrop" onClick={() => setActivePopup(null)}>
          <div className="faq-modal terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="faq-modal-topbar">
              <div>
                <h2 id="terms-modal-title">Terms of Use</h2>
              </div>

              <button type="button" className="faq-close-button" aria-label="Back to site" onClick={() => setActivePopup(null)}>
                Back to site
              </button>
            </div>

            <div className="terms-modal-copy">
              <h3>Terms of Use</h3>

              <p><strong>Last Updated: April 15, 2026</strong></p>

              <h4>1. Acceptance of Terms</h4>
              <p>By accessing and using Brckett ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>

              <h4>2. Use License</h4>
              <p>Permission is granted to temporarily use the Service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul>
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to decompile or reverse engineer any software contained on the Service</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>

              <h4>3. User Account</h4>
              <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
              
              <h4>4. Prohibited Uses</h4>
              <p>You may not use our Service:</p>
              <ul>
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>For any obscene or immoral purpose</li>
              </ul>

              <h4>5. Termination</h4>
              <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>

              <h4>6. Governing Law</h4>
              <p>These Terms shall be interpreted and governed by the laws of the jurisdiction in which Brckett operates, without regard to its conflict of law provisions.</p>

              <h4>7. Changes to Terms</h4>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>

              <h4>8. Contact Information</h4>
              <p>If you have any questions about these Terms of Use, please contact us through the Contact Us section of our website.</p>
            </div>
          </div>
        </div>
      )}
    </div>
        
        
    </>
    
  );
  

}