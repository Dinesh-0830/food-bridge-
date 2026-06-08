import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Moon, Sun, LogOut, Menu, User as UserIcon, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  toggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'NGO': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'VOLUNTEER': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      default: return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'ADMIN': return '/admin';
      case 'NGO': return '/ngo';
      case 'VOLUNTEER': return '/volunteer';
      default: return '/donor';
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-nav px-6 py-4 flex items-center justify-between">
      {/* Brand & Left Actions */}
      <div className="flex items-center gap-4">
        {user && toggleSidebar && (
          <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden">
            <Menu size={20} />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🤝</span>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
            FoodBridge
          </span>
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Switcher */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <>
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-200 dark:border-slate-800">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-4 border-b border-slate-50 dark:border-slate-800/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col gap-1 transition-all ${
                            !n.read ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500' : ''
                          }`}
                        >
                          <h4 className="text-xs font-bold">{n.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{n.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                  {user.profile?.name?.charAt(0) || user.profile?.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col items-start pr-2">
                  <span className="text-xs font-bold truncate max-w-[120px]">
                    {user.profile?.name || user.profile?.fullName || 'User'}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase mt-0.5 ${getRoleBadge(user.role)}`}>
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 glass-card rounded-2xl shadow-2xl p-2 z-50 border border-slate-200 dark:border-slate-800">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800/60 flex flex-col gap-1">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-xs font-semibold truncate">{user.email}</p>
                    {user.status !== 'APPROVED' && (
                      <span className="text-[10px] text-amber-500 flex items-center gap-1 mt-1 font-semibold">
                        <ShieldAlert size={12} /> Pending Approval
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                      <UserIcon size={14} /> My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-xl"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl hover-scale shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
