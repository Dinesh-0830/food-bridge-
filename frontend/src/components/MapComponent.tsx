import React, { useEffect, useState } from 'react';
import { Navigation, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

interface MapComponentProps {
  pickupLat?: number;
  pickupLng?: number;
  pickupAddress: string;
  destLat?: number;
  destLng?: number;
  destAddress: string;
  volunteerLat?: number;
  volunteerLng?: number;
  volunteerName?: string;
  volunteerStatus?: string; // ASSIGNED, ON_THE_WAY, ARRIVED, FOOD_PICKED_UP, DELIVERING, DELIVERED
}

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

const getCoords = (address: string, isDest = false): [number, number] => {
  if (address && locationCoords[address]) {
    return locationCoords[address];
  }
  // Fallback defaults
  return isDest ? [13.6373, 79.4032] : [13.6231, 79.4292];
};

export const MapComponent: React.FC<MapComponentProps> = ({
  pickupAddress,
  destAddress,
  volunteerLat,
  volunteerLng,
  volunteerName = 'Volunteer John',
  volunteerStatus = 'DELIVERING'
}) => {
  const [progress, setProgress] = useState(0.4); // 0 to 1 along the path
  const [eta, setEta] = useState(12); // minutes
  const [currentStreet, setCurrentStreet] = useState('Ramanuja Circle Road');
  const [isDark, setIsDark] = useState(false);

  // Volunteer status descriptions
  const getStatusText = () => {
    switch (volunteerStatus) {
      case 'ASSIGNED': return 'Volunteer Assigned (Preparing)';
      case 'ON_THE_WAY': return 'Volunteer on the way to Pickup';
      case 'ARRIVED': return 'Volunteer arrived at Hotel';
      case 'FOOD_PICKED_UP': return 'Food Picked Up (In Transit)';
      case 'DELIVERING': return 'Delivering to Destination';
      case 'DELIVERED': return 'Delivered successfully!';
      default: return 'Awaiting volunteer';
    }
  };

  useEffect(() => {
    // Theme detector
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Simulate progress updates for ETA/Street info
    if (['ON_THE_WAY', 'FOOD_PICKED_UP', 'DELIVERING'].includes(volunteerStatus)) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 0.05;
          if (next >= 1) {
            clearInterval(interval);
            return 1;
          }
          setEta(Math.max(1, Math.round((1 - next) * 15)));
          
          if (next < 0.3) setCurrentStreet('Tirumala Bypass Road');
          else if (next < 0.6) setCurrentStreet('Alipiri bypass highway');
          else if (next < 0.8) setCurrentStreet('SV University Road');
          else setCurrentStreet('RUIA Hospital Entrance Way');
          
          return next;
        });
      }, 4000);

      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    } else if (volunteerStatus === 'DELIVERED') {
      setProgress(1);
      setEta(0);
      setCurrentStreet('Arrived at SVIMS/RUIA Hospital');
    }
    return () => observer.disconnect();
  }, [volunteerStatus]);

  // Leaflet Map Initialization
  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;

    // Get coordinates
    const pickup = getCoords(pickupAddress, false);
    const dest = getCoords(destAddress, true);

    // Initialize map
    const map = L.map('leaflet-map-tracker', {
      center: [13.6288, 79.4192], // Tirupati Center
      zoom: 13,
      zoomControl: false,
    });

    // Add zoom controls
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Theme-based openstreetmap tiles
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Create markers
    const hotelIcon = L.divIcon({
      html: `<div class="bg-emerald-600 border-2 border-white text-white p-1 rounded-full flex items-center justify-center text-[14px] shadow-lg" style="width:28px;height:28px;">🏨</div>`,
      className: 'custom-marker',
      iconSize: [28, 28]
    });

    const ngoIcon = L.divIcon({
      html: `<div class="bg-rose-600 border-2 border-white text-white p-1 rounded-full flex items-center justify-center text-[14px] shadow-lg" style="width:28px;height:28px;">🏥</div>`,
      className: 'custom-marker',
      iconSize: [28, 28]
    });

    L.marker(pickup, { icon: hotelIcon }).addTo(map).bindPopup(`<b>Pickup Location</b><br>${pickupAddress}`);
    L.marker(dest, { icon: ngoIcon }).addTo(map).bindPopup(`<b>Delivery Destination</b><br>${destAddress}`);

    // Draw routing line
    const pathCoords = [pickup, dest];
    const polyline = L.polyline(pathCoords, {
      color: '#10b981', // neon emerald line
      weight: 5,
      opacity: 0.8,
      dashArray: '8 6'
    }).addTo(map);

    // Set volunteer rider icon
    if (['ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'FOOD_PICKED_UP', 'DELIVERING'].includes(volunteerStatus)) {
      const riderIcon = L.divIcon({
        html: `<div class="bg-blue-600 border-2 border-white text-white p-1.5 rounded-full flex items-center justify-center text-[14px] shadow-lg animate-bounce" style="width:28px;height:28px;">🚴</div>`,
        className: 'custom-marker',
        iconSize: [28, 28]
      });

      const riderLat = (volunteerLat !== undefined && volunteerLat !== null) ? volunteerLat : (pickup[0] + progress * (dest[0] - pickup[0]));
      const riderLng = (volunteerLng !== undefined && volunteerLng !== null) ? volunteerLng : (pickup[1] + progress * (dest[1] - pickup[1]));
      
      L.marker([riderLat, riderLng], { icon: riderIcon }).addTo(map).bindPopup(`<b>${volunteerName}</b><br>${getStatusText()}`);
    }

    // Zoom map fit bounds
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    return () => {
      map.remove();
    };
  }, [isDark, pickupAddress, destAddress, volunteerStatus, progress, volunteerName, volunteerLat, volunteerLng]);

  return (
    <div className="relative w-full h-[400px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Map Target Container */}
      <div id="leaflet-map-tracker" className="w-full h-full z-0" />

      {/* Radar sweeping scan lines (Visual Wow Effect) */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none animate-pulse-subtle z-10" />

      {/* Map Control HUD overlays */}
      <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 text-white rounded-xl p-3 max-w-[280px] backdrop-blur-md shadow-lg flex flex-col gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold tracking-wide uppercase text-slate-400">Live Delivery Tracking</span>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white truncate">{getStatusText()}</h4>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Current: {currentStreet}</p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-slate-950/80 border border-slate-800 text-white rounded-xl p-3 backdrop-blur-md shadow-lg flex items-center gap-4 z-10">
        {volunteerStatus !== 'DELIVERED' ? (
          <>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-emerald-400" />
              <div>
                <p className="text-[9px] text-slate-400 leading-none uppercase font-semibold">Est. Arrival</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{eta} Mins</p>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-blue-400 rotate-45" />
              <div>
                <p className="text-[9px] text-slate-400 leading-none uppercase font-semibold">Optimized Path</p>
                <p className="text-sm font-bold text-blue-400 mt-0.5">Shortest Route</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <ShieldCheck size={16} />
            <span>Delivery Complete & Verified</span>
          </div>
        )}
      </div>

      {/* Fuel-saving routing details overlay tip */}
      <div className="absolute bottom-4 left-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-lg p-2 text-[10px] backdrop-blur-md shadow z-10 max-w-[200px] flex items-center gap-1.5 font-medium">
        <HelpCircle size={14} className="text-emerald-400 flex-shrink-0" />
        <span>Fuel Saving Tip: Routing via Bypass highway saves 0.3L fuel!</span>
      </div>
    </div>
  );
};
