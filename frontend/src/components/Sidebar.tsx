import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, History, MapPin, CheckSquare, 
  Map, FileText, Users, Award, ShieldCheck, HeartHandshake,
  Brain, BarChart2, Trophy, Flame, Activity, Calendar
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Analytics Dashboard', icon: <Award size={18} /> },
          { to: '/admin/approvals', label: 'Approval Queue', icon: <CheckSquare size={18} /> },
          { to: '/admin/users', label: 'User Management', icon: <Users size={18} /> },
          { to: '/admin/donations', label: 'Donation Audits', icon: <HeartHandshake size={18} /> },
          { to: '/admin/deliveries', label: 'Delivery Monitor', icon: <MapPin size={18} /> },
          { to: '/admin/heatmap', label: 'Hunger Heatmap', icon: <Flame size={18} /> },
          { to: '/admin/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
          { to: '/admin/logs', label: 'Fraud & Logs', icon: <Activity size={18} /> },
        ];
      case 'NGO':
        return [
          { to: '/ngo', label: 'Dashboard Overview', icon: <Award size={18} /> },
          { to: '/ngo/incoming', label: 'Incoming Donations', icon: <PlusCircle size={18} /> },
          { to: '/ngo/tracking', label: 'Live Tracking Map', icon: <Map size={18} /> },
          { to: '/ngo/verify', label: 'Verify Deliveries', icon: <ShieldCheck size={18} /> },
          { to: '/ngo/emergency', label: 'Emergency Requests', icon: <Activity size={18} /> },
          {to: '/ngo/hubs', label: 'Fridge & Cold Storage', icon: <Activity size={18} /> },
          { to: '/ngo/heatmap', label: 'Hunger Heatmap', icon: <Flame size={18} /> },
          { to: '/ngo/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
          { to: '/ngo/profile', label: 'Legal Docs & Profile', icon: <FileText size={18} /> },
          { to: '/ngo/reports', label: 'Distribution Reports', icon: <FileText size={18} /> },
        ];
      case 'VOLUNTEER':
        return [
          { to: '/volunteer', label: 'Available Pickups', icon: <PlusCircle size={18} /> },
          { to: '/volunteer/my-jobs', label: 'My Deliveries', icon: <Map size={18} /> },
          { to: '/volunteer/map', label: 'Active Route Map', icon: <MapPin size={18} /> },
          { to: '/volunteer/achievements', label: 'Achievements Center', icon: <Award size={18} /> },
          { to: '/volunteer/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
        ];
      default: // ORGANISATIONAL & INDIVIDUAL DONOR
        return [
          { to: '/donor', label: 'Active Donations', icon: <HeartHandshake size={18} /> },
          { to: '/donor/create', label: 'Donate Food', icon: <PlusCircle size={18} /> },
          { to: '/donor/schedules', label: 'Smart Scheduler', icon: <Calendar size={18} /> },
          { to: '/donor/predict', label: 'AI Prediction', icon: <Brain size={18} /> },
          { to: '/donor/waste', label: 'Waste Analytics', icon: <BarChart2 size={18} /> },
          { to: '/donor/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
          { to: '/donor/history', label: 'Donation History', icon: <History size={18} /> },
          { to: '/donor/track', label: 'Track Volunteers', icon: <MapPin size={18} /> },
        ];
    }
  };

  const links = getLinks();

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 w-64 p-6 glass-card border-r border-slate-200 dark:border-slate-800
    transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-80px)]
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex flex-col gap-2 h-full justify-between">
          <div className="flex flex-col gap-6">
            <div className="hidden lg:block pb-2 border-b border-slate-100 dark:border-slate-800/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Main Menu
              </span>
            </div>
            
            <nav className="flex flex-col gap-1.5">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/admin' || link.to === '/ngo' || link.to === '/volunteer' || link.to === '/donor'}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200
                    ${isActive 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/10' 
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }
                  `}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
            <h4 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Our Shared Mission</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              Connecting surplus food directly with shelters and community centers to reduce food wastage.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
