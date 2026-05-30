import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-gutter py-sm bg-surface/80 backdrop-blur-md border-b border-white/10 shadow-sm dark:shadow-none h-16">
      <div className="flex items-center gap-md">
        <Link to="/" className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
          RIVERFLOW
        </Link>
        <nav className="hidden md:flex items-center gap-lg">
          <NavLink 
            to="/explorer" 
            className={({ isActive }) => 
              `font-body-md text-body-md liquid-transition ${
                isActive 
                  ? "text-primary border-b-2 border-primary pb-1" 
                  : "text-on-surface-variant hover:text-primary"
              }`
            }
          >
            Explorer
          </NavLink>
          <NavLink 
            to="/blog" 
            className={({ isActive }) => 
              `font-body-md text-body-md liquid-transition ${
                isActive 
                  ? "text-primary border-b-2 border-primary pb-1" 
                  : "text-on-surface-variant hover:text-primary"
              }`
            }
          >
            Blog
          </NavLink>
          <NavLink 
            to="/forum" 
            className={({ isActive }) => 
              `font-body-md text-body-md liquid-transition ${
                isActive 
                  ? "text-primary border-b-2 border-primary pb-1" 
                  : "text-on-surface-variant hover:text-primary"
              }`
            }
          >
            Forum
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-base">
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-xs px-sm py-xs bg-surface-container-high/40 hover:bg-surface-container-high/70 rounded-full border border-white/10 transition-all cursor-pointer text-primary"
            >
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
              <span className="font-label-sm text-label-sm hidden sm:inline">{user.username}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-xs w-48 bg-surface-container border border-white/15 rounded-lg shadow-xl py-xs z-50 glass-panel no-tilt">
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-xs px-md py-sm font-label-sm text-label-sm text-primary hover:bg-white/5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    Admin Panel
                  </Link>
                )}
                <Link 
                  to="/explorer" 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-xs px-md py-sm font-label-sm text-label-sm text-on-surface hover:bg-white/5 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">explore</span>
                  Map Explorer
                </Link>
                <div className="h-px bg-white/10 my-xs"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-xs px-md py-sm font-label-sm text-label-sm text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary-fixed font-bold font-label-sm text-label-sm rounded-full cursor-pointer transition-all hover:brightness-110 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            Login / Signup
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
