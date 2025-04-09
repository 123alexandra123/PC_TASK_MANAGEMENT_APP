// MainPage.jsx

import React from 'react';
import Navbar from '../Navbar/Navbar'; // Importăm componenta Navbar

const MainPage = () => {
  return (
    <div>
      <Navbar /> 
      <div className="main-content">
        <h1>Bine ai venit în MainPage!</h1>
      </div>
    </div>
  );
};

export default MainPage;
