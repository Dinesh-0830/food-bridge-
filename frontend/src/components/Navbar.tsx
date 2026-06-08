import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Moon, Sun, LogOut, Menu, User as UserIcon, ShieldAlert, Mic, Loader2 } from 'lucide-react';

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

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [voiceText, setVoiceText] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState<'en' | 'te' | 'hi'>('en');
  const [voiceError, setVoiceError] = useState('');

  const startSpeechRecognition = () => {
    setVoiceText('');
    setVoiceError('');
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('error');
      setVoiceError('Speech recognition is not supported in this browser. Please type your voice request below.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    if (voiceLanguage === 'te') {
      recognition.lang = 'te-IN'; // Telugu
    } else if (voiceLanguage === 'hi') {
      recognition.lang = 'hi-IN'; // Hindi
    } else {
      recognition.lang = 'en-US'; // English
    }

    recognition.onstart = () => {
      setVoiceStatus('listening');
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setVoiceStatus('error');
      setVoiceError(`Voice detection failed: ${event.error}. Please try again or type below.`);
    };

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setVoiceText(resultText);
      processVoiceCommand(resultText);
    };

    recognition.start();
  };

  const processVoiceCommand = (text: string) => {
    setVoiceStatus('processing');
    
    setTimeout(() => {
      const cleanText = text.toLowerCase();
      let qty = 30;
      const matchNumber = cleanText.match(/\d+/);
      if (matchNumber) {
        qty = parseInt(matchNumber[0]);
      } else {
        if (cleanText.includes('fifty') || cleanText.includes('యాభై') || cleanText.includes('पचास')) qty = 50;
        else if (cleanText.includes('twenty') || cleanText.includes('ఇరవై') || cleanText.includes('बीस')) qty = 20;
        else if (cleanText.includes('ten') || cleanText.includes('పది') || cleanText.includes('दस')) qty = 10;
        else if (cleanText.includes('hundred') || cleanText.includes('వంద') || cleanText.includes('सौ')) qty = 100;
      }

      setVoiceStatus('success');

      if (cleanText.includes('donate') || cleanText.includes('surplus') || cleanText.includes('food') || cleanText.includes('దానం') || cleanText.includes('భోజనం') || cleanText.includes('दान') || cleanText.includes('भोजन')) {
        setShowVoiceModal(false);
        navigate(`/donor/create?foodName=Voice%20Surplus%20Donation&quantity=${qty}&notes=Created%20via%2520Voice%2520AI%2520Assistant%2520(${text})`);
      } else if (cleanText.includes('map') || cleanText.includes('track') || cleanText.includes('route') || cleanText.includes('మ్యాప్') || cleanText.includes('మార్గం') || cleanText.includes('नक्शा') || cleanText.includes('मार्ग')) {
        setShowVoiceModal(false);
        if (user?.role === 'VOLUNTEER') navigate('/volunteer/map');
        else if (user?.role === 'NGO') navigate('/ngo/tracking');
        else navigate('/donor/track');
      } else if (cleanText.includes('predict') || cleanText.includes('leftover') || cleanText.includes('అంచనా') || cleanText.includes('पूर्वानुमान')) {
        setShowVoiceModal(false);
        navigate('/donor/predict');
      } else if (cleanText.includes('leaderboard') || cleanText.includes('points') || cleanText.includes('స్థానం') || cleanText.includes('रैंकिंग')) {
        setShowVoiceModal(false);
        navigate(`/${user?.role?.toLowerCase()}/leaderboard`);
      } else {
        setVoiceStatus('idle');
        alert(`Recognized: "${text}". Redirecting to your dashboard...`);
        setShowVoiceModal(false);
        navigate(getDashboardPath());
      }
    }, 1200);
  };

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

        {/* Voice AI Assistant Button */}
        {user && (
          <button
            onClick={() => {
              setShowVoiceModal(true);
              setVoiceStatus('idle');
              setVoiceText('');
              setVoiceError('');
            }}
            className="p-2.5 text-emerald-600 hover:text-emerald-500 hover:bg-emerald-500/10 dark:text-emerald-450 dark:hover:text-emerald-400 dark:hover:bg-emerald-400/5 rounded-xl transition-all flex items-center justify-center"
            title="Voice AI Assistant"
          >
            <Mic size={18} className="animate-pulse" />
          </button>
        )}

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

      {/* Voice AI Assistant Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative flex flex-col items-center gap-4 text-center animate-scale-up">
            <button 
              onClick={() => setShowVoiceModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-850"
            >
              ✕
            </button>

            <h3 className="font-extrabold text-sm flex items-center gap-1.5 mt-2">
              <Mic size={18} className="text-emerald-500 animate-pulse" />
              Voice AI Assistant
            </h3>
            <p className="text-xs text-slate-400">
              Speak or type commands to navigate, schedule, or list donations instantly in English, Telugu, or Hindi.
            </p>

            <div className="flex gap-2 bg-slate-100 dark:bg-slate-955 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 w-full justify-center">
              <button 
                type="button"
                onClick={() => setVoiceLanguage('en')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${voiceLanguage === 'en' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}
              >
                English
              </button>
              <button 
                type="button"
                onClick={() => setVoiceLanguage('te')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${voiceLanguage === 'te' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}
              >
                తెలుగు (Telugu)
              </button>
              <button 
                type="button"
                onClick={() => setVoiceLanguage('hi')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${voiceLanguage === 'hi' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}
              >
                हिन्दी (Hindi)
              </button>
            </div>

            {/* Mic wave visuals depending on status */}
            <div className="w-full h-32 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 relative overflow-hidden p-4">
              {voiceStatus === 'idle' && (
                <button
                  type="button"
                  onClick={startSpeechRecognition}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-5 rounded-full hover-scale cursor-pointer flex items-center justify-center border border-emerald-500/20"
                >
                  <Mic size={28} />
                </button>
              )}

              {voiceStatus === 'listening' && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-1.5 items-center justify-center">
                    <span className="w-1 bg-emerald-500 h-8 rounded-full animate-bounce delay-100" />
                    <span className="w-1 bg-emerald-500 h-12 rounded-full animate-bounce delay-300" />
                    <span className="w-1 bg-emerald-500 h-10 rounded-full animate-bounce delay-200" />
                    <span className="w-1 bg-emerald-500 h-6 rounded-full animate-bounce delay-500" />
                    <span className="w-1 bg-emerald-500 h-12 rounded-full animate-bounce delay-400" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">Listening... Speak now</span>
                </div>
              )}

              {voiceStatus === 'processing' && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-emerald-500" size={28} />
                  <span className="text-[10px] font-bold text-slate-400">Processing with NLP Engine...</span>
                </div>
              )}

              {voiceStatus === 'success' && (
                <div className="flex flex-col items-center gap-1.5 text-emerald-655 dark:text-emerald-400">
                  <span className="text-xl">🎉</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Command Understood! Redirecting...</span>
                </div>
              )}

              {voiceStatus === 'error' && (
                <div className="p-3 text-[10px] text-rose-500 bg-rose-500/5 rounded-xl border border-rose-500/10 max-h-24 overflow-y-auto">
                  ⚠️ {voiceError}
                </div>
              )}

              {voiceText && (
                <p className="absolute bottom-2 text-[10px] font-medium text-slate-450 italic max-w-[90%] truncate mt-1">
                  "{voiceText}"
                </p>
              )}
            </div>

            {/* Input Fallback */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const textInput = (e.target as any).elements.voiceQuery.value;
                if (textInput.trim()) {
                  setVoiceText(textInput);
                  processVoiceCommand(textInput);
                }
              }}
              className="flex gap-2 w-full mt-1"
            >
              <input 
                type="text" 
                name="voiceQuery"
                placeholder="Type fallback command (e.g. donate 50 meals)..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
              />
              <button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Send
              </button>
            </form>

            <div className="text-[9px] text-slate-450 text-left w-full border-t border-slate-100 dark:border-slate-800/40 pt-3 flex flex-col gap-1">
              <p>💡 English: <strong>"Donate 50 meals"</strong> or <strong>"Show maps"</strong></p>
              <p>💡 Telugu: <strong>"యాభై భోజనాలు దానం"</strong> or <strong>"మ్యాప్ చూపించు"</strong></p>
              <p>💡 Hindi: <strong>"पचास भोजन दान"</strong> or <strong>"नक्शा दिखाओ"</strong></p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
