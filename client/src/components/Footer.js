import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <div id="footer">
        <Link to="/displayPolicy/Security">
            <button id="FAQ" >Security and Privacy Policy</button>
        </Link>
        <Link to="/displayPolicy/DMCA">
            <button id="FAQ">DMCA Notice & Takedown Policy</button>
        </Link>
        <Link to="/displayPolicy/AUP">
            <button id="FAQ">AUP</button>
        </Link>
    </div>
  )
}

export default Footer;