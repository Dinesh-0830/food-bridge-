import React, { useEffect, useState } from 'react';
import { ShieldAlert, PhoneCall, AlertOctagon } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const DisasterAlert: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const response = await api.get('/disaster/status');
      setIsActive(!!response.data.disasterMode);
    } catch (error) {
      console.error('Failed to load disaster status', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    checkStatus();

    // Set up polling for instant updates if websockets are reconnecting
    const interval = setInterval(checkStatus, 5000);

    // Socket integration if active
    if (socket) {
      const handleNotification = (data: any) => {
        if (data.title && data.title.includes('DISASTER')) {
          checkStatus();
        }
      };
      socket.on('notification-received', handleNotification);
      return () => {
        socket.off('notification-received', handleNotification);
        clearInterval(interval);
      };
    }

    return () => {
      clearInterval(interval);
    };
  }, [user, socket]);

  if (!user || loading || !isActive) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-3 shadow-lg relative flex items-center justify-between overflow-hidden animate-pulse border-b border-red-500/20">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:40px_40px] opacity-20"></div>
      
      <div className="flex items-center space-x-3 z-10 mx-auto md:mx-0">
        <div className="p-1.5 bg-white/20 rounded-lg animate-bounce">
          <AlertOctagon className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold uppercase tracking-wider text-xs bg-black/30 px-2 py-0.5 rounded-full mr-2">
            SOS ALERT
          </span>
          <span className="font-medium text-sm md:text-base">
            Disaster Relief Mode is active in Tirupati. Priority matching activated for shelters & emergency zones.
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center space-x-4 z-10">
        <div className="flex items-center space-x-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer">
          <PhoneCall className="h-3.5 w-3.5" />
          <span>RUIA SOS: +91 877-2286666</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs font-semibold bg-black/20 px-3 py-1.5 rounded-lg border border-red-500/30">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Tirupati Control Hub</span>
        </div>
      </div>
    </div>
  );
};
export default DisasterAlert;
