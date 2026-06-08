import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { MapComponent } from '../components/MapComponent';
import api from '../services/api';
import { 
  Plus, MapPin, Loader2, Brain, BarChart2, 
  Trophy, Sparkles, ShieldCheck, HeartHandshake,
  Calendar, QrCode, FileText, Trash2
} from 'lucide-react';

const TIRUPATI_LANDMARKS = [
  'Ramanuja Circle, Tirupati, Andhra Pradesh 517501',
  'Bairagipatteda, Tirupati, Andhra Pradesh 517501',
  'MR Palli, Tirupati, Andhra Pradesh 517502',
  'Balaji Colony, Tirupati, Andhra Pradesh 517501',
  'RUIA Hospital, Alipiri Road, Tirupati, Andhra Pradesh 517507',
  'SVIMS Hospital, Tirupati, Andhra Pradesh 517507',
  'Tirumala Bypass Road, Tirupati, Andhra Pradesh 517501',
  'Korlagunta, Tirupati, Andhra Pradesh 517501'
];

// Subcomponent: AI Leftover Food Prediction
const AiPredictionView: React.FC<{ setDonationForm: any, navigate: any }> = ({ setDonationForm, navigate }) => {
  const [inputs, setInputs] = useState({
    customerCount: '150',
    dayOfWeek: 'Friday',
    eventType: 'Regular Buffet',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/predict-leftovers', inputs);
      setResult(res.data);
    } catch (err) {
      alert('Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDonation = () => {
    if (!result) return;
    setDonationForm((prev: any) => ({
      ...prev,
      foodName: `Leftover Buffet (${inputs.eventType})`,
      quantity: result.predictedQty.toString(),
      notes: `AI Predicted leftover quantity: ${result.predictedQty} meals. Confidence: ${result.confidence}%. Recommended pickup: ${result.suggestedTime}.`,
    }));
    navigate('/donor/create');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
        <h3 className="font-extrabold text-sm flex items-center gap-2 mb-2">
          <Brain className="text-emerald-500" />
          AI Leftover Food Prediction
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Enter your event parameters to forecast food leftovers and schedule donations proactively.
        </p>

        <form onSubmit={handlePredict} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Estimated Customers Today</label>
            <input
              type="number"
              value={inputs.customerCount}
              onChange={(e) => setInputs({ ...inputs, customerCount: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Day of the Week</label>
            <select
              value={inputs.dayOfWeek}
              onChange={(e) => setInputs({ ...inputs, dayOfWeek: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Event / Buffer Type</label>
            <select
              value={inputs.eventType}
              onChange={(e) => setInputs({ ...inputs, eventType: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
            >
              <option value="Regular Buffet">Regular Buffet</option>
              <option value="Wedding Buffet">Wedding Buffet</option>
              <option value="Corporate Lunch">Corporate Lunch</option>
              <option value="Private Dinner">Private Dinner</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl hover-scale transition-all flex items-center justify-center gap-2 text-xs"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Run Prediction Engine'}
          </button>
        </form>
      </div>

      {result ? (
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between animate-slide-up">
          <div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
              AI Analysis Completed
            </span>
            <div className="flex items-center gap-6 mt-6 mb-6">
              <div className="h-28 w-28 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center bg-emerald-500/5 shadow-inner">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{result.predictedQty}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Meals Qty</span>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Confidence Score</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${result.confidence}%` }} />
                    </div>
                    <span className="text-xs font-bold">{result.confidence}%</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Suggested Dispatch Time</span>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">{result.suggestedTime}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 mb-4 text-xs leading-normal">
              <strong className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                💡 Prediction Summary & Recommendation
              </strong>
              {result.recommendation}
            </div>
          </div>

          <button
            onClick={handleApplyDonation}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover-scale shadow-lg hover:shadow-emerald-500/20"
          >
            ✓ Auto-fill Donation Form with this Data
          </button>
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center text-slate-400 flex-1">
          <Brain size={48} className="text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
          <p className="text-xs max-w-xs leading-relaxed">
            Fill out the estimation form on the left and start the AI engine to generate leftover predictions.
          </p>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Waste Analytics for Hotels
const WasteAnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/waste');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Error fetching waste analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p className="text-xs text-slate-400">Generating waste metrics...</p>
      </div>
    );
  }

  const costLoss = analytics?.costLoss || 12500;
  const peakDays = analytics?.peakDays || ['Friday', 'Saturday'];
  const items = analytics?.items || [];
  const weeklyTrends = analytics?.weeklyTrends || [];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Financial Loss (Est. Value)</span>
          <h3 className="text-2xl font-black mt-2 text-rose-500">₹{costLoss.toLocaleString()}</h3>
          <p className="text-[9px] text-slate-400 mt-1">Value of raw materials discarded in the last 30 days.</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peak Waste Days</span>
          <h3 className="text-2xl font-black mt-2 text-amber-500">{peakDays.join(' & ')}</h3>
          <p className="text-[9px] text-slate-400 mt-1">Days of week showing highest volume of buffet leftovers.</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Carbon Savings Potential</span>
          <h3 className="text-2xl font-black mt-2 text-emerald-500">240 kg CO₂</h3>
          <p className="text-[9px] text-slate-400 mt-1">Emission prevention by redirecting meals instead of landfills.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
          <h4 className="font-extrabold text-sm mb-6 flex items-center gap-2">
            <BarChart2 className="text-emerald-500" />
            Weekly Leftover Trends (Meals)
          </h4>
          
          <div className="h-56 flex items-end justify-between gap-2 pt-4 px-2 border-b border-l border-slate-200 dark:border-slate-800 relative">
            {weeklyTrends.map((t: any) => {
              const heightPercent = Math.min(100, Math.max(10, (t.qty / 45) * 100));
              return (
                <div key={t.day} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                  <span className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white dark:bg-slate-100 dark:text-black text-[9px] px-1 py-0.5 rounded transition-opacity absolute -translate-y-12 font-bold z-10">
                    {t.qty}
                  </span>
                  <div 
                    className="w-full bg-emerald-500/20 hover:bg-emerald-500 rounded-t transition-all duration-300 shadow-lg shadow-emerald-500/5 group-hover:scale-y-105 origin-bottom" 
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white mt-1">
                    {t.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm mb-6 flex items-center gap-2">
              📊 Waste Ingredient Breakdown
            </h4>
            <div className="flex flex-col gap-4">
              {items.map((item: any) => (
                <div key={item.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{item.name}</span>
                    <span className="text-slate-400">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10 mt-6 text-xs flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-emerald-500 animate-pulse" />
              <strong className="text-sm font-extrabold text-slate-800 dark:text-emerald-450">AI Waste Advisor Insights</strong>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mb-1">
              Our machine learning models analyzed your historical dinner waste in Tirupati and generated these raw ingredient recommendations:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-350">
              {analytics?.recommendations?.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2 bg-white dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-emerald-500 font-extrabold">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
            <div className="mt-1 text-[10px] text-slate-400 italic text-right">
              ⚡ Next prediction run scheduled tomorrow morning
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponent: Community Leaderboards
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

// Subcomponent: Smart Donation Scheduler
const SchedulesView: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    frequency: 'WEEKLY',
    dayOfWeek: 'Wednesday',
    pickupTime: '19:00',
    foodName: '',
    category: 'Vegetarian',
    quantity: '30'
  });

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/schedules');
      setSchedules(res.data.schedules || []);
    } catch (err) {
      console.error('Error loading schedules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.foodName.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.post('/schedules', form);
      setForm(prev => ({
        ...prev,
        foodName: '',
        quantity: '30'
      }));
      fetchSchedules();
      alert('Recurring donation plan scheduled successfully!');
    } catch (err) {
      alert('Failed to save donation plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this recurring donation plan?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchSchedules();
    } catch (err) {
      alert('Failed to delete schedule plan');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Creation form */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl lg:col-span-1">
        <h3 className="font-extrabold text-sm flex items-center gap-2 mb-2">
          <Calendar className="text-emerald-500" />
          Setup Recurring Plan
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Automate food rescues by scheduling daily, weekly or event-based pick-ups.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Food Name / Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Excess Buffet Rice & Gravy"
              value={form.foodName}
              onChange={(e) => setForm({ ...form, foodName: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Food Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Est. Meals Qty</label>
              <input
                type="number"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Frequency</label>
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
            >
              <option value="DAILY">Daily Pickup</option>
              <option value="WEEKLY">Weekly Scheduled</option>
              <option value="ONCE">One-time Event</option>
            </select>
          </div>

          {form.frequency === 'WEEKLY' && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Day of the Week</label>
              <select
                value={form.dayOfWeek}
                onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Pickup Time</label>
            <input
              type="time"
              required
              value={form.pickupTime}
              onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full font-bold py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl hover-scale transition-all flex items-center justify-center gap-2 text-xs mt-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Save Recurring Plan'}
          </button>
        </form>
      </div>

      {/* Schedules List */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl min-h-[400px] flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm mb-6 flex items-center gap-2">
              📅 Active Scheduled Donation Plans
            </h4>

            {loading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <p className="text-xs text-slate-400 font-bold">Loading plans...</p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400 italic">
                No active automated scheduled pickup plans configured yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedules.map((s) => (
                  <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {s.frequency}
                        </span>
                        <h4 className="font-bold text-xs mt-2">{s.foodName}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Category: {s.category} • Quantity: {s.quantity} meals</p>
                      </div>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        title="Cancel plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800/40 pt-2 flex justify-between items-center text-[10px] text-slate-400">
                      <span>🕒 Time: <strong>{s.pickupTime}</strong></span>
                      {s.frequency === 'WEEKLY' && <span>Day: <strong>{s.dayOfWeek}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 mt-6 text-xs text-slate-500 leading-normal">
            ℹ️ When a scheduled plan triggers, FoodBridge automatically lists the food, selects the best matching NGO, and alerts nearby volunteer riders in Tirupati for instant dispatch.
          </div>
        </div>
      </div>
    </div>
  );
};

// Quality assessment math
const getQualityAssessment = (hours: number, condition: string) => {
  let score = 95;
  let color = 'text-emerald-500';
  let bg = 'bg-emerald-500/5 border-emerald-500/10';
  let risk = 'Safe (Low Risk)';
  let windowStr = '5-6 Hours';

  if (condition === 'Room Temperature') {
    if (hours >= 4) {
      score = 25;
      color = 'text-rose-500';
      bg = 'bg-rose-500/5 border-rose-500/10';
      risk = 'High Risk (Spoilage Hazard)';
      windowStr = 'Under 1 Hour';
    } else if (hours >= 2) {
      score = 60;
      color = 'text-amber-500';
      bg = 'bg-amber-500/5 border-amber-500/10';
      risk = 'Consume Soon (Medium Risk)';
      windowStr = '1-2 Hours';
    }
  } else if (condition === 'Refrigerated') {
    if (hours >= 18) {
      score = 45;
      color = 'text-rose-500';
      bg = 'bg-rose-500/5 border-rose-500/10';
      risk = 'High Risk (Expiring)';
      windowStr = 'Under 1 Hour';
    } else if (hours >= 8) {
      score = 70;
      color = 'text-amber-500';
      bg = 'bg-amber-500/5 border-amber-500/10';
      risk = 'Consume Soon (Medium Risk)';
      windowStr = '2 Hours';
    } else {
      score = 90;
      windowStr = '4 Hours';
    }
  } else if (condition === 'Frozen') {
    if (hours >= 48) {
      score = 50;
      color = 'text-amber-500';
      bg = 'bg-amber-500/5 border-amber-500/10';
      risk = 'Medium Risk';
      windowStr = '2 Hours';
    } else {
      score = 98;
      windowStr = '12 Hours';
    }
  }

  return { score, color, bg, risk, windowStr };
};

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { emitNewDonation, socket, joinDeliveryRoom, leaveDeliveryRoom } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveLocation, setLiveLocation] = useState<{ [key: string]: { lat: number; lng: number } }>({});
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submittingDonation, setSubmittingDonation] = useState(false);

  // New Donation form extensions
  const [prepTime, setPrepTime] = useState<number>(0);
  const [storageCondition, setStorageCondition] = useState<string>('Room Temperature');
  const [aiImageVerifying, setAiImageVerifying] = useState(false);
  const [aiImageResult, setAiImageResult] = useState<any>(null);
  const [ngoMatches, setNgoMatches] = useState<any[]>([]);
  const [loadingNgoMatches, setLoadingNgoMatches] = useState(false);

  // Advanced feature states
  const [showCsrModal, setShowCsrModal] = useState(false);
  const [csrReport, setCsrReport] = useState<any>(null);
  const [exportingCsr, setExportingCsr] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeQrCodeText, setActiveQrCodeText] = useState<string | null>(null);
  
  // Nutrition states
  const [nutritionFoodItems, setNutritionFoodItems] = useState('');
  const [nutritionAnalyzing, setNutritionAnalyzing] = useState(false);
  const [nutritionResult, setNutritionResult] = useState<any>(null);

  // New Donation form state
  const [donationForm, setDonationForm] = useState({
    foodName: '',
    description: '',
    category: 'Vegetarian',
    quantity: '',
    readyTime: '',
    expiryTime: '',
    pickupAddress: user?.profile?.address || '',
    notes: '',
    foodImage: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    nutritionScore: '',
  });

  const fetchDonations = async () => {
    try {
      const res = await api.get('/donations');
      setDonations(res.data.donations);
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
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

  // Match NGOs in real time
  useEffect(() => {
    const fetchNgoMatches = async () => {
      if (!donationForm.quantity) {
        setNgoMatches([]);
        return;
      }
      setLoadingNgoMatches(true);
      try {
        const res = await api.get(`/donations/smart-match?quantity=${donationForm.quantity}&category=${donationForm.category}`);
        setNgoMatches(res.data.matches || []);
      } catch (err) {
        console.error('Error matching NGOs:', err);
      } finally {
        setLoadingNgoMatches(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchNgoMatches();
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [donationForm.quantity, donationForm.category]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setDonationForm(prev => ({ ...prev, foodImage: base64 }));
        
        // Run AI verification
        setAiImageVerifying(true);
        setAiImageResult(null);
        try {
          const res = await api.post('/ai/verify-image', { image: base64 });
          setAiImageResult(res.data);
          // Pre-fill quantity if empty
          if (!donationForm.quantity && res.data.quantityEstimate) {
            setDonationForm(prev => ({ ...prev, quantity: res.data.quantityEstimate.toString() }));
          }
        } catch (err) {
          console.error('AI Verification failed:', err);
        } finally {
          setAiImageVerifying(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeNutrition = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!nutritionFoodItems.trim() || nutritionAnalyzing) return;
    setNutritionAnalyzing(true);
    setNutritionResult(null);
    try {
      const res = await api.post('/nutrition/analyze', { foodItems: nutritionFoodItems });
      setNutritionResult(res.data);
      setDonationForm(prev => ({
        ...prev,
        calories: res.data.calories.toString(),
        protein: res.data.protein.toString(),
        carbs: res.data.carbs.toString(),
        fat: res.data.fat.toString(),
        nutritionScore: res.data.nutritionScore.toString()
      }));
    } catch (err) {
      alert('Nutrition analysis failed. Please specify food items clearly.');
    } finally {
      setNutritionAnalyzing(false);
    }
  };

  const handleExportCsr = async () => {
    setExportingCsr(true);
    try {
      const res = await api.get('/csr/export');
      setCsrReport(res.data);
      setShowCsrModal(true);
    } catch (err) {
      alert('CSR Export failed. Please ensure you are logged in as an organization.');
    } finally {
      setExportingCsr(false);
    }
  };

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDonation(true);

    try {
      const res = await api.post('/donations', donationForm);
      const createdDonation = res.data.donation;
      
      // Notify other clients via Socket.IO
      emitNewDonation({
        donationId: createdDonation.id,
        foodName: createdDonation.foodName,
        quantity: createdDonation.quantity,
        pickupAddress: createdDonation.pickupAddress,
      });

      // Reset Form & Refetch
      setDonationForm({
        foodName: '',
        description: '',
        category: 'Vegetarian',
        quantity: '',
        readyTime: '',
        expiryTime: '',
        pickupAddress: user?.profile?.address || '',
        notes: '',
        foodImage: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        nutritionScore: '',
      });
      setNutritionFoodItems('');
      setNutritionResult(null);
      fetchDonations();
      alert('Donation created successfully!');
      navigate('/donor');
    } catch (err: any) {
      alert(err.message || 'Failed to create donation');
    } finally {
      setSubmittingDonation(false);
    }
  };

  // Helper stats
  const totalDonatedMeals = donations
    .filter(d => ['DELIVERED', 'VERIFIED'].includes(d.status))
    .reduce((sum, d) => sum + d.quantity, 0);

  const activeDonationsCount = donations.filter(d => ['PENDING', 'ACCEPTED', 'ASSIGNED', 'PICKED_UP'].includes(d.status)).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'ACCEPTED':
        return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'ASSIGNED':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'PICKED_UP':
        return 'bg-teal-500/10 text-teal-500 border border-teal-500/20';
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'VERIFIED':
        return 'bg-emerald-600 text-white font-bold px-2 py-0.5 rounded';
      default:
        return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-dark-50 flex flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Donor Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1">Manage surplus food listings and monitor logistics.</p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'ORGANIZATION_DONOR' && (
                <button
                  onClick={handleExportCsr}
                  disabled={exportingCsr}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-5 rounded-xl hover-scale text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700"
                >
                  {exportingCsr ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                  CSR Impact Report
                </button>
              )}
              <Link
                to="/donor/create"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl hover-scale shadow-lg hover:shadow-emerald-500/10 text-xs flex items-center gap-2"
              >
                <Plus size={16} /> Create Food Donation
              </Link>
            </div>
          </div>

          <Routes>
            {/* ACTIVE LISTINGS */}
            <Route path="/" element={
              <>
                {/* Impact Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                      🍽️
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Meals Contributed</p>
                      <h3 className="text-xl font-black mt-0.5">{totalDonatedMeals} meals</h3>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
                      📈
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Listings</p>
                      <h3 className="text-xl font-black mt-0.5">{activeDonationsCount} listings</h3>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold">
                      💝
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Donor Type</p>
                      <h3 className="text-xl font-black mt-0.5">
                        {user?.role === 'ORGANIZATION_DONOR' ? 'Hotel / Org' : 'Individual'}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Active Donations Section */}
                <div className="mb-8">
                  <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4">Active Listings Feed</h2>
                  {loading ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin text-emerald-500" size={32} />
                      <p className="text-xs text-slate-400">Loading listings...</p>
                    </div>
                  ) : donations.filter(d => !['DELIVERED', 'VERIFIED'].includes(d.status)).length === 0 ? (
                    <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                      You have no active listings right now. Click "Create Food Donation" above to list.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {donations.filter(d => !['DELIVERED', 'VERIFIED'].includes(d.status)).map((d) => (
                        <div key={d.id} className="glass-card rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between gap-4">
                          <div className="flex gap-4">
                            {d.foodImageUrl ? (
                              <img src={d.foodImageUrl} alt={d.foodName} className="h-16 w-16 rounded-xl object-cover" />
                            ) : (
                              <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">🍲</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${getStatusBadge(d.status)}`}>
                                  {d.status}
                                </span>
                                <span className="text-[10px] text-slate-400">{d.category}</span>
                                {d.nutritionScore && (
                                  <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/15">
                                    ⭐ Nutri: {d.nutritionScore}/100
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-sm truncate mt-1.5">{d.foodName}</h3>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{d.description}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/40 pt-3 text-[10px]">
                            <div>
                              <p className="text-slate-400">Meals Count: <span className="font-bold text-slate-700 dark:text-white">{d.quantity} meals</span></p>
                              <p className="text-slate-400 mt-0.5">Expiry: <span className="font-bold">{new Date(d.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setActiveQrCodeText(d.qrCodeText || `FDB-DONATION-${d.id.substring(0, 8)}`);
                                  setShowQrModal(true);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1"
                              >
                                <QrCode size={10} /> QR Code
                              </button>

                              {/* Display live tracking button if NGO accepted it and volunteer status is en route */}
                              {['ACCEPTED', 'ASSIGNED', 'PICKED_UP'].includes(d.status) && (
                                <button
                                  onClick={() => navigate(`/donor/track?id=${d.id}`)}
                                  className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white dark:text-emerald-400 px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1"
                                >
                                  <MapPin size={10} /> Track Live
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            } />

            {/* CREATE SURPLUS FOOD */}
            <Route path="/create" element={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
                <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
                  <h3 className="font-extrabold text-md">List New Surplus Food</h3>
                  <form onSubmit={handleCreateDonation} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Food Name / Item</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Leftover Biryani, Sandwiches, Donuts"
                        value={donationForm.foodName}
                        onChange={(e) => setDonationForm({ ...donationForm, foodName: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Food Description</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Describe items, package status (e.g. packed in boxes, bring containers)"
                        value={donationForm.description}
                        onChange={(e) => setDonationForm({ ...donationForm, description: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Food Category</label>
                        <select
                          value={donationForm.category}
                          onChange={(e) => setDonationForm({ ...donationForm, category: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
                        >
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Non-Vegetarian">Non-Vegetarian</option>
                          <option value="Mixed">Mixed</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity (Meals count)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 40"
                          value={donationForm.quantity}
                          onChange={(e) => setDonationForm({ ...donationForm, quantity: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Hours Since Prep</label>
                        <input
                          type="number"
                          min="0"
                          value={prepTime}
                          onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Storage Condition</label>
                        <select
                          value={storageCondition}
                          onChange={(e) => setStorageCondition(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
                        >
                          <option value="Room Temperature">Room Temperature</option>
                          <option value="Refrigerated">Refrigerated</option>
                          <option value="Frozen">Frozen</option>
                        </select>
                      </div>
                    </div>

                    {/* Expiry Risk analysis Gauge */}
                    {(() => {
                      const quality = getQualityAssessment(prepTime, storageCondition);
                      return (
                        <div className={`p-4 rounded-2xl border ${quality.bg} flex flex-col gap-1.5 transition-all duration-300`}>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold flex items-center gap-1">
                              <ShieldCheck size={14} className="text-emerald-500" />
                              Expiry & Quality Check:
                            </span>
                            <span className={`font-black ${quality.color}`}>{quality.risk}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-500 ${quality.score > 75 ? 'bg-emerald-500' : quality.score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${quality.score}%` }} />
                            </div>
                            <span className="text-xs font-black">{quality.score}%</span>
                          </div>
                          <span className="text-[10px] text-slate-400">Safe consumption window: <strong>{quality.windowStr}</strong></span>
                        </div>
                      );
                    })()}

                    {/* Nutrition Analyzer Tool */}
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold flex items-center gap-1">
                          <Sparkles size={14} className="text-emerald-500" />
                          Nutrition Calculator & Scorecard:
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Rice, Chicken Curry, Paneer butter masala"
                          value={nutritionFoodItems}
                          onChange={(e) => setNutritionFoodItems(e.target.value)}
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleAnalyzeNutrition}
                          disabled={nutritionAnalyzing}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl hover-scale text-xs flex items-center gap-1.5"
                        >
                          {nutritionAnalyzing ? <Loader2 className="animate-spin" size={12} /> : null}
                          Analyze
                        </button>
                      </div>

                      {nutritionResult && (
                        <div className="grid grid-cols-4 gap-2 text-center mt-1">
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] text-slate-400 block font-bold">CALORIES</span>
                            <span className="text-xs font-black text-slate-800 dark:text-white">{nutritionResult.calories} kcal</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] text-slate-400 block font-bold">PROTEIN</span>
                            <span className="text-xs font-black text-slate-800 dark:text-white">{nutritionResult.protein}g</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] text-slate-400 block font-bold">CARBS</span>
                            <span className="text-xs font-black text-slate-800 dark:text-white">{nutritionResult.carbs}g</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] text-slate-400 block font-bold">SCORE</span>
                            <span className="text-xs font-black text-emerald-500">{nutritionResult.nutritionScore}/100</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Ready Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={donationForm.readyTime}
                          onChange={(e) => setDonationForm({ ...donationForm, readyTime: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Expiry Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={donationForm.expiryTime}
                          onChange={(e) => setDonationForm({ ...donationForm, expiryTime: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Pickup Address (Tirupati landmarks)</label>
                      <select
                        value={donationForm.pickupAddress}
                        onChange={(e) => setDonationForm({ ...donationForm, pickupAddress: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none"
                      >
                        {TIRUPATI_LANDMARKS.map(landmark => (
                          <option key={landmark} value={landmark}>{landmark}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Food Photo (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-955"
                      />
                      {aiImageVerifying && (
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                          <Loader2 className="animate-spin text-emerald-500" size={14} />
                          <span>AI Scanning image for spoilage...</span>
                        </div>
                      )}
                      {!aiImageVerifying && aiImageResult && (
                        <div className="mt-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex flex-col gap-1 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                            <Sparkles size={12} />
                            <span>AI Food Verification Audit</span>
                          </div>
                          <p>Category: <strong>{aiImageResult.category}</strong></p>
                          <p>Estimated Meals: <strong>{aiImageResult.quantityEstimate} meals</strong> (Confidence: {aiImageResult.confidence}%)</p>
                          <p>Spoilage Check: <strong className="text-emerald-500">{aiImageResult.spoilageIndicators}</strong></p>
                          <p>Freshness Score: <strong>{aiImageResult.freshnessScore}%</strong> (Consumption window: {aiImageResult.safeConsumptionWindow})</p>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submittingDonation}
                      className="w-full font-bold py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl hover-scale transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 mt-2"
                    >
                      {submittingDonation ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Listing Food...
                        </>
                      ) : (
                        'Submit Listing'
                      )}
                    </button>
                  </form>
                </div>

                {/* Right side: Smart NGO Match Ranking */}
                <div className="flex flex-col gap-6">
                  <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
                    <h3 className="font-extrabold text-sm flex items-center gap-2">
                      <HeartHandshake className="text-emerald-500" />
                      Smart NGO Matching
                    </h3>
                    <p className="text-xs text-slate-400">
                      We automatically recommend nearby NGOs in Tirupati matching your current surplus quantity & category.
                    </p>

                    {loadingNgoMatches ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                        <p className="text-xs text-slate-400">Matching nearest shelters...</p>
                      </div>
                    ) : ngoMatches.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400 italic">
                        Select food category and enter quantity to view matching scores.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                        {ngoMatches.map((ngo: any) => (
                          <div key={ngo.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-extrabold text-xs">{ngo.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{ngo.distance} km away • Cap: {ngo.capacity} meals</p>
                              </div>
                              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-black text-[10px] shadow-sm">
                                {ngo.matchScore}% Match
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex flex-col gap-0.5 border-t border-slate-100 dark:border-slate-800/40 pt-2">
                              <p>📍 {ngo.address}</p>
                              <p>📞 {ngo.mobile} ({ngo.contactPerson})</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            } />

            {/* SMART SCHEDULER TAB */}
            <Route path="/schedules" element={<SchedulesView />} />

            {/* AI PREDICTION TAB */}
            <Route path="/predict" element={<AiPredictionView setDonationForm={setDonationForm} navigate={navigate} />} />

            {/* WASTE ANALYTICS TAB */}
            <Route path="/waste" element={<WasteAnalyticsView />} />

            {/* LEADERBOARD TAB */}
            <Route path="/leaderboard" element={<LeaderboardView />} />

            {/* DONATION HISTORY */}
            <Route path="/history" element={
              <div>
                <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4">Donation History</h2>
                {donations.filter(d => ['DELIVERED', 'VERIFIED'].includes(d.status)).length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border border-slate-100 dark:border-slate-800/20 rounded-2xl">
                    No past deliveries recorded yet.
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
                            <th className="p-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs">
                          {donations.filter(d => ['DELIVERED', 'VERIFIED'].includes(d.status)).map((d) => (
                            <tr key={d.id} className="border-b border-slate-50 dark:border-slate-800/25 hover:bg-slate-100/30 dark:hover:bg-slate-800/10">
                              <td className="p-4 font-bold">{d.foodName}</td>
                              <td className="p-4 text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                              <td className="p-4">{d.quantity} meals</td>
                              <td className="p-4 text-slate-400">{d.assignments?.[0]?.destinationName || 'Local Shelter'}</td>
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

            {/* LIVE TRACKING MAP */}
            <Route path="/track" element={
              <div className="glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/80 mb-8 flex flex-col gap-4 animate-fade-in relative">
                <h2 className="text-sm font-extrabold flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Tracking Map
                </h2>
                {(() => {
                  const trackId = searchParams.get('id');
                  const trackableDonations = donations.filter(d => ['ACCEPTED', 'ASSIGNED', 'PICKED_UP'].includes(d.status));
                  const trackDonation = donations.find(d => d.id === trackId) || trackableDonations[0];
                  
                  if (!trackDonation) {
                    return <p className="text-xs text-slate-400 p-6 text-center">No active donations are currently en route to track.</p>;
                  }

                  return (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-xs font-bold text-slate-400">Tracking Donation: <strong className="text-slate-700 dark:text-white">{trackDonation.foodName}</strong></span>
                        {trackableDonations.length > 1 && (
                          <select
                            value={trackDonation.id}
                            onChange={(e) => navigate(`/donor/track?id=${e.target.value}`)}
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
          </Routes>
        </main>
      </div>

      {/* CSR Impact Report Certificate Modal */}
      {showCsrModal && csrReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative flex flex-col gap-6 animate-scale-up">
            <button 
              onClick={() => setShowCsrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-full hover:bg-slate-105 dark:hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="text-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-6">
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                Audit Verified CSR Report
              </span>
              <h2 className="text-xl font-black mt-3 text-slate-800 dark:text-white uppercase tracking-wide">
                Corporate Social Responsibility Certificate
              </h2>
              <p className="text-xs text-slate-400 mt-1">rescuing surplus meals for zero waste in Tirupati landmarks</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Organization Name</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{csrReport.orgName}</span>
                <span className="text-slate-400 text-[10px] truncate">{csrReport.address}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Reporting Window</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{csrReport.reportingPeriod}</span>
                <span className="text-slate-400 text-[10px]">Verified Audit Stamp Y-2026</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10 flex flex-col justify-center">
                <span className="text-[9px] text-slate-400 font-bold">MEALS SAVED</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{csrReport.metrics.mealsRescued}</span>
              </div>
              <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10 flex flex-col justify-center">
                <span className="text-[9px] text-slate-400 font-bold">TOTAL LISTS</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{csrReport.metrics.totalDonations}</span>
              </div>
              <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10 flex flex-col justify-center">
                <span className="text-[9px] text-slate-400 font-bold">WASTE PREVENTED</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{csrReport.metrics.wastePreventedKg.toFixed(1)} kg</span>
              </div>
              <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10 flex flex-col justify-center">
                <span className="text-[9px] text-slate-400 font-bold">CO₂ DECREASED</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{csrReport.metrics.co2SavedKg.toFixed(1)} kg</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs text-left">
              <div>
                <span className="font-bold text-slate-800 dark:text-white">CSR Security Hash</span>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{csrReport.stamp}</p>
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-600 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-lg">
                Grade {csrReport.metrics.sustainabilityScore.split(' ')[0]}
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs hover-scale text-center"
              >
                Print / Save PDF Certificate
              </button>
              <button
                onClick={() => setShowCsrModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs hover-scale text-center"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated QR Code Modal */}
      {showQrModal && activeQrCodeText && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative flex flex-col items-center gap-4 text-center animate-scale-up">
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ✕
            </button>

            <h3 className="font-extrabold text-sm flex items-center gap-1.5 mt-2">
              <QrCode size={18} className="text-emerald-500 animate-pulse" />
              Verified Pickup QR Key
            </h3>
            <p className="text-xs text-slate-400">Present this QR code to the volunteer rider to verify the food handover.</p>

            {/* Simulated QR Code Graphic */}
            <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 flex flex-col items-center justify-center mt-2">
              <div className="grid grid-cols-5 gap-1.5 w-40 h-40 bg-slate-50 p-2 border border-slate-200 rounded-xl relative">
                <div className="col-start-1 row-start-1 bg-slate-900 rounded"></div>
                <div className="col-start-5 row-start-1 bg-slate-900 rounded"></div>
                <div className="col-start-1 row-start-5 bg-slate-900 rounded"></div>
                
                <div className="col-start-3 row-start-1 bg-slate-900/60 rounded"></div>
                <div className="col-start-2 row-start-2 bg-slate-900 rounded"></div>
                <div className="col-start-4 row-start-2 bg-slate-900/40 rounded"></div>
                <div className="col-start-3 row-start-3 bg-slate-900 rounded animate-pulse"></div>
                <div className="col-start-5 row-start-3 bg-slate-900 rounded"></div>
                <div className="col-start-2 row-start-4 bg-slate-900/80 rounded"></div>
                <div className="col-start-4 row-start-4 bg-slate-900 rounded"></div>
                <div className="col-start-3 row-start-5 bg-slate-900/50 rounded"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-emerald-500 text-white font-extrabold text-[8px] tracking-tighter px-1.5 py-0.5 rounded shadow">FDB KEY</span>
                </div>
              </div>
              <span className="text-[8px] font-mono text-slate-400 tracking-wider uppercase mt-3">{activeQrCodeText}</span>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl text-[10px] text-slate-400 flex flex-col gap-1 border border-slate-100 dark:border-slate-800">
              <p>📌 Handover location: Tirupati Operational Zone</p>
              <p>🕒 Timestamp: {new Date().toLocaleTimeString()}</p>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs hover-scale"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
