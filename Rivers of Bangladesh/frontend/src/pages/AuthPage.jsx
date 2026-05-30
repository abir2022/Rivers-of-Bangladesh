import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const AuthPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState(''); // for login
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginTab) {
        // Handle Login
        const response = await axios.post('/api/auth/login', {
          emailOrUsername,
          password
        });
        login(response.data.token, response.data.user);
        navigate('/explorer');
      } else {
        // Handle Registration
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

        const response = await axios.post('/api/auth/register', {
          username,
          email,
          password
        });
        login(response.data.token, response.data.user);
        navigate('/explorer');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-background px-margin-mobile md:px-xs">
      
      {/* Glow Blur Effect in Background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Centered Auth Card */}
      <div className="w-full max-w-[420px] glass-panel p-lg rounded-xl flex flex-col space-y-md border border-white/10 relative z-10 scale-[1.01] animate-fadeIn">
        
        {/* Brand/Branding inside Card */}
        <div className="text-center space-y-xs">
          <span className="font-data-mono text-data-mono text-[10px] text-primary uppercase tracking-widest block">
            RiverFlow Access Node
          </span>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            {isLoginTab ? 'Explorer Sign In' : 'Enlist New Explorer'}
          </h2>
          <p className="text-xs text-on-surface-variant">
            {isLoginTab 
              ? 'Provide credentials to link with geographical terminals' 
              : 'Create profile to log field telemetry and debate dynamics'}
          </p>
        </div>

        {/* Custom Tab Selector */}
        <div className="grid grid-cols-2 gap-xs bg-white/5 p-xs rounded-lg border border-white/5">
          <button 
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setError('');
            }}
            className={`py-xs text-xs font-label-sm rounded transition-all cursor-pointer ${
              isLoginTab 
                ? 'bg-primary text-on-primary-fixed shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setError('');
            }}
            className={`py-xs text-xs font-label-sm rounded transition-all cursor-pointer ${
              !isLoginTab 
                ? 'bg-primary text-on-primary-fixed shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Create Profile
          </button>
        </div>

        {/* Display Errors */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-sm rounded-lg flex items-center gap-xs">
            <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
            <span className="text-[11px] text-red-400 font-label-sm">{error}</span>
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-sm">
          {isLoginTab ? (
            /* Login Form fields */
            <>
              <div>
                <label className="font-label-sm text-[11px] text-on-surface-variant block mb-xs">Email or Username</label>
                <input 
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="explorer@riverflow.org"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-sm focus:ring-1 focus:ring-primary outline-none text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="font-label-sm text-[11px] text-on-surface-variant block mb-xs">Authorization Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-sm focus:ring-1 focus:ring-primary outline-none text-xs text-on-surface"
                />
              </div>
            </>
          ) : (
            /* Registration Form fields */
            <>
              <div>
                <label className="font-label-sm text-[11px] text-on-surface-variant block mb-xs">Username</label>
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="explorer_akram"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-sm focus:ring-1 focus:ring-primary outline-none text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="font-label-sm text-[11px] text-on-surface-variant block mb-xs">Email Address</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="explorer@riverflow.org"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-sm focus:ring-1 focus:ring-primary outline-none text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="font-label-sm text-[11px] text-on-surface-variant block mb-xs">Authorization Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-sm focus:ring-1 focus:ring-primary outline-none text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="font-label-sm text-[11px] text-on-surface-variant block mb-xs">Confirm Password</label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-sm focus:ring-1 focus:ring-primary outline-none text-xs text-on-surface"
                />
              </div>
            </>
          )}

          {/* Submit Trigger Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full btn-3d-primary py-sm rounded-lg font-label-sm font-bold text-on-primary-container flex items-center justify-center gap-xs cursor-pointer transition-all hover:brightness-110 mt-md text-xs"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                {isLoginTab ? 'Link with Explorer Terminal' : 'Initiate Explorer Profile'}
              </>
            )}
          </button>
        </form>

        {/* Mock Accounts Helper tooltip */}
        {isLoginTab && (
          <div className="bg-white/5 p-xs rounded border border-white/5 text-[10px] text-on-surface-variant text-center leading-normal">
            <span className="text-secondary font-bold font-data-mono">MOCK TEST CREDENTIALS:</span><br />
            Admin Account: <span className="text-primary font-bold">admin@riverflow.org</span> (pass: <span className="text-primary font-bold">admin123</span>)<br />
            User Account: <span className="text-primary font-bold">kamal@riverflow.org</span> (pass: <span className="text-primary font-bold">user123</span>)
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthPage;
