import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { MapComponent } from '../components/MapComponent';
import api from '../services/api';
import { 
  Users, CheckSquare, Award, Clock, HeartHandshake, 
  MapPin, Loader2, UserCheck, UserX, BarChart3, TrendingUp,
  Trophy, Flame, Activity
} from 'lucide-react';
import { HungerHeatmap } from '../components/HungerHeatmap';
import { useSocket } from '../context/SocketContext';

// Subcomponent: Admin Leaderboards
const LeaderboardView: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'donors' | 'volunteers'>('donors');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/analytics/leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Error fetching leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p className="text-xs text-slate-400">Loading standings...</p>
      </div>
    );
  }

  const rankings = activeTab === 'donors' ? leaderboard?.donors || [] : leaderboard?.volunteers || [];

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="font-extrabold text-sm flex items-center gap-2">
            <Trophy className="text-amber-500" />
            Tirupati Leaderboard & Badges
          </h3>
          <p className="text-xs text-slate-400 mt-1">Honoring hotels, restaurants, and volunteers rescuing food daily.</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('donors')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'donors'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Donors (Hotels)
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'volunteers'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Volunteer Riders
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <th className="p-3 w-16">Rank</th>
              <th className="p-3">Name</th>
              <th className="p-3">{activeTab === 'donors' ? 'Meals Donated' : 'Deliveries'}</th>
              <th className="p-3">Badges Earned</th>
              <th className="p-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {rankings.map((r: any, idx: number) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <tr 
                  key={r.id} 
                  className={`border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-100/30 dark:hover:bg-slate-800/10 ${
                    idx === 0 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="p-3 font-bold">
                    {idx < 3 ? medals[idx] : `#${idx + 1}`}
                  </td>
                  <td className="p-3 font-extrabold">
                    {r.name}
                  </td>
                  <td className="p-3">
                    {activeTab === 'donors' ? `${r.meals} meals` : `${r.deliveries} jobs`}
                  </td>
                  <td className="p-3">
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold text-[10px]">
                      {r.badge}
                    </span>
                  </td>
                  <td className="p-3 font-black text-right text-emerald-600 dark:text-emerald-400">
                    {r.points} pts
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Subcomponent: System Logs
const LogsView: React.FC = () => {
  const dummyLogs = [
    { time: '12:10:45 PM', level: 'SYSTEM', msg: 'GPS route tracking audit completed for John Rider (Vol-402) - SVIMS path validated.', status: 'SUCCESS' },
    { time: '12:05:12 PM', level: 'AI_IMAGE', msg: 'Verification analysis scan completed for Grand Plaza Hotel photo check: clean, freshness index 96%.', status: 'SUCCESS' },
    { time: '11:45:00 AM', level: 'SECURITY', msg: 'Unusual donation quantity surge warning: SV University reported 300 meals listed. Flagged: False.', status: 'INFO' },
    { time: '11:32:10 AM', level: 'NGO_REQ', msg: 'Emergency Request auto-notification broadcast to 6 donors SV Temple Trust & Ramanuja district.', status: 'SUCCESS' },
    { time: '11:15:33 AM', level: 'SYSTEM', msg: 'Prisma SQLite connection pool checked - 0 errors. File locked and synced successfully.', status: 'SUCCESS' },
    { time: '10:40:02 AM', level: 'SECURITY', msg: 'User role update audit: SVIMS canteen user SVIMS_NGO verified and activated.', status: 'SUCCESS' },
    { time: '10:02:18 AM', level: 'DONATION', msg: 'Audit checklist generated for SV University hostel listing SVU-822 - verified by admin SVIMS.', status: 'SUCCESS' }
  ];

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in">
      <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2">
        <Activity className="text-emerald-500" />
        Fraud Audits & System Console Logs
      </h3>
      <p className="text-xs text-slate-400 mb-6">Real-time verification log feed, automated AI checks, and platform activity monitoring.</p>
      
      <div className="bg-slate-950 text-slate-350 p-5 rounded-2xl border border-slate-800 font-mono text-[11px] leading-relaxed flex flex-col gap-2.5 h-[360px] overflow-y-auto shadow-inner">
        {dummyLogs.map((log, idx) => (
          <div key={idx} className="flex gap-3 hover:bg-slate-900/40 p-1 rounded transition-colors">
            <span className="text-slate-500 shrink-0">{log.time}</span>
            <span className={`px-1.5 py-0.5 rounded font-black text-[9px] shrink-0 ${
              log.level === 'SYSTEM' ? 'bg-blue-905 text-blue-400 border border-blue-900/60' :
              log.level === 'SECURITY' ? 'bg-amber-905 text-amber-400 border border-amber-900/60' :
              log.level === 'AI_IMAGE' ? 'bg-purple-905 text-purple-400 border border-purple-900/60' :
              'bg-emerald-905 text-emerald-400 border border-emerald-900/60'
            }`}>{log.level}</span>
            <span className="flex-1">{log.msg}</span>
            <span className={`font-black text-[9px] ${log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-amber-500'}`}>{log.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { socket, joinDeliveryRoom, leaveDeliveryRoom } = useSocket();
  
  const { pathname } = useLocation();
  
  // Determine active tab from URL path
  let activeTab = 'analytics';
  if (pathname.includes('/approvals')) activeTab = 'approvals';
  else if (pathname.includes('/users')) activeTab = 'users';
  else if (pathname.includes('/donations')) activeTab = 'donations';
  else if (pathname.includes('/deliveries')) activeTab = 'deliveries';
  else if (pathname.includes('/heatmap')) activeTab = 'heatmap';
  else if (pathname.includes('/leaderboard')) activeTab = 'leaderboard';
  else if (pathname.includes('/logs')) activeTab = 'logs';

  // Dashboard data states
  const [users, setUsers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [liveLocation, setLiveLocation] = useState<{ [key: string]: { lat: number; lng: number } }>({});
  const [analytics, setAnalytics] = useState<any>({
    summary: {
      totalMealsDelivered: 0,
      users: { organizations: 0, individuals: 0, volunteers: 0, ngos: 0, total: 0 },
      donations: { pending: 0, active: 0, completed: 0, total: 0 }
    },
    leaderboard: [],
    recentDeliveries: []
  });

  // Disaster Relief Mode states
  const [disasterModeActive, setDisasterModeActive] = useState(false);
  const [togglingDisaster, setTogglingDisaster] = useState(false);

  // Multi-City selector state
  const [selectedCity, setSelectedCity] = useState<'Tirupati' | 'Nellore' | 'Kadapa'>('Tirupati');

  // Mock city stats comparison
  const cityComparisonData = {
    Tirupati: {
      rescuedMeals: 1450,
      activeDonors: 14,
      volunteersCount: 22,
      efficiencyIndex: 94,
      topZone: 'Ramanuja Circle'
    },
    Nellore: {
      rescuedMeals: 980,
      activeDonors: 9,
      volunteersCount: 15,
      efficiencyIndex: 88,
      topZone: 'Nellore Bypass Center'
    },
    Kadapa: {
      rescuedMeals: 620,
      activeDonors: 6,
      volunteersCount: 10,
      efficiencyIndex: 82,
      topZone: 'Kadapa Main Bypass'
    }
  };

  const currentCityStats = cityComparisonData[selectedCity];

  const fetchDisasterStatus = async () => {
    try {
      const res = await api.get('/disaster/status');
      setDisasterModeActive(!!res.data.disasterMode);
    } catch (err) {
      console.error('Error fetching disaster status:', err);
    }
  };

  const handleToggleDisasterMode = async () => {
    setTogglingDisaster(true);
    try {
      const nextVal = !disasterModeActive;
      const res = await api.post('/disaster/toggle', { active: nextVal });
      if (res.data.success) {
        setDisasterModeActive(res.data.disasterMode);
        alert(`Disaster Relief Mode has been ${res.data.disasterMode ? 'ACTIVATED' : 'DEACTIVATED'} successfully.`);
      }
    } catch (err) {
      alert('Failed to toggle Disaster Relief Mode');
    } finally {
      setTogglingDisaster(false);
    }
  };

  const handleApproveNgoDocs = async (ngoId: string, docStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/admin/ngos/${ngoId}/approve-docs`, { status: docStatus });
      fetchData();
      alert(`NGO documents have been ${docStatus}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update NGO documents status');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, analyticsRes, donationsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/analytics'),
        api.get('/donations')
      ]);

      setUsers(usersRes.data.users);
      setAnalytics(analyticsRes.data);
      setDonations(donationsRes.data.donations);
    } catch (err) {
      console.error('Error loading Admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDisasterStatus();
  }, []);

  useEffect(() => {
    const activeAssignments = donations
      .filter(d => ['ACCEPTED', 'ASSIGNED', 'PICKED_UP'].includes(d.status))
      .map(d => d.assignments?.[0])
      .filter(Boolean);

    if (activeAssignments.length === 0 || !socket) return;

    activeAssignments.forEach(a => {
      joinDeliveryRoom(a.id);
    });

    const handleLocationChange = (data: { assignmentId: string; latitude: number; longitude: number }) => {
      setLiveLocation(prev => ({
        ...prev,
        [data.assignmentId]: { lat: data.latitude, lng: data.longitude }
      }));
    };

    socket.on('location-changed', handleLocationChange);

    return () => {
      activeAssignments.forEach(a => {
        leaveDeliveryRoom(a.id);
      });
      socket.off('location-changed', handleLocationChange);
    };
  }, [donations, socket]);

  const handleApprove = async (userId: string, approveStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/admin/users/${userId}/approve`, { status: approveStatus });
      fetchData();
      alert(`User status updated to ${approveStatus}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const pendingApprovalsList = users.filter((u: any) => u.status === 'PENDING');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-dark-50 flex flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                Admin Console
                {disasterModeActive && (
                  <span className="text-[10px] font-extrabold bg-red-650 text-white px-2.5 py-1 rounded-full animate-pulse uppercase tracking-wider">
                    Disaster Relief Active
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400 mt-1">Audit platform accounts, verify listings, and inspect analytics.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleToggleDisasterMode}
                disabled={togglingDisaster}
                className={`text-xs font-extrabold px-4 py-2.5 rounded-xl hover-scale transition-all shadow-md flex items-center gap-1.5 ${
                  disasterModeActive
                    ? 'bg-red-600 text-white hover:bg-red-500 animate-pulse'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-250 hover:bg-slate-50'
                }`}
              >
                {togglingDisaster ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : disasterModeActive ? (
                  '🚨 DEACTIVATE SOS MODE'
                ) : (
                  '🚨 ACTIVATE SOS MODE'
                )}
              </button>

              {/* Quick tabs selector */}
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/40 text-xs font-bold">
                {[
                  { id: 'analytics', path: '/admin', label: 'Analytics', icon: <BarChart3 size={14} /> },
                  { id: 'approvals', path: '/admin/approvals', label: `Approvals (${pendingApprovalsList.length + users.filter((u: any) => u.role === 'NGO' && u.profile && (u.profile.regCertificateUrl || u.profile.govApprovalUrl) && u.profile.documentStatus === 'PENDING').length})`, icon: <CheckSquare size={14} /> },
                  { id: 'users', path: '/admin/users', label: 'Manage Users', icon: <Users size={14} /> },
                  { id: 'donations', path: '/admin/donations', label: 'Donation Audits', icon: <HeartHandshake size={14} /> },
                  { id: 'deliveries', path: '/admin/deliveries', label: 'Delivery Monitor', icon: <MapPin size={14} /> },
                  { id: 'heatmap', path: '/admin/heatmap', label: 'Hunger Heatmap', icon: <Flame size={14} /> },
                  { id: 'leaderboard', path: '/admin/leaderboard', label: 'Leaderboard', icon: <Trophy size={14} /> },
                  { id: 'logs', path: '/admin/logs', label: 'Fraud & Logs', icon: <Activity size={14} /> },
                ].map((tab) => (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-emerald-500" size={40} />
              <p className="text-xs text-slate-400">Loading console data...</p>
            </div>
          ) : (
            <>
          <Routes>
            {/* ANALYTICS VIEW */}
            <Route path="/" element={
              <div className="flex flex-col gap-8 animate-fade-in">
                
                {/* Multi-City Dashboard Selector */}
                <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-extrabold text-sm flex items-center gap-2">
                      <BarChart3 className="text-emerald-500" />
                      Multi-City Analytics Comparison
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Compare performance metrics, rescued meals, and participant stats across Andhra Pradesh operational cities.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500">Active Zone:</label>
                    <select
                      value={selectedCity}
                      onChange={(e: any) => setSelectedCity(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none font-bold text-slate-750 dark:text-white"
                    >
                      <option value="Tirupati">Tirupati Region</option>
                      <option value="Nellore">Nellore Region</option>
                      <option value="Kadapa">Kadapa Region</option>
                    </select>
                  </div>
                </div>

                {/* City Stats Comparison Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="glass-card rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/60 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rescued Meals</span>
                    <h4 className="text-md font-black text-emerald-500 mt-1">{currentCityStats.rescuedMeals} meals</h4>
                  </div>
                  <div className="glass-card rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/60 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Donors</span>
                    <h4 className="text-lg font-black text-blue-500 mt-1">{currentCityStats.activeDonors} partners</h4>
                  </div>
                  <div className="glass-card rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/60 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Volunteer Riders</span>
                    <h4 className="text-lg font-black text-purple-500 mt-1">{currentCityStats.volunteersCount} riders</h4>
                  </div>
                  <div className="glass-card rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/60 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Efficiency Index</span>
                    <h4 className="text-lg font-black text-amber-500 mt-1">{currentCityStats.efficiencyIndex}% Rating</h4>
                  </div>
                  <div className="glass-card rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/60 text-center col-span-2 md:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Rescue Zone</span>
                    <h4 className="text-xs font-extrabold text-slate-700 dark:text-white mt-1.5 truncate">{currentCityStats.topZone}</h4>
                  </div>
                </div>

                {/* Comparative Trends Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="glass-card rounded-3xl p-5 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between col-span-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-450 mb-4">Inter-City Monthly Waste Mitigation Trends (kg)</h4>
                    
                    <div className="flex items-end gap-8 h-48 pt-4 px-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                      {[
                        { city: 'Tirupati', val: 450, color: 'bg-emerald-600' },
                        { city: 'Nellore', val: 290, color: 'bg-blue-600' },
                        { city: 'Kadapa', val: 180, color: 'bg-amber-600' }
                      ].map((item, idx) => {
                        const pct = Math.round((item.val / 500) * 100);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                            <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-350">{item.val} kg</span>
                            <div className={`w-16 rounded-t-xl transition-all duration-1000 ${item.color} ${selectedCity === item.city ? 'ring-4 ring-emerald-500/30' : 'opacity-70'}`} style={{ height: `${pct}%` }} />
                            <span className="text-[10px] font-bold text-slate-400 mt-1">{item.city}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-5 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-3">Tirupati vs Statewide Comparison</h4>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Tirupati is currently our high-impact zone, accounting for <strong>{(450 / (450 + 290 + 180) * 100).toFixed(0)}%</strong> of our statewide rescued surplus food weights.
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-3.5 mt-4 text-xs">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 uppercase mb-1 font-bold">
                          <span>Statewide Target Achievement</span>
                          <span>{((450 + 290 + 180) / 1000 * 100).toFixed(0)}%</span>
                        </div>
                        <div className="bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full" style={{ width: `${(450 + 290 + 180) / 1000 * 100}%` }} />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-100 dark:border-slate-800/40 text-[10px] leading-relaxed text-slate-400">
                        ⭐ <strong>Regional Insights:</strong> Pilgrimage crowd fluctuations in Tirupati impact hotel buffet leftovers by up to <strong>35%</strong> on weekend slots.
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Meals Delivered</span>
                      <Award size={18} className="text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black">{analytics.summary.totalMealsDelivered} meals</h3>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Active Shipments</span>
                      <Clock size={18} className="text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-black">{analytics.summary.donations.active} active</h3>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Approval Requests</span>
                      <CheckSquare size={18} className="text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-black text-amber-500">{pendingApprovalsList.length} pending</h3>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total User Accounts</span>
                      <Users size={18} className="text-purple-500" />
                    </div>
                    <h3 className="text-2xl font-black">{analytics.summary.users.total} partners</h3>
                  </div>
                </div>

                {/* Leaderboard & Chart section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  
                  {/* Leaderboard listing */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60">
                    <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-500" />
                      Donor Leaderboard (Meals Contributed)
                    </h3>
                    <div className="flex flex-col gap-3">
                      {analytics.leaderboard.length === 0 ? (
                        <p className="text-xs text-slate-400 p-6 text-center">No donation metrics logged yet.</p>
                      ) : (
                        analytics.leaderboard.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/20">
                            <div className="flex items-center gap-3">
                              <span className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold">{item.name}</h4>
                                <span className="text-[9px] text-slate-400">{item.type}</span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-emerald-500">{item.meals} meals</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Chart Mockup */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between">
                    <h3 className="font-extrabold text-sm mb-4">Distribution Metrics by Role</h3>
                    <div className="flex items-end gap-6 h-40 pt-4 px-4">
                      {[
                        { label: 'Hotels', value: analytics.summary.users.organizations, color: 'bg-emerald-500' },
                        { label: 'Individuals', value: analytics.summary.users.individuals, color: 'bg-blue-500' },
                        { label: 'Volunteers', value: analytics.summary.users.volunteers, color: 'bg-purple-500' },
                        { label: 'NGOs', value: analytics.summary.users.ngos, color: 'bg-teal-500' },
                      ].map((bar, idx) => {
                        const maxVal = Math.max(1, analytics.summary.users.total);
                        const heightPct = Math.round((bar.value / maxVal) * 100);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                            <span className="text-[10px] font-bold">{bar.value}</span>
                            <div 
                              className={`w-full rounded-t-lg transition-all duration-1000 ${bar.color}`}
                              style={{ height: `${Math.max(10, heightPct)}%` }}
                            />
                            <span className="text-[9px] text-slate-400 truncate max-w-full">{bar.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            } />

            {/* APPROVAL QUEUE */}
            <Route path="/approvals" element={
              <div className="animate-fade-in">
                <h3 className="font-extrabold text-sm mb-4">Pending Approvals Queue</h3>
                {pendingApprovalsList.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                    All signups are currently approved! No pending requests.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingApprovalsList.map((u: any) => (
                      <div key={u.id} className="glass-card rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-bold">
                              Pending Approval
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">{u.role}</span>
                          </div>
                          <h4 className="font-bold text-sm mt-3">{u.profile?.name || u.profile?.fullName || 'User Profile'}</h4>
                          <p className="text-[10px] text-slate-400 truncate mt-1">Email: {u.email}</p>
                          <p className="text-[10px] text-slate-400 truncate">Phone: {u.profile?.mobile}</p>
                          <p className="text-[10px] text-slate-400 truncate">Address: {u.profile?.address}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/40 pt-3">
                          <button
                            onClick={() => handleApprove(u.id, 'REJECTED')}
                            className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <UserX size={12} /> Reject
                          </button>
                          <button
                            onClick={() => handleApprove(u.id, 'APPROVED')}
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold hover-scale transition-all flex items-center justify-center gap-1"
                          >
                            <UserCheck size={12} /> Approve Account
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* NGO Legal Documents review section */}
                <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
                  <h3 className="font-extrabold text-sm mb-4">Pending NGO Legal Documents Review</h3>
                  {(() => {
                    const pendingNgoDocsList = users.filter((u: any) => 
                      u.role === 'NGO' && 
                      u.profile && 
                      (u.profile.regCertificateUrl || u.profile.govApprovalUrl) && 
                      u.profile.documentStatus === 'PENDING'
                    );

                    if (pendingNgoDocsList.length === 0) {
                      return (
                        <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                          No NGO certificates pending review at this time.
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingNgoDocsList.map((u: any) => (
                          <div key={u.id} className="glass-card rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-purple-500/10 text-purple-600 border border-purple-500/20 px-2 py-0.5 rounded uppercase font-bold">
                                  Documents Pending
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400">NGO Documents Review</span>
                              </div>
                              <h4 className="font-bold text-sm mt-3">{u.profile?.name || 'NGO Partner'}</h4>
                              <p className="text-[10px] text-slate-400 truncate mt-1">Email: {u.email}</p>
                              
                              <div className="mt-3 flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/40 text-[11px]">
                                {u.profile.regCertificateUrl ? (
                                  <a 
                                    href={u.profile.regCertificateUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline flex items-center gap-1 font-bold"
                                  >
                                    📄 View Registration Certificate
                                  </a>
                                ) : (
                                  <span className="text-slate-450 italic">No registration certificate uploaded</span>
                                )}
                                {u.profile.govApprovalUrl ? (
                                  <a 
                                    href={u.profile.govApprovalUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline flex items-center gap-1 font-bold"
                                  >
                                    📄 View Government Approval Document
                                  </a>
                                ) : (
                                  <span className="text-slate-450 italic">No government approval document uploaded</span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/40 pt-3">
                              <button
                                onClick={() => handleApproveNgoDocs(u.profile.id, 'REJECTED')}
                                className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                              >
                                <UserX size={12} /> Reject Docs
                              </button>
                              <button
                                onClick={() => handleApproveNgoDocs(u.profile.id, 'APPROVED')}
                                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold hover-scale transition-all flex items-center justify-center gap-1"
                              >
                                <UserCheck size={12} /> Approve Docs
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            } />

            {/* USER MANAGEMENT */}
            <Route path="/users" element={
              <div className="glass-card rounded-2xl border border-slate-200/40 dark:border-slate-800/60 overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Registered Date</th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {users.map((u: any) => (
                        <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/25 hover:bg-slate-100/30 dark:hover:bg-slate-800/10">
                          <td className="p-4 font-bold">{u.profile?.name || u.profile?.fullName || 'Administrator'}</td>
                          <td className="p-4 text-slate-400">{u.email}</td>
                          <td className="p-4 font-semibold">{u.role}</td>
                          <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              u.status === 'APPROVED' 
                                ? 'bg-emerald-500/10 text-emerald-500' 
                                : u.status === 'REJECTED' 
                                ? 'bg-rose-500/10 text-rose-500' 
                                : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            } />

            {/* DONATION AUDITS (DELIVERIES LOG) */}
            <Route path="/donations" element={
              <div className="glass-card rounded-2xl border border-slate-200/40 dark:border-slate-800/60 overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4">Food</th>
                        <th className="p-4">Meals</th>
                        <th className="p-4">Donor</th>
                        <th className="p-4">NGO</th>
                        <th className="p-4">Rider</th>
                        <th className="p-4">Destination</th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {analytics.recentDeliveries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">No deliveries on record.</td>
                        </tr>
                      ) : (
                        analytics.recentDeliveries.map((d: any) => (
                          <tr key={d.id} className="border-b border-slate-50 dark:border-slate-800/25 hover:bg-slate-100/30 dark:hover:bg-slate-800/10">
                            <td className="p-4 font-bold">{d.foodName}</td>
                            <td className="p-4 font-semibold text-emerald-500">{d.quantity}</td>
                            <td className="p-4 text-slate-400">{d.donorName}</td>
                            <td className="p-4 text-slate-400">{d.ngoName}</td>
                            <td className="p-4 text-slate-400">{d.volunteerName}</td>
                            <td className="p-4">{d.destination}</td>
                            <td className="p-4 text-right">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                ['DELIVERED', 'VERIFIED'].includes(d.status) 
                                  ? 'bg-emerald-500/10 text-emerald-500' 
                                  : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            } />

            {/* DELIVERY MONITOR MAP */}
            <Route path="/deliveries" element={
              <div className="glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/80 flex flex-col gap-4 animate-fade-in relative">
                <h2 className="text-sm font-extrabold flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Delivery Monitor Map
                </h2>
                {(() => {
                  const trackableDonations = donations.filter(d => ['ACCEPTED', 'ASSIGNED', 'PICKED_UP'].includes(d.status));
                  const trackDonation = donations.find(d => d.id === selectedTrackId) || trackableDonations[0];
                  
                  if (!trackDonation) {
                    return <p className="text-xs text-slate-400 p-6 text-center">No active volunteer deliveries are currently en route to monitor.</p>;
                  }

                  return (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-xs font-bold text-slate-400">Monitoring Donation: <strong className="text-slate-700 dark:text-white">{trackDonation.foodName}</strong></span>
                        {trackableDonations.length > 1 && (
                          <select
                            value={trackDonation.id}
                            onChange={(e) => setSelectedTrackId(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs outline-none"
                          >
                            {trackableDonations.map(d => (
                              <option key={d.id} value={d.id}>{d.foodName}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <MapComponent
                        pickupAddress={trackDonation.pickupAddress}
                        destAddress={trackDonation.assignments?.[0]?.destinationAddress || 'Shelter'}
                        volunteerName={trackDonation.assignments?.[0]?.volunteer?.fullName || 'John Doe'}
                        volunteerStatus={trackDonation.assignments?.[0]?.status}
                        volunteerLat={liveLocation[trackDonation.assignments?.[0]?.id]?.lat}
                        volunteerLng={liveLocation[trackDonation.assignments?.[0]?.id]?.lng}
                      />
                    </div>
                  );
                })()}
              </div>
            } />

            {/* HUNGER DENSITY HEATMAP */}
            <Route path="/heatmap" element={<HungerHeatmap />} />

            {/* COMMUNITY LEADERBOARD */}
            <Route path="/leaderboard" element={<LeaderboardView />} />

            {/* FRAUD & SYSTEM LOGS */}
            <Route path="/logs" element={<LogsView />} />
          </Routes>

            </>
          )}
        </main>
      </div>
    </div>
  );
};
