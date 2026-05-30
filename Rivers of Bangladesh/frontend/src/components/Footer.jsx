import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full px-margin-mobile md:px-margin-desktop py-lg flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-lowest border-t border-outline-variant mt-auto">
      <div className="flex flex-col items-center md:items-start gap-xs text-center md:text-left">
        <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">RIVERFLOW</span>
        <p className="font-label-sm text-label-sm text-on-surface-variant opacity-80">© 2026 RiverFlow Bangladesh. All Rights Reserved.</p>
      </div>
      <nav className="flex flex-wrap justify-center gap-md">
        <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary liquid-transition" to="/">Home</Link>
        <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary liquid-transition" to="/explorer">Explorer</Link>
        <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary liquid-transition" to="/blog">Blog</Link>
        <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary liquid-transition" to="/forum">Forum</Link>
      </nav>
      <div className="flex items-center gap-sm">
        <button className="w-10 h-10 rounded-full flex items-center justify-center glass-panel hover:text-primary liquid-transition cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">language</span>
        </button>
        <button className="w-10 h-10 rounded-full flex items-center justify-center glass-panel hover:text-primary liquid-transition cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">share</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
