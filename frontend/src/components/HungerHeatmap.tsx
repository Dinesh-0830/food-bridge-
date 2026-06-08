import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader2, Flame, MapPin } from 'lucide-react';

export const HungerHeatmap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [areaFilter, setAreaFilter] = useState('All');
  const [foodFilter, setFoodFilter] = useState('All');

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;

    setLoading(true);

    const initMap = async () => {
      try {
        const res = await api.get('/analytics/heatmap');
        const heatData = res.data.heatmap; // [[lat, lng, intensity], ...]

        // Filter coords based on filters
        // Simulated filters for demo: if Renigunta only include renigunta, etc.
        let filteredCoords = [...heatData];
        if (areaFilter === 'Railway Station') {
          filteredCoords = heatData.filter((c: any) => c[0] === 13.6280 && c[1] === 79.4160);
        } else if (areaFilter === 'Ramanuja Circle') {
          filteredCoords = heatData.filter((c: any) => c[0] === 13.6231 && c[1] === 79.4292);
        }

        const map = L.map('leaflet-hunger-heatmap', {
          center: [13.6288, 79.4192], // Tirupati Center
          zoom: 13,
          zoomControl: false
        });

        L.control.zoom({ position: 'bottomleft' }).addTo(map);

        const tileUrl = isDark
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(tileUrl, {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Draw heat layer using leaflet.heat plugin
        if (L.heatLayer) {
          L.heatLayer(filteredCoords, {
            radius: 35,
            blur: 15,
            maxZoom: 10,
            gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
          }).addTo(map);
        }

        // Add pins for highlights
        const stationMarker = L.divIcon({
          html: `<div class="bg-rose-600/20 text-rose-500 border border-rose-500/50 p-1.5 rounded-xl font-extrabold text-[10px] shadow-lg whitespace-nowrap">🚨 Hotspot: Railway Stn</div>`,
          className: 'custom-div-icon',
          iconSize: [110, 24]
        });
        L.marker([13.6280, 79.4160], { icon: stationMarker }).addTo(map);

        const ramanujaMarker = L.divIcon({
          html: `<div class="bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 p-1.5 rounded-xl font-extrabold text-[10px] shadow-lg whitespace-nowrap">🍲 Supply Hub: Ramanuja Circle</div>`,
          className: 'custom-div-icon',
          iconSize: [160, 24]
        });
        L.marker([13.6231, 79.4292], { icon: ramanujaMarker }).addTo(map);

        setLoading(false);

        return map;
      } catch (err) {
        console.error('Error loading heatmap data', err);
        setLoading(false);
        return null;
      }
    };

    let mapInstance: any = null;
    initMap().then((m) => {
      mapInstance = m;
    });

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [isDark, areaFilter, foodFilter]);

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex flex-col gap-6 relative shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-md font-extrabold flex items-center gap-1.5">
            <Flame className="text-rose-500 animate-pulse" size={20} />
            Tirupati Hunger & Demand Heatmap
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time localized demand hot-spots vs donation supply zones near Tirupati.</p>
        </div>

        {/* Filters HUD */}
        <div className="flex items-center gap-3 text-xs">
          <select 
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none font-semibold text-slate-600 dark:text-slate-300"
          >
            <option value="All">All Tirupati Areas</option>
            <option value="Railway Station">Railway Station (Hotspot)</option>
            <option value="Ramanuja Circle">Ramanuja Circle (Donations)</option>
          </select>

          <select 
            value={foodFilter}
            onChange={(e) => setFoodFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none font-semibold text-slate-600 dark:text-slate-300"
          >
            <option value="All">All Food Types</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
          </select>
        </div>
      </div>

      <div className="relative w-full h-[450px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
        <div id="leaflet-hunger-heatmap" className="w-full h-full z-0" />

        {loading && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3 z-10">
            <Loader2 className="animate-spin text-rose-500" size={32} />
            <p className="text-xs text-slate-400 font-bold">Generating hunger index heatmap...</p>
          </div>
        )}

        {/* Legend overlays */}
        <div className="absolute bottom-4 right-4 bg-slate-950/85 border border-slate-800 text-white rounded-xl p-3 backdrop-blur-md shadow-lg flex flex-col gap-2 z-10 text-[10px] font-semibold">
          <p className="text-slate-400 uppercase tracking-wider text-[9px] mb-1 font-extrabold">Heatmap Legend</p>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-red-600 border border-red-500" />
            <span>High Hunger/Demand Spot (🚨 Red)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-600 border border-emerald-500" />
            <span>High Donation Supply Zone (🍲 Green)</span>
          </div>
        </div>

        {/* Active tracking notes HUD */}
        <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-800 text-white rounded-xl p-3 max-w-[280px] backdrop-blur-md shadow-lg flex items-center gap-2 z-10 text-[10px] font-medium leading-relaxed">
          <MapPin size={16} className="text-rose-500 animate-bounce flex-shrink-0" />
          <span><b>Demand Notice:</b> High hunger index reported at Renigunta Road and Tirupati Railway Station shelter camps tonight.</span>
        </div>
      </div>
    </div>
  );
};
