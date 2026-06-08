import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      
      // Redirect based on user role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'NGO') {
        navigate('/ngo');
      } else if (user.role === 'VOLUNTEER') {
        navigate('/volunteer');
      } else {
        navigate('/donor');
      }
    } catch (err: any) {
      console.error('Login error page:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-dark-50 flex items-center justify-center p-6 relative overflow-hidden grid-bg">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl relative z-10">
        
        {/* Brand */}
        <div className="text-center flex flex-col gap-2 mb-8">
          <Link to="/" className="text-3xl justify-center flex items-center gap-2">
            <span>🤝</span>
            <span className="font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              FoodBridge
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight mt-3">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to connect surplus food with local needs.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-semibold text-center mb-6">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <button 
                type="button"
                onClick={() => alert('For demo, use seeded accounts or create a new registration.')}
                className="text-[10px] text-slate-400 hover:text-emerald-500 font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-10 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-bold py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl hover-scale shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-bold">
            Create an Account
          </Link>
        </div>

        {/* Demo Accounts Quick Fill */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Demo Access</p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {[
              { role: 'Hotel Donor', email: 'grandplaza@hotel.com' },
              { role: 'Individual', email: 'sarah@donor.com' },
              { role: 'NGO Agent', email: 'hope@ngo.org' },
              { role: 'Volunteer', email: 'john@volunteer.com' },
            ].map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  setEmail(account.email);
                  setPassword('password123');
                }}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-left transition-all"
              >
                <p className="font-semibold">{account.role}</p>
                <p className="text-slate-400 truncate mt-0.5">{account.email}</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
