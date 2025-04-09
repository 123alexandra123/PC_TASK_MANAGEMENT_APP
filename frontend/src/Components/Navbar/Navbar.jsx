// Navbar.jsx

import React from 'react';
import './Navbar.css'; // Importăm stilurile CSS pentru navbar

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">Logo</a>
      </div>
      <ul className="navbar-links">
        <li><a href="/">Acasă</a></li>
        <li><a href="/servicii">Servicii</a></li>
        <li><a href="/despre">Despre</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;
