import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { MapComponent } from '../components/MapComponent';
import api from '../services/api';
import {
  Plus, Navigation, Loader2, Play, Square, Trophy, Sparkles, QrCode, Camera
} from 'lucide-react';

// Subcomponent: Volunteer Leaderboards
const LeaderboardView: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'donors' | 'volunteers'>('volunteers');
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

// Subcomponent: Volunteer Achievements center
const VolunteerAchievementsView: React.FC = () => {
  const [achievements, setAchievements] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get('/volunteer/achievements');
        setAchievements(res.data.achievement || null);
      } catch (err) {
        console.error('Error fetching achievements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p className="text-xs text-slate-400 font-bold">Loading achievements Center...</p>
      </div>
    );
  }

  const badgeIcons: { [key: string]: string } = {
    'Gold Star': '⭐',
    'Speedy Delivery': '⚡',
    'Tirupati Savior': '🛡️',
    'Food Hero': '🚴',
    'Hunger Fighter': '🌟'
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Achievements Center</h2>
          <p className="text-xs text-slate-400 mt-1">Track your impact, delivery distance, hours served, and rewards.</p>
        </div>
        <button
          onClick={() => setShowResumeModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 hover-scale transition-all"
        >
          📄 Generate Impact Resume
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deliveries Completed</span>
          <h3 className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">{achievements?.deliveries || 0}</h3>
          <p className="text-[9px] text-slate-400 mt-1">Successful food rescues.</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distance Rescued</span>
          <h3 className="text-2xl font-black mt-2 text-blue-500">{(achievements?.distance || 0.0).toFixed(1)} km</h3>
          <p className="text-[9px] text-slate-400 mt-1">Total travel across Tirupati landmarks.</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hours Contributed</span>
          <h3 className="text-2xl font-black mt-2 text-amber-500">{(achievements?.hours || 0.0).toFixed(1)} hrs</h3>
          <p className="text-[9px] text-slate-400 mt-1">Time spent en-route and in transit.</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Impact Points</span>
          <h3 className="text-2xl font-black mt-2 text-purple-500">{achievements?.points || 0} pts</h3>
          <p className="text-[9px] text-slate-400 mt-1">Unlock next tier level badges.</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
        <h4 className="font-extrabold text-sm mb-4">🎖️ Earned Badges & Ribbons</h4>
        <div className="flex flex-wrap gap-4">
          {achievements?.badges?.map((badge: string) => (
            <div key={badge} className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl px-4 py-3 hover-scale text-left">
              <span className="text-xl">{badgeIcons[badge] || '🏅'}</span>
              <div>
                <span className="font-bold text-xs block text-slate-850 dark:text-white">{badge}</span>
                <span className="text-[9px] text-slate-400">Unlocked & Active</span>
              </div>
            </div>
          )) || <p className="text-xs text-slate-450 italic">No achievements badges awarded yet.</p>}
        </div>
      </div>

      {/* Volunteer Impact Resume & Certificate Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative flex flex-col gap-6 animate-scale-up">
            <button 
              onClick={() => setShowResumeModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="text-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-6">
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                FoodBridge Impact Verification
              </span>
              <h2 className="text-xl font-black mt-3 text-slate-800 dark:text-white uppercase tracking-wide">
                Social Impact Resume & Certificate
              </h2>
              <p className="text-xs text-slate-400 mt-1">Verified community service and food rescue hours in Tirupati</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Volunteer Name</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{user?.profile?.fullName || 'Active Volunteer'}</span>
                <span className="text-slate-400 text-[10px] truncate">{user?.email}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Service ID</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">{achievements?.id?.substring(0, 13) || 'FDB-VOL-738'}</span>
                <span className="text-slate-400 text-[10px]">Active Status: {user?.status || 'APPROVED'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10 flex flex-col justify-center">
                <span className="text-[9px] text-slate-400 font-bold">RESCUES DONE</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{achievements?.deliveries || 0}</span>
              </div>
              <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10 flex flex-col justify-center">
                <span className="text-[9px] text-slate-400 font-bold">TOTAL DISTANCE</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{(achievements?.distance || 0.0).toFixed(1)} km</span>
              </div>
              <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10 flex flex-col justify-center">
                <span className="text-[9px] text-slate-400 font-bold">HOURS SERVED</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{(achievements?.hours || 0.0).toFixed(1)} hrs</span>
              </div>
              <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10 flex flex-col justify-center">
                <span className="text-[9px] text-slate-400 font-bold">CO₂ DECREASED</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{((achievements?.deliveries || 0) * 12.5).toFixed(1)} kg</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col gap-2 text-xs text-left">
              <span className="font-bold text-slate-850 dark:text-white">Achievements & Badges</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {achievements?.badges?.map((badge: string) => (
                  <span key={badge} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )) || <span className="text-slate-400 text-[10px]">No badges earned yet.</span>}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs hover-scale text-center"
              >
                Print / Save PDF Certificate
              </button>
              <button
                onClick={() => setShowResumeModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs hover-scale text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { emitLocationUpdate, emitStatusChange } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const navigate = useNavigate();

  // Simulation states
  const [gpsSimulating, setGpsSimulating] = useState(false);
  const [simIntervalId, setSimIntervalId] = useState<number | null>(null);
  const [liveLocation, setLiveLocation] = useState<{lat?: number, lng?: number}>({});

  // Delivery proof form
  const [showProofPanel, setShowProofPanel] = useState(false);
  const [proofPhoto, setProofPhoto] = useState('');
  const [recipientPhoto, setRecipientPhoto] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  // QR scanner states
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [scanningJob, setScanningJob] = useState<{ assignmentId: string; donationId: string; qrCodeText?: string } | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [availRes, myRes] = await Promise.all([
        api.get('/volunteer/available'),
        api.get('/donations') // Fetch all donations to filter those assigned to me
      ]);

      setAvailableJobs(availRes.data.assignments);

      // Filter my active and completed assignments
      const myDons = myRes.data.donations.filter((d: any) =>
        d.assignments?.some((a: any) => a.volunteerId === user?.profile?.id)
      );
      setMyJobs(myDons);
    } catch (err) {
      console.error('Error fetching volunteer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAcceptJob = async (assignmentId: string) => {
    try {
      await api.post(`/volunteer/accept/${assignmentId}`);
      fetchJobs();
      alert('Job accepted! Redirecting to update status.');
      navigate('/volunteer/my-jobs');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept job');
    }
  };

  const handleUpdateStatus = async (assignmentId: string, nextStatus: string, donationId: string) => {
    try {
      await api.post(`/volunteer/update-status/${assignmentId}`, { status: nextStatus });

      // Notify over Socket.IO
      emitStatusChange({
        assignmentId,
        donationId,
        status: nextStatus,
        message: `Rider is now: ${nextStatus.replace(/_/g, ' ')}`,
      });

      fetchJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async (e: React.FormEvent, assignmentId: string, donationId: string) => {
    e.preventDefault();
    if (!proofPhoto) {
      alert('Please select or capture a delivery photo proof.');
      return;
    }

    setSubmittingProof(true);
    try {
      // 1. Submit proof images
      await api.post(`/volunteer/proof/${assignmentId}`, {
        photo: proofPhoto,
        recipientPhoto: recipientPhoto || null,
        notes: proofNotes,
      });

      // 2. Mark delivered
      await api.post(`/volunteer/update-status/${assignmentId}`, { status: 'DELIVERED' });

      // Notify over Socket.IO
      emitStatusChange({
        assignmentId,
        donationId,
        status: 'DELIVERED',
        message: `Rider John Doe delivered food to destination. Awaiting NGO signoff.`,
      });

      // Clear proof states
      setProofPhoto('');
      setRecipientPhoto('');
      setProofNotes('');
      setShowProofPanel(false);

      // Stop GPS simulation if running
      stopGpsSimulation();

      fetchJobs();
      alert('Delivery complete! NGO has been requested to verify.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit proof');
    } finally {
      setSubmittingProof(false);
    }
  };

  // GPS Coordinate Route Simulation in Tirupati
  const startGpsSimulation = (assignmentId: string) => {
    if (gpsSimulating) return;
    if (!activeJob || !activeAssignment) return;
    setGpsSimulating(true);

    // Tirupati landmark coordinate mapping
    const locationCoords: { [key: string]: [number, number] } = {
      'Ramanuja Circle, Tirupati, Andhra Pradesh 517501': [13.6231, 79.4292],
      'Bairagipatteda, Tirupati, Andhra Pradesh 517501': [13.6285, 79.4180],
      'MR Palli, Tirupati, Andhra Pradesh 517502': [13.6180, 79.4120],
      'Balaji Colony, Tirupati, Andhra Pradesh 517501': [13.6295, 79.4105],
      'RUIA Hospital, Alipiri Road, Tirupati, Andhra Pradesh 517507': [13.6373, 79.4032],
      'SVIMS Hospital, Tirupati, Andhra Pradesh 517507': [13.6395, 79.4022],
      'Tirumala Bypass Road, Tirupati, Andhra Pradesh 517501': [13.6280, 79.4160],
      'Korlagunta, Tirupati, Andhra Pradesh 517501': [13.6330, 79.4320]
    };

    const pickup = locationCoords[activeJob.pickupAddress] || [13.6231, 79.4292];
    const dest = locationCoords[activeAssignment.destinationAddress] || [13.6373, 79.4032];

    const steps = 6;
    const path: { lat: number; lng: number }[] = [];
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      path.push({
        lat: pickup[0] + t * (dest[0] - pickup[0]),
        lng: pickup[1] + t * (dest[1] - pickup[1])
      });
    }

    let progress = 0;

    const interval = setInterval(async () => {
      if (progress >= path.length) {
        clearInterval(interval);
        setGpsSimulating(false);
        return;
      }

      const coord = path[progress];
      setLiveLocation({ lat: coord.lat, lng: coord.lng });

      // Send location update to Backend
      try {
        await api.post('/volunteer/location', {
          latitude: coord.lat,
          longitude: coord.lng,
        });

        // Broadcast live coordinate over Socket.IO
        emitLocationUpdate({
          assignmentId,
          latitude: coord.lat,
          longitude: coord.lng,
          volunteerName: user?.profile?.fullName || 'John Rider',
        });
      } catch (err) {
        console.error('GPS update failed:', err);
      }

      progress += 1;
    }, 4000);

    setSimIntervalId(interval as any);
  };

  const stopGpsSimulation = () => {
    if (simIntervalId) {
      clearInterval(simIntervalId);
      setSimIntervalId(null);
    }
    setGpsSimulating(false);
    setLiveLocation({});
  };

  const activeJob = myJobs.find(j => !['DELIVERED', 'VERIFIED'].includes(j.status));
  const activeAssignment = activeJob?.assignments?.[0];

  const getStatusButtonText = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'Start Delivery (Mark On The Way)';
      case 'ON_THE_WAY': return 'Arrived at Pickup (Hotel/Org)';
      case 'ARRIVED_AT_PICKUP': return 'Confirm Food Loaded (Picked Up)';
      case 'FOOD_PICKED_UP': return 'Depart to Destination (Mark Delivering)';
      case 'DELIVERING': return 'Delivered! (Upload Proof)';
      default: return 'Next Stage';
    }
  };

  const triggerNextStatus = (assignmentId: string, status: string, donationId: string) => {
    let next = 'ON_THE_WAY';
    if (status === 'ASSIGNED') next = 'ON_THE_WAY';
    else if (status === 'ON_THE_WAY') next = 'ARRIVED_AT_PICKUP';
    else if (status === 'ARRIVED_AT_PICKUP') {
      setScanningJob({ assignmentId, donationId, qrCodeText: activeJob?.qrCodeText || `FDB-DONATION-${donationId.substring(0, 8)}` });
      setShowQrScannerModal(true);
      return;
    }
    else if (status === 'FOOD_PICKED_UP') next = 'DELIVERING';
    else if (status === 'DELIVERING') {
      setShowProofPanel(true);
      return;
    }

    handleUpdateStatus(assignmentId, next, donationId);
  };

  const handleQrScanSuccess = () => {
    if (scanningJob) {
      handleUpdateStatus(scanningJob.assignmentId, 'FOOD_PICKED_UP', scanningJob.donationId);
      setShowQrScannerModal(false);
      setScanningJob(null);
      alert('QR Code scanned and verified successfully! Food Picked Up.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-dark-50 flex flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Volunteer Hub</h1>
            <p className="text-xs text-slate-400 mt-1">Accept food pickups and report delivery details.</p>
          </div>

          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <p className="text-xs text-slate-400">Loading volunteer hub...</p>
            </div>
          ) : (
            <Routes>
              {/* AVAILABLE PICKUPS (default) */}
              <Route path="/" element={
                <div className="animate-fade-in flex flex-col gap-8">
                  {/* Available Jobs list */}
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4">Available Pickups in your city</h2>
                    {availableJobs.length === 0 ? (
                      <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                        No open pickups available at this time.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {availableJobs.map((job) => (
                          <div key={job.id} className="glass-card rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-400 uppercase font-bold">
                                  {job.destinationType}
                                </span>
                                <span className="text-xs font-extrabold text-emerald-500">{job.donation.quantity} meals</span>
                              </div>
                              <h3 className="font-bold text-sm mt-2">{job.donation.foodName}</h3>
                              <p className="text-[10px] text-slate-400 mt-1">From: {job.donation.pickupAddress}</p>
                              <p className="text-[10px] text-slate-400">To: {job.destinationName} ({job.destinationAddress})</p>
                            </div>

                            <button
                              onClick={() => handleAcceptJob(job.id)}
                              disabled={!!activeJob}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:scale-100 text-white font-bold py-2 rounded-xl text-xs hover-scale transition-all flex items-center justify-center gap-1.5"
                            >
                              <Plus size={14} /> Accept Delivery Request
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {activeJob && activeAssignment && (
                    <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Active Job En Route</span>
                        <h3 className="font-bold text-sm mt-1">{activeJob.foodName}</h3>
                        <p className="text-xs text-slate-400">Heading to {activeAssignment.destinationName}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to="/volunteer/my-jobs" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all">
                          Update Status
                        </Link>
                        <Link to="/volunteer/map" className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-350 text-xs px-4 py-2.5 rounded-xl font-bold transition-all">
                          View Route Map
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              } />

              {/* MY DELIVERIES */}
              <Route path="/my-jobs" element={
                <div className="animate-fade-in flex flex-col gap-8">
                  {activeJob && activeAssignment ? (
                    <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 dark:border-emerald-800/40 flex flex-col gap-6 glow-green">
                      <div className="flex justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/40">
                        <div>
                          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded uppercase">
                            Active Delivery Job
                          </span>
                          <h2 className="text-md font-extrabold mt-1">{activeJob.foodName}</h2>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link to="/volunteer/map" className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 font-bold py-2 px-3 rounded-lg text-[10px] flex items-center gap-1">
                            🗺️ Open Map Route
                          </Link>
                        </div>
                      </div>

                      {/* Navigation HUD */}
                      <div className="grid sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/20 flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">1. Pick Up Location</span>
                          <p className="font-bold">{activeJob.pickupAddress}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Meals quantity: {activeJob.quantity} meals</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/20 flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">2. Drop Off Location ({activeAssignment.destinationType})</span>
                          <p className="font-bold">{activeAssignment.destinationName}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{activeAssignment.destinationAddress}</p>
                        </div>
                      </div>

                      {/* Stage Progress updates buttons */}
                      {!showProofPanel ? (
                        <button
                          onClick={() => triggerNextStatus(activeAssignment.id, activeAssignment.status, activeJob.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover-scale transition-all flex items-center justify-center gap-2 text-xs"
                        >
                          <Navigation size={14} /> {getStatusButtonText(activeAssignment.status)}
                        </button>
                      ) : (
                        /* UPLOAD DELIVERY PROOF FORM */
                        <form
                          onSubmit={(e) => handleUploadProof(e, activeAssignment.id, activeJob.id)}
                          className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 animate-fade-in"
                        >
                          <h3 className="font-bold text-xs uppercase tracking-wider">Submit Delivery Verification Proof</h3>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">1. Delivery Photo Proof (Required)</label>
                              <input
                                type="file"
                                required
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setProofPhoto)}
                                className="text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">2. Recipient Photo (Optional)</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setRecipientPhoto)}
                                className="text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery Notes / Handover description</label>
                            <textarea
                              required
                              rows={2}
                              placeholder="e.g. Handed over 40 fresh meals to Shelter Manager Sarah."
                              value={proofNotes}
                              onChange={(e) => setProofNotes(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setShowProofPanel(false)}
                              className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-650 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submittingProof}
                              className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl hover-scale transition-all flex items-center justify-center gap-1"
                            >
                              {submittingProof ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" /> Uploading...
                                </>
                              ) : (
                                'Complete & Mark Delivered Successfully'
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                      You do not have any active delivery jobs. Accept one from the available pickups.
                    </div>
                  )}

                  {/* Delivery History Log */}
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4">Completed Deliveries</h2>
                    {myJobs.filter(j => ['DELIVERED', 'VERIFIED'].includes(j.status)).length === 0 ? (
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
                                <th className="p-4">Destination</th>
                                <th className="p-4">Meals Count</th>
                                <th className="p-4 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="text-xs">
                              {myJobs.filter(j => ['DELIVERED', 'VERIFIED'].includes(j.status)).map((j) => (
                                <tr key={j.id} className="border-b border-slate-50 dark:border-slate-800/25 hover:bg-slate-100/30 dark:hover:bg-slate-800/10">
                                  <td className="p-4 font-bold">{j.foodName}</td>
                                  <td className="p-4 text-slate-400">{j.assignments?.[0]?.destinationName}</td>
                                  <td className="p-4">{j.quantity} meals</td>
                                  <td className="p-4 text-right">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${j.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                                      }`}>
                                      {j.status}
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
                </div>
              } />
                    {/* ACTIVE ROUTE MAP */}
              <Route path="/map" element={
                <div className="animate-fade-in flex flex-col gap-6">
                  {activeJob && activeAssignment ? (
                    <div className="glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/80 flex flex-col gap-4 relative">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/40">
                        <h2 className="text-sm font-extrabold flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                          Active Route: {activeJob.foodName}
                        </h2>
 
                        {/* GPS Simulation Buttons */}
                        <div className="flex items-center gap-2">
                          {!gpsSimulating ? (
                            <button
                              onClick={() => startGpsSimulation(activeAssignment.id)}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg text-[10px] flex items-center gap-1.5"
                            >
                              <Play size={10} /> Sim GPS Route
                            </button>
                          ) : (
                            <button
                              onClick={stopGpsSimulation}
                              className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-3 rounded-lg text-[10px] flex items-center gap-1.5 animate-pulse"
                            >
                              <Square size={10} /> Stop GPS Sim
                            </button>
                          )}
                        </div>
                      </div>
 
                      <MapComponent
                        pickupAddress={activeJob.pickupAddress}
                        destAddress={activeAssignment.destinationAddress}
                        volunteerStatus={activeAssignment.status}
                        volunteerLat={liveLocation.lat}
                        volunteerLng={liveLocation.lng}
                      />

                      {/* Route Optimization HUD Overlay */}
                      <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-xs flex flex-col gap-2">
                        <strong className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Sparkles size={14} /> Smart Route & Fuel Optimization Tips
                        </strong>
                        <ul className="list-disc pl-4 space-y-1.5 text-slate-500 dark:text-slate-400 leading-normal">
                          <li>Route Distance: <strong>3.2 km</strong> (Shortest Path selected).</li>
                          <li>Est. Transit Time: <strong>8 minutes</strong>.</li>
                          <li>Speed Suggestion: Maintain a steady <strong>35-40 km/h</strong> on the bypass road to optimize fuel efficiency by <strong>18%</strong>.</li>
                          <li>Traffic Notice: High congestion reported near Ramanuja Circle. We recommend taking the SVIMS university link road for a faster bypass.</li>
                        </ul>
                      </div>
 
                      <div className="grid sm:grid-cols-2 gap-4 text-xs mt-2">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/20">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Pickup Address</span>
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{activeJob.pickupAddress}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/20">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Dropoff Address ({activeAssignment.destinationType})</span>
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{activeAssignment.destinationName} ({activeAssignment.destinationAddress})</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                      No active delivery route map to display. Please accept a pickup request first.
                    </div>
                  )}
                </div>
              } />

              {/* LEADERBOARD TAB */}
              <Route path="/leaderboard" element={<LeaderboardView />} />

              {/* ACHIEVEMENTS TAB */}
              <Route path="/achievements" element={<VolunteerAchievementsView />} />
            </Routes>
          )}
        </main>
      </div>

      {/* Simulated QR Code Scanner Modal */}
      {showQrScannerModal && scanningJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative flex flex-col items-center gap-4 text-center animate-scale-up">
            <button 
              onClick={() => {
                setShowQrScannerModal(false);
                setScanningJob(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ✕
            </button>

            <h3 className="font-extrabold text-sm flex items-center gap-1.5 mt-2">
              <QrCode size={18} className="text-emerald-500 animate-pulse" />
              Scan Pickup QR Code
            </h3>
            <p className="text-xs text-slate-400">Position the donor's QR code within the frame to verify handover.</p>

            {/* Viewfinder Mockup */}
            <div className="w-52 h-52 border-2 border-emerald-500 rounded-3xl p-4 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] animate-bounce top-1/2" />
              <div className="border border-dashed border-emerald-500/40 w-40 h-40 rounded-2xl flex flex-col items-center justify-center">
                <Camera size={36} className="text-emerald-500/50 animate-pulse" />
                <span className="text-[8px] font-mono text-emerald-500/60 mt-2 uppercase tracking-widest">Viewfinder Active</span>
              </div>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl text-[10px] text-slate-400 flex flex-col gap-1.5 border border-slate-100 dark:border-slate-800 text-left">
              <p>🎯 <strong>Target Donation Key:</strong> <span className="font-mono text-slate-700 dark:text-emerald-400 font-bold">{scanningJob.qrCodeText}</span></p>
              <p>📍 <strong>Pickup:</strong> {activeJob?.pickupAddress}</p>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleQrScanSuccess}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs hover-scale"
              >
                Simulate QR Scan Success
              </button>
              <button
                onClick={() => {
                  setShowQrScannerModal(false);
                  setScanningJob(null);
                }}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-350 font-bold rounded-xl text-xs hover:bg-slate-200"
              >
                Cancel Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
