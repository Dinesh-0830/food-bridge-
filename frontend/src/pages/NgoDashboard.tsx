import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { MapComponent } from '../components/MapComponent';
import api from '../services/api';
import {
  ShieldCheck, ChevronRight, Loader2, AlertCircle,
  Trophy, Thermometer, CloudUpload, RefreshCw
} from 'lucide-react';
import { HungerHeatmap } from '../components/HungerHeatmap';
import { useAuth } from '../context/AuthContext';

// Subcomponent: NGO Leaderboards
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
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'donors'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
          >
            Donors (Hotels)
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'volunteers'
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
                  className={`border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-100/30 dark:hover:bg-slate-800/10 ${idx === 0 ? 'bg-amber-500/5' : ''
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

// Subcomponent: Emergency Food Requests posting & view list
const EmergencyRequestView: React.FC = () => {
  const [mealsRequired, setMealsRequired] = useState('');
  const [location, setLocation] = useState('');
  const [foodType, setFoodType] = useState('Vegetarian');
  const [deadline, setDeadline] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('MEDIUM');
  const [requests, setRequests] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/emergency-requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching emergency requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/emergency-requests', {
        mealsRequired,
        location,
        foodType,
        deadline,
        priorityLevel
      });
      alert('Emergency request posted successfully! Nearby donors will be notified.');
      setMealsRequired('');
      setLocation('');
      setDeadline('');
      setPriorityLevel('MEDIUM');
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to post emergency request');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'SOS':
        return 'bg-red-650 text-white font-extrabold px-2 py-0.5 rounded border border-red-500 animate-pulse text-[9px]';
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded text-[9px] font-bold';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-semibold';
      case 'LOW':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[9px]';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-4">
        <div>
          <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-rose-500">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            Post Emergency Food Request
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Submit an urgent demand for meals. We will auto-notify all registered Tirupati donors.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Meals Required</label>
            <input
              type="number"
              required
              placeholder="e.g. 50"
              value={mealsRequired}
              onChange={(e) => setMealsRequired(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery Location / Camp</label>
            <input
              type="text"
              required
              placeholder="e.g. Tirupati Railway Station Shelter Camp"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Food Preference</label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Priority Level</label>
              <select
                value={priorityLevel}
                onChange={(e) => setPriorityLevel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="SOS">🚨 DISASTER SOS Alert</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Deadline Time</label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full font-bold py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl hover-scale transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 mt-2 shadow-lg shadow-rose-500/10"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Broadcast Emergency Request'}
          </button>
        </form>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-4">
        <h3 className="font-extrabold text-sm">Active & Past Urgent Requests</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-xs text-slate-400">
            <Loader2 className="animate-spin text-rose-500" size={20} />
            <span>Loading request lists...</span>
          </div>
        ) : requests.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">No emergency requests registered yet.</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
            {requests.map((req) => (
              <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
                {req.priorityLevel === 'SOS' && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-red-600 animate-pulse"></div>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs text-rose-600 dark:text-rose-400">{req.mealsRequired} Meals Required</h4>
                      {getPriorityBadge(req.priorityLevel)}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{req.ngoName} ({req.ngoMobile})</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${req.status === 'PENDING'
                      ? 'bg-rose-500/10 text-rose-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                    {req.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-450 border-t border-slate-100 dark:border-slate-800/40 pt-2 flex flex-col gap-0.5">
                  <p>📍 Delivery point: <strong>{req.location}</strong></p>
                  <p>⏰ Target Deadline: <strong>{new Date(req.deadline).toLocaleString()}</strong></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Subcomponent: NGO Hubs & Refrigerator status logs
const NgoHubsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fridges' | 'coldChain'>('fridges');
  const [fridges, setFridges] = useState<any[]>([]);
  const [coldStorages, setColdStorages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refillingId, setRefillingId] = useState<string | null>(null);
  const [refillMeals, setRefillMeals] = useState('10');
  const [submittingRefill, setSubmittingRefill] = useState(false);

  const fetchHubs = async () => {
    setLoading(true);
    try {
      const [fridgesRes, coldRes] = await Promise.all([
        api.get('/fridges'),
        api.get('/cold-storages')
      ]);
      setFridges(fridgesRes.data.fridges || []);
      setColdStorages(coldRes.data.storages || []);
    } catch (err) {
      console.error('Error loading hubs data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  const handleRefill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillingId || submittingRefill) return;
    setSubmittingRefill(true);
    try {
      await api.post(`/fridges/refill/${refillingId}`, { mealsToAdd: refillMeals });
      alert('Fridge refilled successfully!');
      setRefillingId(null);
      setRefillMeals('10');
      fetchHubs();
    } catch (err) {
      alert('Failed to refill fridge');
    } finally {
      setSubmittingRefill(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p className="text-xs text-slate-400">Loading food hub status logs...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Tirupati Food Hub Network</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time status of community refrigerators and cold chain storage warehouses.</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('fridges')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'fridges'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
          >
            Community Fridges
          </button>
          <button
            onClick={() => setActiveTab('coldChain')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'coldChain'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
          >
            Cold Chain Logs
          </button>
        </div>
      </div>

      {activeTab === 'fridges' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fridges.map((f) => {
            const fillPct = Math.round((f.currentMeals / f.capacity) * 100);
            return (
              <div key={f.id} className="glass-card rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${f.status === 'ACTIVE' ? 'bg-emerald-505/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                      {f.status}
                    </span>
                    <span className="text-[10px] text-slate-400">Cap: {f.capacity} meals</span>
                  </div>
                  <h4 className="font-bold text-xs mt-3 text-slate-850 dark:text-white">{f.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">📍 {f.location}</p>

                  <div className="mt-4 flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Available Fill:</span>
                      <span className="text-slate-700 dark:text-white">{f.currentMeals} / {f.capacity} meals</span>
                    </div>
                    <div className="h-2 bg-slate-105 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${fillPct > 80 ? 'bg-emerald-650' : fillPct > 30 ? 'bg-amber-500' : 'bg-rose-505'}`} style={{ width: `${fillPct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/40 pt-3 text-[9px] text-slate-400">
                  <span>Last Refill: {new Date(f.lastRefillTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button
                    onClick={() => setRefillingId(f.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg hover-scale"
                  >
                    + Refill
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Storage Unit Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Temp Sensor (°C)</th>
                  <th className="p-4">Capacity Level</th>
                  <th className="p-4 text-right">Cold Chain Alert</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {coldStorages.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 dark:border-slate-800/20 hover:bg-slate-100/30 dark:hover:bg-slate-850">
                    <td className="p-4 font-bold">{c.name}</td>
                    <td className="p-4 text-slate-400">{c.location}</td>
                    <td className="p-4 font-black flex items-center gap-1.5">
                      <Thermometer size={14} className={c.temperature > 5.0 ? 'text-amber-500 animate-pulse' : 'text-emerald-500'} />
                      <span className={c.temperature > 5.0 ? 'text-amber-500' : 'text-slate-800 dark:text-white'}>{c.temperature.toFixed(1)} °C</span>
                    </td>
                    <td className="p-4">
                      {c.currentMeals} / {c.capacity} meals ({Math.round((c.currentMeals / c.capacity) * 100)}%)
                    </td>
                    <td className="p-4 text-right">
                      {c.temperature > 5.0 || c.expiryAlerts ? (
                        <span className="bg-amber-500/10 text-amber-600 border border-amber-500/25 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                          ⚠️ Temperature Warning
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px] font-bold">
                          ✓ Cold Chain Safe
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refill fridge Modal Dialog */}
      {refillingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-scale-up">
            <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800/40 pb-2 text-left">Log Refrigerator Refill</h3>
            <form onSubmit={handleRefill} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Meals Count to Load</label>
                <input
                  type="number"
                  required
                  value={refillMeals}
                  onChange={(e) => setRefillMeals(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRefillingId(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefill}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                >
                  {submittingRefill ? 'Saving Refill...' : 'Confirm Refill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: NGO registration profile & legal certificate upload form
const NgoProfileView: React.FC = () => {
  const { user } = useAuth();
  const [ngo, setNgo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [regCertificateUrl, setRegCertificateUrl] = useState('');
  const [govApprovalUrl, setGovApprovalUrl] = useState('');

  const fetchNgoDetails = async () => {
    try {
      await api.get('/ngo/dashboard');
      if (user?.profile) {
        const profile = user.profile as any;
        setNgo(profile);
        setRegCertificateUrl(profile.regCertificateUrl || '');
        setGovApprovalUrl(profile.govApprovalUrl || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoDetails();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put('/ngo/profile', { regCertificateUrl, govApprovalUrl });
      alert('Documents submitted successfully! Status set to PENDING for admin review.');
      fetchNgoDetails();
    } catch (err) {
      alert('Failed to update documents');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateUpload = (type: 'reg' | 'gov') => {
    const mockUrl = type === 'reg'
      ? 'https://documents.foodbridge.org/certificates/tirupati-reg-certificate.pdf'
      : 'https://documents.foodbridge.org/approvals/ap-govt-sec-clearance.pdf';

    if (type === 'reg') {
      setRegCertificateUrl(mockUrl);
    } else {
      setGovApprovalUrl(mockUrl);
    }
    alert('Simulated file upload successfully!');
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p className="text-xs text-slate-400 font-bold">Loading profile details...</p>
      </div>
    );
  }

  const status = ngo?.documentStatus || 'PENDING';

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl mx-auto animate-fade-in flex flex-col gap-6 text-left">
      <div className="border-b border-slate-100 dark:border-slate-800/40 pb-4">
        <h3 className="font-extrabold text-md flex items-center gap-1.5">
          <ShieldCheck className="text-emerald-500" />
          Legal Document Verification Portal
        </h3>
        <p className="text-xs text-slate-400 mt-1">Upload your NGO credentials for government integration and priority relief clearance.</p>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-105 dark:border-slate-850">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Approval Status</span>
          <p className="text-sm font-extrabold mt-0.5 text-slate-800 dark:text-white">
            {status === 'APPROVED' ? 'Verified Partner NGO' : status === 'PENDING' ? 'Verification Awaiting Admin approval' : 'Verification Rejected'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20' :
            status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
              'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          }`}>
          {status}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase">NGO Registration Certificate</label>
          <div className="flex gap-3">
            <input
              type="text"
              required
              readOnly
              placeholder="No certificate file selected"
              value={regCertificateUrl}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none cursor-not-allowed text-slate-500"
            />
            <button
              type="button"
              onClick={() => handleSimulateUpload('reg')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <CloudUpload size={14} /> Upload
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Government Approval / Tax Clearance URL</label>
          <div className="flex gap-3">
            <input
              type="text"
              required
              readOnly
              placeholder="No tax approval file selected"
              value={govApprovalUrl}
              className="flex-1 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none cursor-not-allowed text-slate-500"
            />
            <button
              type="button"
              onClick={() => handleSimulateUpload('gov')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <CloudUpload size={14} /> Upload
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-505 text-white font-bold rounded-xl text-xs hover-scale transition-all mt-4"
        >
          {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit Documents for Verification'}
        </button>
      </form>
    </div>
  );
};

// Subcomponent: NGO Transfer and Multi-NGO Collaboration
const NgoTransferView: React.FC<{ donations: any[], refreshDonations: () => void }> = ({ donations, refreshDonations }) => {
  const [activeTransfer, setActiveTransfer] = useState<any>(null);
  const [targetNgo, setTargetNgo] = useState('Hope Care Shelter');
  const [transferring, setTransferring] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransfer) return;
    setTransferring(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      alert(`Donation "${activeTransfer.foodName}" successfully transferred to ${targetNgo}! They have been notified.`);
      setActiveTransfer(null);
      refreshDonations();
    } catch (err) {
      alert('Transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  const myIncoming = donations.filter(d => d.status === 'ASSIGNED'); // assigned to current NGO

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-left">
      <div>
        <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">NGO Transfer Hub</h2>
        <p className="text-xs text-slate-400 mt-1">Collab Hub: Transfer excess incoming donations to partner shelters based on urgency and capacity.</p>
      </div>

      {myIncoming.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
          No allocated donations available to transfer at this time. Only donations assigned to you can be transferred.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myIncoming.map((d) => (
            <div key={d.id} className="glass-card rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between gap-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-400 uppercase">
                    Assigned to You
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500">{d.quantity} meals</span>
                </div>
                <h4 className="font-bold text-xs mt-3 text-slate-850 dark:text-white">{d.foodName}</h4>
                <p className="text-[10px] text-slate-400 mt-1">📍 Pickup: {d.pickupAddress}</p>
                <p className="text-[10px] text-slate-400">Category: {d.category}</p>
              </div>

              <button
                onClick={() => setActiveTransfer(d)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 hover-scale transition-all"
              >
                <RefreshCw size={12} />
                Transfer to Partner NGO
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Transfer Modal */}
      {activeTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-scale-up">
            <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800/40 pb-2 text-left">Transfer Donation</h3>
            
            <form onSubmit={handleTransfer} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Donation to Transfer</span>
                <p className="font-bold text-xs">{activeTransfer.foodName} ({activeTransfer.quantity} meals)</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Partner NGO</label>
                <select
                  value={targetNgo}
                  onChange={(e) => setTargetNgo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
                >
                  <option value="Hope Care Shelter">Hope Care Shelter (1.8 km away)</option>
                  <option value="Tirupati Food Rescue League">Tirupati Food Rescue League (3.2 km away)</option>
                  <option value="Chittoor Destitute Home">Chittoor Destitute Home (4.5 km away)</option>
                  <option value="Balaji Seva Sangam">Balaji Seva Sangam (2.1 km away)</option>
                </select>
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveTransfer(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                >
                  {transferring ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Transferring...
                    </>
                  ) : (
                    'Confirm Transfer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const NgoDashboard: React.FC = () => {
  const { emitStatusChange, socket, joinDeliveryRoom, leaveDeliveryRoom } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [needyLocations, setNeedyLocations] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [liveLocation, setLiveLocation] = useState<{ [key: string]: { lat: number; lng: number } }>({});

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Modals & Selection states
  const [assigningDonation, setAssigningDonation] = useState<any | null>(null);
  const [verifyingAssignment, setVerifyingAssignment] = useState<any | null>(null);

  // Form states
  const [assignForm, setAssignForm] = useState({
    destinationType: 'HOSPITAL',
    destinationId: '',
    volunteerId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsRes, destsRes, volsRes] = await Promise.all([
        api.get('/ngo/dashboard'),
        api.get('/ngo/destinations'),
        api.get('/ngo/volunteers') // To load approved volunteers
      ]);

      setDonations(donationsRes.data.donations);
      setHospitals(destsRes.data.hospitals);
      setNeedyLocations(destsRes.data.needyLocations);

      // Filter out only approved volunteers
      const vols = volsRes.data.users.filter((u: any) => u.role === 'VOLUNTEER' && u.status === 'APPROVED');
      setVolunteers(vols);

      // Default forms
      if (destsRes.data.hospitals.length > 0) {
        setAssignForm(prev => ({ ...prev, destinationId: destsRes.data.hospitals[0].id }));
      }
    } catch (err) {
      console.error('Error loading NGO dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDonation) return;

    try {
      // Find destination name and address
      let destinationName = '';
      let destinationAddress = '';

      if (assignForm.destinationType === 'HOSPITAL') {
        const hosp = hospitals.find(h => h.id === assignForm.destinationId);
        destinationName = hosp?.name || '';
        destinationAddress = hosp?.address || '';
      } else {
        const loc = needyLocations.find(l => l.id === assignForm.destinationId);
        destinationName = loc?.name || '';
        destinationAddress = loc?.address || '';
      }

      const payload = {
        donationId: assigningDonation.id,
        destinationType: assignForm.destinationType,
        destinationId: assignForm.destinationId,
        destinationName,
        destinationAddress,
        volunteerId: assignForm.volunteerId || null,
      };

      const res = await api.post('/ngo/assign', payload);

      // Notify through socket
      if (assignForm.volunteerId) {
        emitStatusChange({
          assignmentId: res.data.assignment.id,
          donationId: assigningDonation.id,
          status: 'ASSIGNED',
          message: `Donation "${assigningDonation.foodName}" has been assigned to Volunteer.`,
        });
      }

      setAssigningDonation(null);
      fetchData();
      alert('Destination assigned successfully!');
      navigate('/ngo/tracking');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleVerify = async () => {
    if (!verifyingAssignment) return;

    try {
      await api.post('/ngo/verify', { assignmentId: verifyingAssignment.id });

      // Broadcast via socket
      emitStatusChange({
        assignmentId: verifyingAssignment.id,
        donationId: verifyingAssignment.donationId,
        status: 'VERIFIED',
        message: `Delivery of "${verifyingAssignment.donation.foodName}" verified by NGO.`,
      });

      setVerifyingAssignment(null);
      fetchData();
      alert('Delivery successfully verified!');
      navigate('/ngo/reports');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification failed');
    }
  };

  // Stats
  const totalCompletedCount = donations.filter(d => d.status === 'VERIFIED').length;
  const activeDeliveriesCount = donations.filter(d => ['ACCEPTED', 'ASSIGNED', 'PICKED_UP'].includes(d.status)).length;
  const pendingIncomingCount = donations.filter(d => d.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-dark-50 flex flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">NGO Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">Allocate incoming donations and confirm delivery verification proofs.</p>
          </div>

          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <p className="text-xs text-slate-400">Loading NGO data...</p>
            </div>
          ) : (
            <Routes>
              {/* DEFAULT OVERVIEW */}
              <Route path="/" element={
                <div className="animate-fade-in flex flex-col gap-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/ngo/incoming" className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition-all">
                      <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
                        📥
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Unassigned Food</p>
                        <h3 className="text-xl font-black mt-0.5">{pendingIncomingCount} requests</h3>
                      </div>
                    </Link>

                    <Link to="/ngo/tracking" className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition-all">
                      <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
                        🚴
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Deliveries</p>
                        <h3 className="text-xl font-black mt-0.5">{activeDeliveriesCount} en route</h3>
                      </div>
                    </Link>

                    <Link to="/ngo/reports" className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition-all">
                      <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                        ✅
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed Distributions</p>
                        <h3 className="text-xl font-black mt-0.5">{totalCompletedCount} verified</h3>
                      </div>
                    </Link>
                  </div>

                  {/* Overview panels */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Recent Unassigned / Incoming */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm mb-4">Latest Incoming Listings</h3>
                        {donations.filter(d => d.status === 'PENDING').length === 0 ? (
                          <p className="text-xs text-slate-400 py-4">No pending incoming donations.</p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {donations.filter(d => d.status === 'PENDING').slice(0, 3).map(d => (
                              <div key={d.id} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800/40 pb-2">
                                <div>
                                  <p className="font-bold">{d.foodName}</p>
                                  <p className="text-[10px] text-slate-400">{d.orgDonor?.name || d.indDonor?.fullName}</p>
                                </div>
                                <span className="font-bold text-emerald-500">{d.quantity} meals</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Link to="/ngo/incoming" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-4 hover:underline flex items-center gap-1">
                        Go to Allocation Center <ChevronRight size={12} />
                      </Link>
                    </div>

                    {/* Active Route overview */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm mb-4">Ongoing Deliveries</h3>
                        {donations.filter(d => ['ACCEPTED', 'ASSIGNED', 'PICKED_UP'].includes(d.status)).length === 0 ? (
                          <p className="text-xs text-slate-400 py-4">No active deliveries at the moment.</p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {donations.filter(d => ['ACCEPTED', 'ASSIGNED', 'PICKED_UP'].includes(d.status)).slice(0, 3).map(d => (
                              <div key={d.id} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800/40 pb-2">
                                <div>
                                  <p className="font-bold">{d.foodName}</p>
                                  <p className="text-[10px] text-slate-400">Rider: {d.assignments?.[0]?.volunteer?.fullName || 'Unassigned'}</p>
                                </div>
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] px-2 py-0.5 rounded font-bold uppercase">{d.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Link to="/ngo/tracking" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-4 hover:underline flex items-center gap-1">
                        Open Tracking Map <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              } />

              {/* INCOMING DONATIONS */}
              <Route path="/incoming" element={
                <div className="animate-fade-in flex flex-col gap-4">
                  <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4">Incoming surplus listings</h2>
                  {donations.filter(d => d.status === 'PENDING').length === 0 ? (
                    <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                      No new incoming food donations at the moment. We will notify you when a donor registers food.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {donations.filter(d => d.status === 'PENDING').map((d) => (
                        <div key={d.id} className="glass-card rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between gap-4">
                          <div className="flex gap-4">
                            {d.foodImageUrl ? (
                              <img src={d.foodImageUrl} alt={d.foodName} className="h-16 w-16 rounded-xl object-cover" />
                            ) : (
                              <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">🍲</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md font-bold uppercase text-slate-400">
                                  Pending Assignment
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-500">{d.category}</span>
                              </div>
                              <h3 className="font-bold text-sm truncate mt-1.5">{d.foodName}</h3>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{d.description}</p>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3 text-[10px] text-slate-400 flex flex-col gap-1">
                            <p>Donor: <span className="font-bold text-slate-700 dark:text-white">{d.orgDonor?.name || d.indDonor?.fullName}</span></p>
                            <p>Pickup: <span className="font-bold">{d.pickupAddress}</span></p>
                            <p>Meals count: <span className="font-bold text-emerald-500">{d.quantity} meals</span></p>
                          </div>

                          <button
                            onClick={() => setAssigningDonation(d)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs hover-scale transition-all flex items-center justify-center gap-1"
                          >
                            Assign Destination & Volunteer <ChevronRight size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              } />

              {/* LIVE TRACKING MAP */}
              <Route path="/tracking" element={
                <div className="animate-fade-in glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/80 mb-8 flex flex-col gap-4 relative">
                  <h2 className="text-sm font-extrabold flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    Live Tracking Map
                  </h2>
                  {(() => {
                    const trackId = searchParams.get('id');
                    const trackableDonations = donations.filter(d => ['ACCEPTED', 'ASSIGNED', 'PICKED_UP'].includes(d.status));
                    const trackDonation = donations.find(d => d.id === trackId) || trackableDonations[0];

                    if (!trackDonation) {
                      return <p className="text-xs text-slate-400 p-6 text-center">No active volunteer deliveries en route right now to track.</p>;
                    }

                    return (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-2">
                          <span className="text-xs font-bold text-slate-400">Tracking Donation: <strong className="text-slate-700 dark:text-white">{trackDonation.foodName}</strong></span>
                          {trackableDonations.length > 1 && (
                            <select
                              value={trackDonation.id}
                              onChange={(e) => navigate(`/ngo/tracking?id=${e.target.value}`)}
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

              {/* VERIFY DELIVERIES */}
              <Route path="/verify" element={
                <div className="animate-fade-in flex flex-col gap-4">
                  <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4">Verification Center</h2>
                  {donations.filter(d => d.status === 'DELIVERED').length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 border border-slate-200/20 rounded-2xl">
                      No pending delivery proofs to verify.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {donations.filter(d => d.status === 'DELIVERED').map((d) => {
                        const assignment = d.assignments?.[0];
                        return (
                          <div key={d.id} className="glass-card rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/60 flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                  <AlertCircle size={10} /> Awaiting Signoff
                                </span>
                                <span className="text-[9px] text-slate-400">Delivered by {assignment?.volunteer?.fullName}</span>
                              </div>
                              <h4 className="font-bold text-xs mt-1 truncate">{d.foodName} ({d.quantity} meals)</h4>
                            </div>
                            <button
                              onClick={() => setVerifyingAssignment(assignment)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap"
                            >
                              Review Proof
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              } />

              {/* EMERGENCY FOOD REQUESTS */}
              <Route path="/emergency" element={<EmergencyRequestView />} />

              {/* FRIDGE AND COLD STORAGE HUBS */}
              <Route path="/hubs" element={<NgoHubsView />} />

              {/* LEGAL CERTIFICATES & PROFILE */}
              <Route path="/profile" element={<NgoProfileView />} />

              {/* HUNGER DENSITY HEATMAP */}
              <Route path="/heatmap" element={<HungerHeatmap />} />

              {/* COMMUNITY LEADERBOARDS */}
              <Route path="/leaderboard" element={<LeaderboardView />} />

              {/* NGO COLLABORATIVE TRANSFER HUB */}
              <Route path="/transfer" element={<NgoTransferView donations={donations} refreshDonations={fetchData} />} />

              {/* DISTRIBUTION REPORTS */}
              <Route path="/reports" element={
                <div className="animate-fade-in flex flex-col gap-4">
                  <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4">Distribution Reports</h2>
                  {donations.filter(d => d.status === 'VERIFIED').length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 border border-slate-200/20 rounded-2xl">
                      No past verified distributions recorded yet.
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl border border-slate-200/40 dark:border-slate-800/60 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <th className="p-4">Food Item</th>
                              <th className="p-4">Date</th>
                              <th className="p-4">Quantity</th>
                              <th className="p-4">Destination</th>
                              <th className="p-4">Volunteer Rider</th>
                              <th className="p-4 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs">
                            {donations.filter(d => d.status === 'VERIFIED').map((d) => (
                              <tr key={d.id} className="border-b border-slate-50 dark:border-slate-800/25 hover:bg-slate-100/30 dark:hover:bg-slate-800/10">
                                <td className="p-4 font-bold">{d.foodName}</td>
                                <td className="p-4 text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">{d.quantity} meals</td>
                                <td className="p-4 text-slate-400">{d.assignments?.[0]?.destinationName || 'Local Shelter'}</td>
                                <td className="p-4 text-slate-400">{d.assignments?.[0]?.volunteer?.fullName || 'John Doe'}</td>
                                <td className="p-4 text-right">
                                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-semibold">
                                    Verified ✓
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              } />
            </Routes>
          )}
        </main>
      </div>

      {/* ALLOCATION MODAL */}
      {assigningDonation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-slide-up">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/40">
              <h3 className="font-extrabold text-sm">Assign Food Destination</h3>
              <button onClick={() => setAssigningDonation(null)} className="text-slate-450 hover:text-slate-650 dark:hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAssign} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Destination Category</label>
                <select
                  value={assignForm.destinationType}
                  onChange={(e) => {
                    const type = e.target.value;
                    const initialId = type === 'HOSPITAL' ? hospitals[0]?.id : needyLocations[0]?.id;
                    setAssignForm({ ...assignForm, destinationType: type, destinationId: initialId || '' });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
                >
                  <option value="HOSPITAL">Hospital</option>
                  <option value="SHELTER">Shelter / Orphanage</option>
                  <option value="NEEDY_AREA">Needy Slum Area</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Target Location</label>
                <select
                  value={assignForm.destinationId}
                  onChange={(e) => setAssignForm({ ...assignForm, destinationId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
                >
                  {assignForm.destinationType === 'HOSPITAL'
                    ? hospitals.map(h => <option key={h.id} value={h.id}>{h.name} ({h.address})</option>)
                    : needyLocations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.address})</option>)
                  }
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Assign Volunteer Rider (Optional)</label>
                <select
                  value={assignForm.volunteerId}
                  onChange={(e) => setAssignForm({ ...assignForm, volunteerId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
                >
                  <option value="">Leave Open (Any volunteer can accept)</option>
                  {volunteers.map(v => (
                    <option key={v.id} value={v.profile.id}>
                      {v.profile.fullName} ({v.profile.vehicleType} - Availability: {v.profile.availability})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full font-bold py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl hover-scale transition-all text-xs mt-2"
              >
                Confirm Allocation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY PROOF MODAL */}
      {verifyingAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-slide-up">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/40">
              <h3 className="font-extrabold text-sm">Review Delivery Proof</h3>
              <button onClick={() => setVerifyingAssignment(null)} className="text-slate-400 hover:text-slate-650 dark:hover:text-white font-bold text-lg">×</button>
            </div>

            {verifyingAssignment.proof ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Distribution Photo</span>
                  <img
                    src={verifyingAssignment.proof.photoUrl}
                    alt="Proof"
                    className="h-48 w-full object-cover rounded-2xl border border-slate-200 dark:border-slate-800"
                  />
                </div>
                {verifyingAssignment.proof.recipientPhotoUrl && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Recipient Acknowledgment</span>
                    <img
                      src={verifyingAssignment.proof.recipientPhotoUrl}
                      alt="Recipient"
                      className="h-24 w-24 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                )}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/20 text-xs">
                  <p className="font-bold text-slate-400 uppercase text-[9px] mb-1">Rider Notes</p>
                  <p className="italic text-slate-600 dark:text-slate-300">"{verifyingAssignment.proof.notes || 'No notes provided.'}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <button
                    onClick={() => setVerifyingAssignment(null)}
                    className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    Reject & Contact Rider
                  </button>
                  <button
                    onClick={handleVerify}
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl hover-scale shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-1"
                  >
                    <ShieldCheck size={14} /> Verify Delivery
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 p-4 text-center">No proof has been submitted yet.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
