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

const faqItems = Array.from({ length: 10 }, (_, index) => ({
  question: `Question ${index + 1}`,
  answer: `Answer ${index + 1}`,
}));


export default function FrontPage()
{
    const [currentIndex, setCurrentIndex] = useState(0);
    const [translate, setTranslate] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

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

              <h4>4. Privacy Policy</h4>
              <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.</p>

              <h4>5. Content</h4>
              <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material ("Content"). You are responsible for the Content that you post to the Service.</p>

              <h4>6. Prohibited Uses</h4>
              <p>You may not use our Service:</p>
              <ul>
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
              </ul>

              <h4>7. Termination</h4>
              <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>

              <h4>8. Limitation of Liability</h4>
              <p>In no event shall Brckett, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>

              <h4>9. Disclaimer</h4>
              <p>The information on this Service is provided on an 'as is' basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms whether express or implied, statutory or otherwise.</p>

              <h4>10. Governing Law</h4>
              <p>These Terms shall be interpreted and governed by the laws of the jurisdiction in which Brckett operates, without regard to its conflict of law provisions.</p>

              <h4>11. Changes to Terms</h4>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>

              <h4>12. Contact Information</h4>
              <p>If you have any questions about these Terms of Use, please contact us through the Contact Us section of our website.</p>
            </div>
          </div>
        </div>
      )}
    </div>
        
        
    </>
    
  );
  

}
