import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Map3D from '../components/Map3D.jsx';

const ExplorerPage = () => {
  const navigate = useNavigate();
  const [rivers, setRivers] = useState([]);
  const [selectedRiver, setSelectedRiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Map controls states
  const [view3d, setView3d] = useState(true);
  const [activeTab, setActiveTab] = useState('layers'); // 'layers' | 'stats' | 'legend'
  const [mapLayers, setMapLayers] = useState({
    terrain: true,
    imagery: 'satellite'
  });

  useEffect(() => {
    const fetchRivers = async () => {
      try {
        const response = await axios.get('/api/rivers');
        setRivers(response.data);
        if (response.data.length > 0) {
          // Find Nilphamari default or use the first river
          const defaultRiver = response.data.find(r => r.name.toLowerCase().includes('nilphamari')) || response.data[0];
          setSelectedRiver(defaultRiver);
        }
      } catch (err) {
        console.error('Error fetching rivers list:', err);
        setError('Failed to load river profiles. Please ensure you are logged in.');
      } finally {
        setLoading(false);
      }
    };

    fetchRivers();
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] pt-16 overflow-hidden bg-background">
      
      {/* Side Navigation Control Dashboard (320px) */}
      <aside className="w-[320px] shrink-0 h-full flex flex-col p-md bg-surface-container/60 backdrop-blur-xl border-r border-white/10 shadow-[0_0_20px_rgba(0,8,20,0.4)] z-10 overflow-y-auto">
        <div className="mb-lg">
          <h2 className="font-headline-md text-headline-md text-primary font-bold">Explorer Terminal</h2>
          <p className="font-data-mono text-data-mono text-secondary text-xs uppercase tracking-widest mt-xs">Real-time Data Stream</p>
        </div>

        {/* Tab Selector buttons */}
        <div className="grid grid-cols-3 gap-xs mb-md bg-white/5 p-xs rounded-lg border border-white/5">
          <button 
            onClick={() => setActiveTab('layers')}
            className={`py-xs text-xs font-label-sm rounded transition-all cursor-pointer ${
              activeTab === 'layers' 
                ? 'bg-primary text-on-primary-fixed shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Layers
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`py-xs text-xs font-label-sm rounded transition-all cursor-pointer ${
              activeTab === 'stats' 
                ? 'bg-primary text-on-primary-fixed shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Telemetry
          </button>
          <button 
            onClick={() => setActiveTab('legend')}
            className={`py-xs text-xs font-label-sm rounded transition-all cursor-pointer ${
              activeTab === 'legend' 
                ? 'bg-primary text-on-primary-fixed shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Legend
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 space-y-md">
          {activeTab === 'layers' && (
            <div className="space-y-sm">
              <span className="font-data-mono text-data-mono text-xs text-primary/70 uppercase">Layer Configuration</span>
              
              {/* Terrain Toggle */}
              <button 
                onClick={() => setMapLayers(prev => ({ ...prev, terrain: !prev.terrain }))}
                className={`w-full flex items-center justify-between p-sm rounded-lg border transition-all cursor-pointer ${
                  mapLayers.terrain 
                    ? 'bg-secondary-container/30 border-secondary text-secondary' 
                    : 'bg-white/5 border-white/10 text-on-surface-variant hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined">terrain</span>
                  <span className="font-label-sm text-label-sm">3D Terrain Volumetrics</span>
                </div>
                <span className="material-symbols-outlined text-[18px]">
                  {mapLayers.terrain ? 'toggle_on' : 'toggle_off'}
                </span>
              </button>

              {/* View Mode: 2D Google Map / 3D Google Earth */}
              <div className="space-y-xs">
                <span className="font-data-mono text-data-mono text-[10px] text-primary/70 uppercase">Visualization Mode</span>
                <div className="grid grid-cols-2 gap-xs bg-white/5 p-xs rounded-lg border border-white/5">
                  <button 
                    onClick={() => setView3d(false)}
                    className={`py-xs text-[11px] font-label-sm rounded transition-all cursor-pointer flex items-center justify-center gap-xs ${
                      !view3d 
                        ? 'bg-secondary text-on-secondary shadow-sm font-bold' 
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">map</span>
                    Google Map (2D)
                  </button>
                  <button 
                    onClick={() => setView3d(true)}
                    className={`py-xs text-[11px] font-label-sm rounded transition-all cursor-pointer flex items-center justify-center gap-xs ${
                      view3d 
                        ? 'bg-primary text-on-primary-fixed shadow-sm font-bold' 
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">public</span>
                    Google Earth (3D)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && selectedRiver && (
            <div className="space-y-sm bg-white/5 p-sm rounded-lg border border-white/5">
              <span className="font-data-mono text-data-mono text-xs text-secondary uppercase block mb-xs">Hydrology Sheet</span>
              <div className="space-y-xs">
                <div className="flex justify-between border-b border-white/5 pb-xs">
                  <span className="text-xs text-on-surface-variant">Active Target:</span>
                  <span className="text-xs font-bold text-on-surface">{selectedRiver.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-xs">
                  <span className="text-xs text-on-surface-variant">Telemetry Length:</span>
                  <span className="text-xs font-data-mono text-primary font-bold">{selectedRiver.length_km} km</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-xs">
                  <span className="text-xs text-on-surface-variant">Average Depth:</span>
                  <span className="text-xs font-data-mono text-primary font-bold">{selectedRiver.average_depth_m} m</span>
                </div>
                <div className="flex justify-between py-xs">
                  <span className="text-xs text-on-surface-variant">Discharge Rate:</span>
                  <span className="text-xs font-data-mono text-secondary font-bold">{selectedRiver.discharge_m3s} m³/s</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legend' && (
            <div className="space-y-sm bg-white/5 p-sm rounded-lg border border-white/5">
              <span className="font-data-mono text-data-mono text-xs text-tertiary uppercase block mb-xs">Map Symbology</span>
              <div className="space-y-sm">
                <div className="flex items-center gap-sm">
                  <div className="w-6 h-1 bg-primary rounded-full" />
                  <span className="text-xs text-on-surface-variant">Primary Active Waterway</span>
                </div>
                <div className="flex items-center gap-sm">
                  <div className="w-6 h-1 bg-secondary rounded-full" />
                  <span className="text-xs text-on-surface-variant">Tributaries & Secondary Channels</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary scale-75">location_on</span>
                  <span className="text-xs text-on-surface-variant">Telemetry Survey Stations</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* River Selector Terminal */}
        <div className="mt-md border-t border-white/10 pt-md">
          <span className="font-data-mono text-data-mono text-xs text-primary/70 uppercase block mb-sm">Select Waterway Target</span>
          
          {loading ? (
            <div className="py-md text-center text-xs text-on-surface-variant animate-pulse">Loading water sheets...</div>
          ) : error ? (
            <div className="py-md text-center text-xs text-red-400">{error}</div>
          ) : (
            <div className="space-y-xs max-h-[30vh] overflow-y-auto pr-xs">
              {rivers.map((river) => (
                <button
                  key={river.id}
                  onClick={() => setSelectedRiver(river)}
                  className={`w-full text-left px-sm py-sm rounded-lg transition-all border cursor-pointer ${
                    selectedRiver?.id === river.id
                      ? 'bg-primary-container/20 border-primary text-primary font-bold shadow-sm'
                      : 'bg-white/5 border-white/5 text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm">{river.name}</span>
                    <span className="text-[10px] bg-white/10 px-xs rounded font-data-mono font-normal">
                      {river.length_km}km
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Nav Data sheet shortcut */}
        {selectedRiver && (
          <button 
            onClick={() => navigate(`/river/${selectedRiver.id}`)}
            className="mt-auto btn-3d-primary w-full py-sm rounded-lg font-label-sm text-on-primary-container font-bold flex items-center justify-center gap-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">list_alt</span>
            View River Data Sheet
          </button>
        )}
      </aside>

      {/* Main Full-Screen Map Container */}
      <main className="flex-1 h-full relative">
        <Map3D 
          river={selectedRiver} 
          view3d={view3d} 
          layers={mapLayers} 
        />

        {/* Floating Glass Overlay (Top Left inside map) */}
        {selectedRiver && (
          <div className="absolute top-md left-md z-20 glass-panel p-sm rounded-lg pointer-events-none max-w-sm hidden sm:block border border-white/10">
            <span className="font-data-mono text-data-mono text-[10px] text-secondary uppercase tracking-wider block mb-xs">Active Target Coordinates</span>
            <h3 className="font-headline-md text-sm font-bold text-on-surface">{selectedRiver.name} ({selectedRiver.bangla_name})</h3>
            <p className="text-xs text-on-surface-variant mt-xs line-clamp-2">{selectedRiver.description}</p>
            <div className="flex gap-md mt-sm border-t border-white/5 pt-xs">
              <div>
                <span className="text-[9px] text-on-surface-variant uppercase block">Latitude</span>
                <span className="font-data-mono text-xs text-primary">{selectedRiver.lat.toFixed(4)}° N</span>
              </div>
              <div>
                <span className="text-[9px] text-on-surface-variant uppercase block">Longitude</span>
                <span className="font-data-mono text-xs text-primary">{selectedRiver.lng.toFixed(4)}° E</span>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

export default ExplorerPage;
