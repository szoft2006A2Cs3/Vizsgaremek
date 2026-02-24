import "/src/css/FooterModule.css";
import { Link } from 'react-router-dom'
import { useState, useEffect } from "react";


export default function FooterModule({setActiveForm}) {
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
      <Link onClick={() => setActiveForm('register')} to="/loginReg">
        <button  className="footer-button register">
          <link-text>Registration</link-text>
        </button>
      </Link>
      <Link onClick={() => setActiveForm('login')} to="/loginReg">
        <button  className="footer-button login">
          <link-text>Login</link-text>
        </button>
      </Link>
    </footer>
  );
}