import "/src/css/FooterModule.css";
import { Link } from 'react-router-dom'
import { useState, useEffect } from "react";


export default function FooterModule() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleMouseMove(e) {
      if (window.innerHeight - e.clientY < 50) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <footer className={`bottom-footer ${visible ? "visible" : "hidden"}`}>
      <button className="footer-button register">
        <Link to="/loginReg">Registration</Link>
      </button>
      <button className="footer-button login">
        <Link to="/loginReg">Login</Link>
      </button>
    </footer>
  );
}