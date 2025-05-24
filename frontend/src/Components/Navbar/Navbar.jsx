import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Navbar.css';
import { FaUser } from "react-icons/fa";
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const isAdmin = sessionStorage.getItem('is_admin') === '1';

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container-fluid">
        <NavLink className="navbar-brand me-auto" to="/">📋Task Management App</NavLink>

        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Menu</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-center flex-grow-1 pe-3">
              <li className="nav-item">
                <NavLink
                  to="/main"
                  className={({ isActive }) =>
                    "nav-link mx-lg-2" + (isActive ? " active" : "")
                  }
                >
                  All Tasks
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/completed"
                  className={({ isActive }) =>
                    "nav-link mx-lg-2" + (isActive ? " active" : "")
                  }
                >
                  Completed Tasks
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/pending"
                  className={({ isActive }) =>
                    "nav-link mx-lg-2" + (isActive ? " active" : "")
                  }
                >
                  Pending Tasks
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/charts"
                  className={({ isActive }) =>
                    "nav-link mx-lg-2" + (isActive ? " active" : "")
                  }
                >
                  Charts
                </NavLink>
              </li>

              {/* ✅ Vizibil doar pentru admini */}
              {isAdmin && (
                <li className="nav-item">
                  <NavLink
                    to="/manage-teams"
                    className={({ isActive }) =>
                      "nav-link mx-lg-2" + (isActive ? " active" : "")
                    }
                  >
                    Manage Teams
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            "nav-link profile-icon" + (isActive ? " active" : "")
          }
          title="Profile"
        >
          <FaUser style={{ fontSize: '1.5rem', marginLeft: '10px', color: '#000' }} />
        </NavLink>

        <button
          className="navbar-toggler pe-0"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;