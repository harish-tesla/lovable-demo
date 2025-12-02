import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- STYLES ---
const styles = `
/* RESET & BASICS */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #e0e0e0; height: 100vh; overflow: hidden; transition: background-color 0.2s; }

/* LAYOUT */
.app-container { display: flex; height: 100vh; width: 100vw; position: relative; z-index: 1; }

/* ADMIN BUTTON STYLES */
.admin-block { display: flex; justify-content: flex-end; margin-bottom: 15px; }
.admin-btn {
  background: #1f2937; color: #ef4444; border: 1px solid #ef4444;
  padding: 8px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;
  transition: all 0.3s; letter-spacing: 1px; text-transform: uppercase; font-size: 12px;
}
.admin-btn:hover { background: #ef4444; color: white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }

/* USER HEADER STYLES */
.user-header {
  background: #111827;
  border-bottom: 1px solid #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6; 
  font-weight: 900;
  letter-spacing: 2px;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 20px;
  border-radius: 8px;
}

/* CRITICAL ALERT ANIMATION */
.critical-alert-mode { animation: urgent-flash 0.5s infinite alternate; }
@keyframes urgent-flash {
  0% { box-shadow: inset 0 0 0 0 transparent; filter: brightness(1); background-color: #2a0a0a; }
  100% { box-shadow: inset 0 0 100px 50px red; filter: brightness(1.5); background-color: #500000; }
}

/* GLOBAL ALERT ANIMATION */
.global-alert-mode .navbar { border-bottom: 2px solid #f59e0b; }

/* SIDEBAR */
.sidebar { width: 240px; background-color: #05070a; border-right: 1px solid #1f2937; display: flex; flex-direction: column; padding: 20px; }
.brand { color: #00d4ff; font-size: 24px; font-weight: bold; margin-bottom: 40px; letter-spacing: 2px; text-shadow: 0 0 10px rgba(0, 212, 255, 0.5); }
.menu-btn { background: transparent; border: none; color: #8b9bb4; text-align: left; padding: 15px; font-size: 16px; cursor: pointer; border-radius: 8px; margin-bottom: 5px; transition: all 0.3s; }
.menu-btn:hover, .menu-btn.active { background-color: #111827; color: #00d4ff; border-left: 3px solid #00d4ff; }

/* MAIN CONTENT */
.main-content { flex: 1; display: flex; flex-direction: column; overflow-y: auto; position: relative; }

/* NAVBAR */
.navbar { height: 70px; background-color: #0b0f19; border-bottom: 1px solid #1f2937; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; transition: all 0.3s; }
.user-welcome { font-size: 18px; font-weight: 500; }
.alert-btn { background-color: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); animation: pulse 2s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

/* DASHBOARD GRID & COMMON */
.dashboard-view { padding: 0; display: flex; flex-direction: column; gap: 30px; min-height: 100%; }
.stats-container { display: flex; gap: 20px; padding: 20px 30px 0 30px; }
.card { background-color: #111827; padding: 20px; border-radius: 10px; border: 1px solid #1f2937; flex: 1; }

/* DRONE GROUP LAYOUT (DASHBOARD) */
.drones-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 0 30px 30px 30px; }
.drone-group { 
  border: 2px solid #00d4ff; 
  border-radius: 8px; 
  overflow: hidden; 
  background: #05070a;
}
.drone-header {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  padding: 8px 15px;
  font-weight: bold;
  font-size: 14px;
  display: flex; justify-content: space-between; align-items: center;
}
.drone-status-light { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 5px #10b981; }

.drone-feeds-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1px; 
  background: rgba(0, 212, 255, 0.3); 
  border-top: 1px solid rgba(0, 212, 255, 0.3);
}

/* INDIVIDUAL CAMERA FEED (IN DASHBOARD) */
.grid-sector { 
  height: 140px; 
  background-color: #000; 
  display: flex; flex-direction: column; position: relative; cursor: pointer; overflow: hidden; 
}
.grid-sector:hover { opacity: 0.9; }

.grid-sector.low .density-badge { border-left-color: #10b981; }
.grid-sector.medium .density-badge { border-left-color: #f97316; }
.grid-sector.high .density-badge { border-left-color: #ef4444; }
.grid-sector.current-location { box-shadow: inset 0 0 20px rgba(0, 212, 255, 0.6); border: 2px solid #00d4ff; }

/* CAMERA OVERLAYS */
.cam-overlay-top { position: absolute; top: 5px; left: 5px; right: 5px; display: flex; justify-content: space-between; z-index: 5; pointer-events: none; }
.cam-id { background: rgba(0,0,0,0.7); color: #fff; padding: 2px 4px; font-size: 9px; font-family: monospace; border-radius: 2px; }
.cam-rec { display: flex; align-items: center; gap: 4px; color: red; font-weight: bold; font-size: 9px; animation: blink 1s infinite; }
.cam-overlay-bottom { position: absolute; bottom: 5px; left: 5px; z-index: 5; pointer-events: none; }
.density-badge { background: rgba(0,0,0,0.7); color: #fff; padding: 2px 5px; font-size: 10px; font-weight: bold; border-left: 3px solid white; }
.scanlines { position: absolute; inset: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%; pointer-events: none; z-index: 4; }

/* SIMULATED DOTS & MARKERS */
.sim-feed { position: absolute; inset: 0; background: #111; overflow: hidden; }
.sim-dot { position: absolute; width: 3px; height: 3px; background: rgba(255,255,255,0.7); border-radius: 50%; transition: all 2s ease-in-out; }
.user-marker { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 212, 255, 0.3); border: 2px solid #00d4ff; width: 30px; height: 30px; border-radius: 50%; z-index: 10; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; animation: pulse-radar 2s infinite; }
@keyframes pulse-radar { 0% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.7); } 70% { box-shadow: 0 0 0 20px rgba(0, 212, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(212, 255, 0, 0); } }

/* VENUE MAP CONTAINER */
.venue-map-wrapper { 
  position: relative; 
  width: 100%; 
  max-width: 800px; 
  aspect-ratio: 4/3; 
  margin: 0 auto; 
  background: #1e293b; 
  border: 4px solid #374151; 
  border-radius: 12px; 
  overflow: hidden; 
  background-image: url('/venue_map.jpg');
  background-size: cover;
  background-position: center;
  box-shadow: 0 0 30px rgba(0,0,0,0.5); 
}

/* HEATMAP STYLES */
.heatmap-overlay {
  position: absolute; inset: 0;
  display: grid; grid-template-columns: repeat(4, 1fr);
  width: 100%; height: 100%;
  filter: blur(40px); /* Blur for heat effect */
  opacity: 0.6;
  z-index: 1;
}
.heat-cell { width: 100%; height: 100%; transition: background-color 1s ease-in-out; }

/* DRONE LABELS ON HEATMAP */
.heatmap-drone-labels {
  position: absolute; inset: 0; z-index: 3; pointer-events: none;
}
.drone-map-label {
  position: absolute;
  color: #00d4ff; font-weight: 900; font-size: 14px;
  text-shadow: 0 0 5px #000;
  border: 1px solid #00d4ff;
  background: rgba(0,0,0,0.3);
  padding: 4px 8px; border-radius: 4px;
  transform: translate(-50%, -50%);
}

.heatmap-user-marker {
  position: absolute; z-index: 10;
  transform: translate(-50%, -50%);
  font-size: 40px;
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.8));
  animation: bounce 1s infinite;
}

/* NAV GRID ON MAP */
.nav-grid { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 1px; 
  position: relative; 
  z-index: 2; 
  height: 100%; 
}
.nav-cell { 
  height: 100%; 
  background: rgba(0, 0, 0, 0.1); 
  border: 1px dashed rgba(255,255,255,0.15); 
  display: flex; flex-direction: column; align-items: center; justify-content: center; 
  font-weight: bold; cursor: pointer; position: relative; transition: all 0.3s; 
  color: white; text-shadow: 0 0 4px black;
}
.nav-cell.low { background: rgba(16, 185, 129, 0.3); border-color: #10b981; }
.nav-cell.medium { background: rgba(249, 115, 22, 0.3); border-color: #f97316; }
.nav-cell.high { background: rgba(239, 68, 68, 0.5); border-color: #ef4444; }
.nav-cell.path { background: rgba(59, 130, 246, 0.4); border-color: #3b82f6; box-shadow: inset 0 0 20px #3b82f6; animation: flow 1s infinite alternate; }
.nav-cell.target { border: 3px solid white; background: rgba(255, 255, 255, 0.2); }
.nav-cell.user { border: 3px solid #00d4ff; box-shadow: 0 0 15px #00d4ff; z-index: 5; }
.nav-cell.friend { border: 3px solid #f472b6; background: rgba(244, 114, 182, 0.3); z-index: 6; }
.nav-arrow { font-size: 32px; color: #fff; text-shadow: 0 0 10px #3b82f6; animation: arrow-bounce 0.8s infinite alternate; }

@keyframes arrow-bounce { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.3); opacity: 1; } }
@keyframes flow { 0% { transform: scale(1); box-shadow: inset 0 0 5px #3b82f6; } 100% { transform: scale(1.02); box-shadow: inset 0 0 20px #3b82f6; } }

/* NAVIGATION SUGGESTIONS */
.suggestions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; margin-top: 20px; }
.nav-card {
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px; border-radius: 12px; text-align: center; cursor: pointer;
  transition: all 0.3s; display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.nav-card:hover {
  background: rgba(0, 212, 255, 0.15); border-color: #00d4ff;
  transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0, 212, 255, 0.2);
}
.nav-icon { font-size: 24px; }
.nav-label { font-size: 13px; color: #ccc; font-weight: 600; }

/* FRIEND CONNECT STYLES */
.friends-layout { display: flex; gap: 30px; flex-wrap: wrap; }
.qr-card { background: #111827; padding: 30px; border-radius: 12px; border: 1px solid #374151; text-align: center; flex: 1; min-width: 300px; display: flex; flex-direction: column; align-items: center; }
.qr-box { width: 200px; height: 200px; background: white; margin: 20px 0; padding: 10px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: black; font-weight: bold; font-size: 14px; position: relative; overflow: hidden; }
.qr-box::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: #ef4444; animation: scan 2s infinite; opacity: 0.5; }
@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
.friends-list { flex: 1.5; background: #1f2937; padding: 20px; border-radius: 12px; border: 1px solid #374151; min-width: 300px; }
.friend-item { display: flex; align-items: center; justify-content: space-between; background: #111; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #333; }
.friend-avatar { width: 40px; height: 40px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
.friend-info { flex: 1; margin-left: 15px; }
.friend-status { font-size: 12px; color: #10b981; }
.track-btn { background: transparent; border: 1px solid #3b82f6; color: #3b82f6; padding: 5px 15px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
.track-btn:hover { background: #3b82f6; color: white; }
.every1-btn { margin-top: 20px; width: 100%; text-align: center; background: #8b5cf6; border: 1px solid #7c3aed; color: white; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 0 10px rgba(139, 92, 246, 0.3); transition: all 0.3s; }
.every1-btn:hover { background: #7c3aed; box-shadow: 0 0 20px rgba(139, 92, 246, 0.6); transform: translateY(-2px); }

/* MODALS */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: #111827; padding: 20px; border-radius: 10px; width: 90%; height: 90%; display: flex; flex-direction: column; border: 1px solid #374151; position: relative; }
.close-btn { position: absolute; top: 20px; right: 20px; background: #ef4444; border: none; color: white; padding: 8px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; z-index: 10; }

/* EMERGENCY FOOTER */
.emergency-footer { margin-top: auto; padding: 20px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; backdrop-filter: blur(10px); box-shadow: 0 0 15px rgba(239, 68, 68, 0.1); animation: urgent-breathe 4s infinite ease-in-out; }
.emergency-grid { display: flex; gap: 15px; flex-wrap: wrap; }
.em-btn { flex: 1; min-width: 140px; padding: 14px; background: linear-gradient(145deg, #1f2937, #111827); border: 1px solid rgba(239, 68, 68, 0.5); border-radius: 8px; color: #fca5a5; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.em-btn:hover { background: #ef4444; color: white; box-shadow: 0 0 25px rgba(239, 68, 68, 0.6); transform: translateY(-3px); }
@keyframes urgent-breathe { 0% { box-shadow: 0 0 5px rgba(239,68,68,0.1); } 50% { box-shadow: 0 0 20px rgba(239,68,68,0.25); } 100% { box-shadow: 0 0 5px rgba(239,68,68,0.1); } }

/* ALERT BANNERS */
.global-alert-banner { position: absolute; top: 0; left: 0; width: 100%; background: #f59e0b; color: #000; padding: 12px 20px; text-align: center; font-weight: bold; z-index: 2000; animation: slideDown 0.5s; }
.local-evacuation-overlay { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); background: rgba(239, 68, 68, 0.95); color: white; padding: 20px 40px; border-radius: 12px; text-align: center; border: 2px solid #ff0000; z-index: 2001; animation: pulse-alert 1s infinite; }
.success-banner { background: linear-gradient(45deg, #065f46, #10b981); color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.5); animation: slideDown 0.5s; display: flex; align-items: center; gap: 15px; border: 1px solid #34d399; }
.success-icon { font-size: 24px; background: white; color: #065f46; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
@keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
@keyframes pulse-alert { 0% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.02); } 100% { transform: translateX(-50%) scale(1); } }

/* BREAKING MISSING BANNER */
.breaking-missing-banner { background: repeating-linear-gradient(45deg, #000, #000 10px, #f59e0b 10px, #f59e0b 20px); color: white; padding: 5px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.5); animation: slideDown 0.5s; cursor: pointer; }
.breaking-content { background: #111; padding: 15px; display: flex; align-items: center; gap: 20px; border-radius: 4px; }
.breaking-badge { background: #ef4444; color: white; padding: 5px 10px; font-weight: bold; font-size: 12px; border-radius: 4px; animation: blink 1s infinite; }
.breaking-info h3 { margin: 0; font-size: 18px; color: #fbbf24; }
.breaking-info p { margin: 0; font-size: 14px; color: #ccc; }

/* MISSING PERSON CARD STATES */
.missing-card.sighted { border-color: #f59e0b; animation: none; box-shadow: 0 0 15px rgba(245, 158, 11, 0.3); }
.sighted-badge { background: #f59e0b; color: black; padding: 5px; font-weight: bold; text-align: center; margin-bottom: 10px; border-radius: 4px; font-size: 12px; animation: pulse 2s infinite; }

/* REPORT FORM & ALERT LIST */
.report-form { background: rgba(255,255,255,0.05); padding: 25px; border-radius: 16px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.1); }
.form-group { margin-bottom: 15px; }
.form-label { display: block; color: #9ca3af; margin-bottom: 5px; font-size: 14px; }
.form-input { width: 100%; padding: 12px; background: #0b0f19; border: 1px solid #374151; border-radius: 8px; color: white; outline: none; transition: border-color 0.2s; }
.form-input:focus { border-color: #00d4ff; }
.file-upload { border: 2px dashed #374151; padding: 20px; text-align: center; border-radius: 8px; cursor: pointer; color: #9ca3af; transition: all 0.2s; }
.file-upload:hover { border-color: #00d4ff; color: #00d4ff; background: rgba(0, 212, 255, 0.05); }
.contact-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; margin-top: 10px; transition: transform 0.2s; }
.contact-btn:hover { transform: scale(1.02); }
.contact-guardian { background: #3b82f6; color: white; }
.contact-security { background: #ef4444; color: white; }
.contact-verify { background: #10b981; color: white; }
.missing-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px; }
.missing-card { background: #1f2937; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid #374151; transition: transform 0.3s, box-shadow 0.3s; animation: card-pulse 3s infinite alternate; }
.missing-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
@keyframes card-pulse { 0% { border-color: #374151; } 100% { border-color: #fbbf24; box-shadow: 0 0 10px rgba(251, 191, 36, 0.2); } }
.missing-image { width: 100%; height: 200px; background: #333; object-fit: cover; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #555; }
.missing-details { padding: 15px; }
.missing-tag { position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; animation: blink 2s infinite; }
.alerts-container { display: flex; flex-direction: column; gap: 15px; }
.alert-item { background: #1f1212; border-left: 4px solid #ef4444; padding: 15px; border-radius: 8px; }

/* STATIC BLOCK STYLES */
.static-input { width: 100%; background: #000; border: 1px solid #333; color: white; padding: 8px; border-radius: 4px; text-align: center; font-weight: bold; font-size: 16px; }
.static-input:focus { border-color: #00d4ff; outline: none; }

/* LOCATION MODAL */
.location-modal-overlay { position: fixed; inset: 0; background: #000; z-index: 9999; display: flex; align-items: center; justify-content: center; }
.location-card { background: #111827; padding: 40px; border-radius: 16px; text-align: center; border: 1px solid #374151; max-width: 400px; animation: fadeUp 0.8s; }
.loc-icon { font-size: 40px; margin-bottom: 20px; display: inline-block; animation: bounce 1s infinite; }
.allow-btn { background: #00d4ff; color: #000; border: none; padding: 14px 40px; font-size: 16px; font-weight: bold; border-radius: 30px; cursor: pointer; margin-top: 30px; transition: transform 0.2s; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

// --- SIMULATED VIDEO FEED ---
const SimulatedFeed = ({ density }) => {
  const visualCount = Math.min(density, 50);
  const dots = useMemo(() => {
    return Array.from({ length: visualCount }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      animDuration: 2 + Math.random() * 3 + 's',
      xMove: (Math.random() - 0.5) * 20 + 'px',
      yMove: (Math.random() - 0.5) * 20 + 'px'
    }));
  }, [visualCount]);

  return (
    <div className="sim-feed">
      {dots.map(dot => (
        <div key={dot.id} className="sim-dot" style={{ left: dot.left, top: dot.top, animation: `move-${dot.id} ${dot.animDuration} infinite alternate ease-in-out` }} />
      ))}
      <style>
        {dots.map(dot => `
          @keyframes move-${dot.id} { from { transform: translate(0, 0); } to { transform: translate(${dot.xMove}, ${dot.yMove}); } }
        `).join('')}
      </style>
    </div>
  );
};

// --- POINTS OF INTEREST ---
const POIs = [
  { name: "Entrance", gridId: 0, icon: "🚪" },
  { name: "Food Court", gridId: 2, icon: "🍔" },
  { name: "Restrooms", gridId: 5, icon: "🚻" },
  { name: "Main Stage", gridId: 10, icon: "🎤" },
  { name: "Exit A", gridId: 15, icon: "🏃" },
  { name: "Medical", gridId: 8, icon: "🚑" }
];

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [evacuationModalOpen, setEvacuationModalOpen] = useState(false);
  const [friendTrackingModal, setFriendTrackingModal] = useState(null); 
  const [trackAllModalOpen, setTrackAllModalOpen] = useState(false); 
  const [selectedGridData, setSelectedGridData] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [staticGridCounts, setStaticGridCounts] = useState(Array(16).fill(0)); // Added static grid state
  
  // UNIFIED 4x4 GRID STATE
  const [mainGrid, setMainGrid] = useState(Array.from({ length: 16 }, (_, i) => ({
    id: i,
    name: `Sector ${String.fromCharCode(65 + i)}`,
    count: Math.floor(Math.random() * 40),
    density: 'low'
  })));

  // Navigation State
  const [userLocation, setUserLocation] = useState(4); 
  const [path, setPath] = useState([]);
  const [destination, setDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [navWarning, setNavWarning] = useState(null);
  
  // FRIEND CONNECT STATE
  const [friends, setFriends] = useState([]); 
  const [myQR] = useState(`DRISTI-USER-${Math.floor(Math.random()*10000)}`);

  // Missing Persons State
  const [missingPersons, setMissingPersons] = useState([
    { id: 1, name: 'Rahul Kumar', age: 10, lastSeen: 'Food Court', contact: '+91 98765 43210', img: null, status: 'active' },
    { id: 2, name: 'Priya Sharma', age: 6, lastSeen: 'Main Entrance', contact: '+91 99887 76655', img: null, status: 'active' }
  ]);
  const [newReport, setNewReport] = useState({ name: '', age: '', lastSeen: '', contact: '', img: null });
  const [showBreakingMissing, setShowBreakingMissing] = useState(true);
  const [foundSuccessMsg, setFoundSuccessMsg] = useState(null);

  // ALERT STATES
  const [localAlert, setLocalAlert] = useState(false); 
  const [globalAlert, setGlobalAlert] = useState(null); 
  const [alertsList, setAlertsList] = useState([]);
  const [stats, setStats] = useState({ drones: 4, status: 'Online', density: 'Normal' });
  const timerRef = useRef(null);
  const [isSimulationActive, setIsSimulationActive] = useState(true);

  // --- LOCATION PERMISSION HANDLER ---
  const requestLocation = () => {
    // Use genuine browser API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success
          setLocationPermission(true);
          setUserLocation(4); // Mock snap to grid for demo
        },
        (error) => {
          // Error/Deny
          alert("Location access is needed for safety features. Demo mode active.");
          setLocationPermission(true);
          setUserLocation(4);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setLocationPermission(true);
      setUserLocation(4);
    }
  };

  // --- HELPERS ---
  const getDensityClass = (count) => {
    if (count < 15) return 'low';    
    if (count <= 30) return 'medium';
    return 'high';                   
  };

  const getColor = (density) => {
    if (density === 'low') return '#10b981';
    if (density === 'medium') return '#f97316';
    return '#ef4444';
  };

  const getDroneID = (index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    if (row < 2 && col < 2) return 1; 
    if (row < 2 && col >= 2) return 2; 
    if (row >= 2 && col < 2) return 3; 
    return 4; 
  };

  const getNavArrow = (curr, next) => {
    if (next === undefined) return null;
    const diff = next - curr;
    if (diff === 1) return '→';
    if (diff === -1) return '←';
    if (diff === 4) return '↓';
    if (diff === -4) return '↑';
    return null;
  };

  // --- AUDIO ALERT ---
  const playAlertSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      if (type === 'local') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.1);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
      }
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) { console.error(e); }
  };

  // --- DIJKSTRA PATHFINDING ---
  const calculatePath = (startIdx, targetIdx, grid) => {
    const distances = Array(16).fill(Infinity);
    const previous = Array(16).fill(null);
    const unvisited = new Set(Array.from({ length: 16 }, (_, i) => i));
    distances[startIdx] = 0;

    while (unvisited.size > 0) {
      let current = null;
      let minDist = Infinity;
      for (let node of unvisited) {
        if (distances[node] < minDist) { minDist = distances[node]; current = node; }
      }
      if (current === null || current === targetIdx) break; 
      unvisited.delete(current);

      const r = Math.floor(current / 4);
      const c = current % 4;
      const neighbors = [];
      if (r > 0) neighbors.push(current - 4); 
      if (r < 3) neighbors.push(current + 4); 
      if (c > 0) neighbors.push(current - 1); 
      if (c < 3) neighbors.push(current + 1); 

      for (let neighbor of neighbors) {
        if (unvisited.has(neighbor)) {
          let weight = 1;
          if (grid[neighbor].density === 'medium') weight = 5;
          if (grid[neighbor].density === 'high') weight = 50; 
          const alt = distances[current] + weight;
          if (alt < distances[neighbor]) {
            distances[neighbor] = alt;
            previous[neighbor] = current;
          }
        }
      }
    }
    const path = [];
    let u = targetIdx;
    if (previous[u] !== null || u === startIdx) {
      while (u !== null) { path.unshift(u); u = previous[u]; }
    }
    return path;
  };

  // --- SEARCH HANDLER ---
  const handleSearch = (targetId) => {
    const targetCell = mainGrid[targetId];
    if (targetCell.count > 30) {
        setNavWarning(`Caution: Sector ${targetCell.name} has high density (${targetCell.count} people). Proceed with care.`);
        setTimeout(() => setNavWarning(null), 4000);
    } else {
        setNavWarning(null);
    }

    setDestination(targetId);
    const safePath = calculatePath(userLocation, targetId, mainGrid);
    setPath(safePath);
  };

  // --- STATIC GRID HANDLER ---
  const handleStaticChange = (index, value) => {
    setIsSimulationActive(false); // Stop simulation when user edits
    setMainGrid(prev => {
        const newGrid = [...prev];
        const count = parseInt(value, 10) || 0;
        newGrid[index] = {
            ...newGrid[index],
            count: count,
            density: getDensityClass(count)
        };
        
        // Recalculate alert logic instantly for static changes
        const userCell = newGrid[userLocation];
        if (userCell.count > 30) {
          if (!localAlert) {
             setLocalAlert(true);
             playAlertSound('local');
             // No vibrate on edit to avoid annoyance
             
             // Auto-calc safe route
             let nearestGreen = null;
             let minLen = Infinity;
             newGrid.forEach(cell => {
               if (cell.density === 'low') {
                  const p = calculatePath(userLocation, cell.id, newGrid);
                  if (p.length > 0 && p.length < minLen) { minLen = p.length; nearestGreen = cell.id; }
               }
             });
             if (nearestGreen !== null) {
               setDestination(nearestGreen);
               setPath(calculatePath(userLocation, nearestGreen, newGrid));
             }
          }
        } else {
          setLocalAlert(false);
        }

        if (destination !== null) {
           setPath(calculatePath(userLocation, destination, newGrid));
        }

        return newGrid;
    });
  };

  const resumeSimulation = () => {
      setIsSimulationActive(true);
  };

  // --- ADMIN WINDOW HANDLER ---
  const handleAdminAccess = () => {
    const w = window.open('', '_blank', 'width=1000,height=800');
    if (w) {
      w.document.write(`
        <html>
          <head>
            <title>DRISTI ADMIN</title>
            <style>
              body { margin: 0; background: #05070a; color: #e0e0e0; font-family: 'Segoe UI', sans-serif; }
              .container { padding: 40px; text-align: center; }
              h1 { color: #ef4444; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #333; padding-bottom: 20px; }
              .status { margin-top: 20px; color: #10b981; font-weight: bold; }
              .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 40px; text-align: left; }
              .card { background: #111827; padding: 20px; border: 1px solid #374151; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>System Administrator Control</h1>
              <div class="status">● SYSTEM ONLINE - SECURE CONNECTION</div>
              <div class="grid">
                <div class="card"><h3>User Management</h3><p>Active Sessions: 1</p></div>
                <div class="card"><h3>Drone Override</h3><p>All Systems Normal</p></div>
                <div class="card"><h3>Alert Logs</h3><p>No critical failures</p></div>
                <div class="card"><h3>Network</h3><p>Latency: 12ms</p></div>
              </div>
            </div>
          </body>
        </html>
      `);
      w.document.close();
    }
  };

  // --- FRIEND CONNECT FUNCTIONS ---
  const handleScanFriend = () => {
    const names = ["Aditya", "Sneha", "Karan", "Pooja"];
    const name = names[Math.floor(Math.random() * names.length)];
    const newFriend = {
      id: Date.now(),
      name: name,
      location: Math.floor(Math.random() * 16),
      lastUpdate: 'Just now'
    };
    setFriends([...friends, newFriend]);
    alert(`Connected with ${name}!`);
  };

  const handleTrackFriend = (friendId) => {
    setFriendTrackingModal(friendId);
  };

  const renderTrackAllContent = () => {
    let allPaths = new Set();
    friends.forEach(friend => {
      const p = calculatePath(userLocation, friend.location, mainGrid);
      p.forEach(idx => allPaths.add(idx));
    });

    return (
      <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
        <h2 style={{color: '#8b5cf6', textAlign: 'center', marginBottom: '20px'}}>
          Tracking All Connected Friends
        </h2>
        <div className="venue-map-wrapper" style={{maxWidth: '600px', margin: '0 auto', flex: 1}}>
          <div className="nav-grid">
          {mainGrid.map((cell, idx) => {
            const isPath = allPaths.has(idx);
            const isUser = idx === userLocation;
            
            // Check if any friends are in this cell
            const friendsHere = friends.filter(f => f.location === idx);
            const isFriend = friendsHere.length > 0;
            
            return (
              <div 
                key={idx}
                className={`nav-cell ${cell.density} ${isPath ? 'path' : ''} ${isUser ? 'user' : ''} ${isFriend ? 'friend' : ''}`}
                style={isFriend ? {borderColor: '#8b5cf6', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.2)'} : {}}
              >
                {isUser ? '📍 YOU' : 
                 isFriend ? (friendsHere.length > 1 ? `👥 ${friendsHere.length}` : `👤 ${friendsHere[0].name}`) : 
                 cell.count}
              </div>
            );
          })}
          </div>
        </div>
        <div style={{textAlign:'center', marginTop:'20px', color:'#888'}}>
          Paths to {friends.length} friends calculated in real-time.
        </div>
      </div>
    );
  };

  const renderTrackingContent = () => {
    const friend = friends.find(f => f.id === friendTrackingModal);
    if (!friend) return null;

    // Calculate dynamic safe path to friend
    const safePath = calculatePath(userLocation, friend.location, mainGrid);

    return (
      <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
        <h2 style={{color: '#3b82f6', textAlign: 'center', marginBottom: '20px'}}>
          Path to {friend.name}
        </h2>
        <div className="venue-map-wrapper" style={{maxWidth: '600px', margin: '0 auto', flex: 1}}>
          <div className="nav-grid">
          {mainGrid.map((cell, idx) => {
            const isPath = safePath.includes(idx);
            const pathIndex = safePath.indexOf(idx);
            const nextCell = pathIndex > -1 && pathIndex < safePath.length - 1 ? safePath[pathIndex + 1] : undefined;
            const arrow = getNavArrow(idx, nextCell);
            
            const isUser = idx === userLocation;
            const isFriend = idx === friend.location;
            
            return (
              <div 
                key={idx}
                className={`nav-cell ${cell.density} ${isPath ? 'path' : ''} ${isUser ? 'user' : ''} ${isFriend ? 'friend' : ''}`}
              >
                {isUser ? '📍 YOU' : isFriend ? `👤 ${friend.name}` : arrow ? <span className="nav-arrow">{arrow}</span> : cell.count}
              </div>
            );
          })}
          </div>
        </div>
      </div>
    );
  };

  // --- REPORTING LOGIC ---
  const handleReportSubmit = () => {
    if (!newReport.name || !newReport.contact) {
      alert("Please fill in Name and Contact details.");
      return;
    }
    const report = {
      id: Date.now(),
      ...newReport,
      img: newReport.img,
      status: 'active'
    };
    setMissingPersons([report, ...missingPersons]);
    setNewReport({ name: '', age: '', lastSeen: '', contact: '', img: null });
    setShowBreakingMissing(true);
    setTimeout(() => setShowBreakingMissing(false), 10000);
    alert("Report Submitted Successfully. Broadcast initiated.");
  };

  const handleSighting = (id) => {
    setMissingPersons(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'sighted' } : p
    ));
    alert("Sighting Reported! The guardian has been notified.");
  };

  const handleVerifyFound = (person) => {
    setMissingPersons(prev => prev.filter(p => p.id !== person.id));
    setFoundSuccessMsg(`SUCCESS: ${person.name} has been found and reunited!`);
    setActiveTab('Dashboard');
    setTimeout(() => setFoundSuccessMsg(null), 10000);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setNewReport({ ...newReport, img: url });
    }
  };

  // --- LIVE SIMULATION ---
  useEffect(() => {
    if (!locationPermission) return;

    const interval = setInterval(() => {
      setMainGrid(prev => {
        const now = Date.now();
        const isDemoHighAlert = (now % 60000) < 5000; 

        const newGrid = prev.map((sector, idx) => {
          let newCount;
          if (idx === userLocation) {
             newCount = isDemoHighAlert ? 55 : Math.floor(Math.random() * 28); 
          } else {
             const change = Math.floor(Math.random() * 10) - 5;
             newCount = Math.max(0, Math.min(60, sector.count + change));
          }
          return { ...sector, count: newCount, density: getDensityClass(newCount) };
        });

        // Local Alert Check
        const userCell = newGrid[userLocation];
        if (userCell.count > 30) {
          if (!localAlert) {
             setLocalAlert(true);
             playAlertSound('local');
             if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
          }
        } else {
          setLocalAlert(false);
        }
        return newGrid;
      });

      // 2. Update Friends Locations (Simulated Movement)
      setFriends(prevFriends => prevFriends.map(f => ({
        ...f,
        location: (f.location + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0) + 16) % 16
      })));

      // 3. Global Alert (Random)
      if (Math.random() > 0.99) {
        setGlobalAlert("⚠ ATTENTION: BOTTLENECK REPORTED AT GATE A.");
        playAlertSound('global');
        setTimeout(() => setGlobalAlert(null), 8000);
      }

      // Stats
      const totalPeople = mainGrid.reduce((a, c) => a + c.count, 0);
      setStats(prev => ({ ...prev, drones: 4, density: totalPeople > 400 ? 'Critical' : totalPeople > 250 ? 'High' : 'Normal' }));

      // Add to Alert Log
      if (localAlert) {
        setAlertsList(prev => [{id: Date.now(), time: new Date().toLocaleTimeString(), msg: "High Density in your Sector!"}, ...prev.slice(0, 9)]);
      }

    }, 2000); 
    return () => clearInterval(interval);
  }, [locationPermission, destination, userLocation, localAlert, isSimulationActive, mainGrid]); // mainGrid here is safe because we use setMainGrid(prev)

  // --- PRESS HANDLERS ---
  const startPress = (gridData) => { timerRef.current = setTimeout(() => { setSelectedGridData(gridData); setModalOpen(true); }, 600); };
  const endPress = () => clearTimeout(timerRef.current);

  // --- HELPER TO GET DRONE SECTORS ---
  const getDroneSectors = (droneId) => {
     const sectors = [];
     let indices = [];
     if (droneId === 1) indices = [0, 1, 4, 5];
     if (droneId === 2) indices = [2, 3, 6, 7];
     if (droneId === 3) indices = [8, 9, 12, 13];
     if (droneId === 4) indices = [10, 11, 14, 15];

     indices.forEach(i => sectors.push({ ...mainGrid[i], index: i }));
     return sectors;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <>
            {/* TOP BAR (ADMIN BLOCK) */}
            <div className="admin-block" style={{height: '40px', background: '#000', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px'}}>
               <button className="admin-btn" onClick={handleAdminAccess}>
                 Admin Access
               </button>
            </div>

            {/* VIEW HEADING BAR */}
            <div className="user-header" style={{height: '30px', background: '#111827', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#3b82f6'}}>
               User Dashboard
            </div>

            {foundSuccessMsg && (
              <div className="success-banner">
                <div className="success-icon">🎉</div>
                <div>
                  <h3 style={{margin:0, fontSize:'18px'}}>CASE RESOLVED</h3>
                  <p style={{margin:0, fontSize:'14px'}}>{foundSuccessMsg}</p>
                </div>
              </div>
            )}

            {showBreakingMissing && missingPersons.length > 0 && (
              <div className="breaking-missing-banner" onClick={() => setActiveTab('Missing')}>
                <div className="breaking-content">
                  <div className="breaking-badge">REPORTED MISSING</div>
                  <div className="breaking-info">
                    <h3>{missingPersons[0].name}, {missingPersons[0].age} yrs</h3>
                    <p>Last seen at {missingPersons[0].lastSeen}. Tap to help.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="stats-container">
              <div className="card"><h3 style={{color:'#00d4ff'}}>Active Drones</h3><h1>4</h1></div>
              <div className="card"><h3 style={{color:'#34d399'}}>System Status</h3><h1 style={{color:stats.status==='Syncing...'?'#facc15':'#e0e0e0'}}>{stats.status}</h1></div>
              <div className="card"><h3 style={{color:'#f472b6'}}>Crowd Level</h3><h1 style={{color:stats.density==='Critical'?'#ef4444':'#e0e0e0'}}>{stats.density}</h1></div>
            </div>
            
            {/* NEW DRONE GROUP LAYOUT */}
            <div className="drones-container">
              {[1, 2, 3, 4].map(droneId => (
                <div key={droneId} className="drone-group">
                  <div className="drone-header">
                    <span>DRONE-0{droneId}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="cam-rec">● REC</div>
                      <div className="drone-status-light"></div>
                    </div>
                  </div>
                  <div className="drone-feeds-2x2">
                    {getDroneSectors(droneId).map((sector) => (
                      <div key={sector.id} 
                           className={`grid-sector ${sector.density} ${sector.index===userLocation?'current-location':''}`}
                           onMouseDown={() => startPress(sector)} onMouseUp={endPress} onTouchStart={() => startPress(sector)} onTouchEnd={endPress}>
                        <SimulatedFeed density={sector.count} /><div className="scanlines"></div>
                        <div className="cam-overlay-top">
                           {/* REMOVED SEC-XX and REC */}
                        </div>
                        {sector.index===userLocation && <div className="user-marker">📍</div>}
                        <div className="cam-overlay-bottom"><div className="density-badge" style={{borderLeftColor:getColor(sector.density)}}>{sector.count}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case 'Heatmap':
        return (
          <div className="venue-map-wrapper">
            <div className="heatmap-overlay">
              {mainGrid.map((cell, idx) => (
                <div 
                  key={idx} 
                  className="heat-cell"
                  style={{
                    backgroundColor: 
                      cell.density === 'low' ? 'rgba(16, 185, 129, 0.4)' :
                      cell.density === 'medium' ? 'rgba(249, 115, 22, 0.6)' :
                      'rgba(239, 68, 68, 0.8)'
                  }}
                />
              ))}
            </div>
            {/* DRONE LABELS OVERLAY */}
            <div className="heatmap-drone-labels">
               <div className="drone-map-label" style={{top: '25%', left: '25%'}}>DRONE-01</div>
               <div className="drone-map-label" style={{top: '25%', left: '75%'}}>DRONE-02</div>
               <div className="drone-map-label" style={{top: '75%', left: '25%'}}>DRONE-03</div>
               <div className="drone-map-label" style={{top: '75%', left: '75%'}}>DRONE-04</div>
            </div>
            <div className="heatmap-user-marker" style={{
              top: `${(Math.floor(userLocation / 4) * 25) + 12.5}%`,
              left: `${(userLocation % 4 * 25) + 12.5}%`
            }}>📍</div>
          </div>
        );

      case 'Navigation':
        return (
          <div className="nav-container">
            <h2 style={{color: '#3b82f6', marginBottom: '20px'}}>Safe Pathfinding</h2>
            <div className="search-bar-container">
              <input 
                className="search-input" 
                placeholder="Where do you want to go?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* ATTRACTIVE SUGGESTIONS GRID */}
              <div className="suggestions-grid">
                {POIs.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(poi => (
                  <div key={poi.gridId} className="nav-card" onClick={() => handleSearch(poi.gridId)}>
                    <div className="nav-icon">{poi.icon}</div>
                    <div className="nav-label">{poi.name}</div>
                  </div>
                ))}
              </div>
            </div>
            {navWarning && (
              <div style={{background: '#f59e0b', color: 'black', padding: '10px', borderRadius: '8px', marginTop: '10px', fontWeight: 'bold', textAlign: 'center', animation: 'slideDown 0.3s'}}>
                ⚠ {navWarning}
              </div>
            )}
            <p style={{color: localAlert ? '#ef4444' : '#888', fontWeight: localAlert?'bold':'normal'}}>
              {localAlert ? '⚠ DANGER: FOLLOW BLUE PATH TO SAFETY' : 'Click a grid or search to find safest route.'}
            </p>
            <div className="venue-map-wrapper">
              <div className="nav-grid">
              {mainGrid.map((cell, idx) => {
                const isPath = path.includes(idx);
                const pathIndex = path.indexOf(idx);
                const nextCell = pathIndex > -1 && pathIndex < path.length - 1 ? path[pathIndex + 1] : undefined;
                const arrow = getNavArrow(idx, nextCell);

                const isUser = idx === userLocation;
                const isTarget = idx === destination;
                return (
                  <div key={idx} 
                       className={`nav-cell ${cell.density} ${isPath?'path':''} ${isUser?'user':''} ${isTarget?'target':''}`}
                       onClick={() => handleSearch(idx)}>
                    {isUser ? '📍 YOU' : isTarget ? '🏁' : arrow ? <span className="nav-arrow">{arrow}</span> : `${cell.count} ppl`}
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        );

      case 'Missing':
        return (
          <div style={{maxWidth: '1000px'}}>
            <h2 style={{color: '#fbbf24', marginBottom: '20px'}}>Missing Persons Hub</h2>
            <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap'}}>
              
              {/* REPORTING FORM */}
              <div style={{flex: 1, minWidth: '300px'}}>
                <div className="report-form">
                  <h3 style={{color: 'white', marginBottom: '15px'}}>📝 Report Missing Person</h3>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={newReport.name} onChange={e => setNewReport({...newReport, name: e.target.value})} placeholder="e.g. John Doe" />
                  </div>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <div className="form-group" style={{flex: 1}}>
                      <label className="form-label">Age</label>
                      <input className="form-input" value={newReport.age} onChange={e => setNewReport({...newReport, age: e.target.value})} placeholder="10" />
                    </div>
                    <div className="form-group" style={{flex: 1}}>
                      <label className="form-label">Last Location</label>
                      <input className="form-input" value={newReport.lastSeen} onChange={e => setNewReport({...newReport, lastSeen: e.target.value})} placeholder="Gate A" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Guardian Contact</label>
                    <input className="form-input" value={newReport.contact} onChange={e => setNewReport({...newReport, contact: e.target.value})} placeholder="+91 9876543210" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Upload Photo</label>
                    <div className="file-upload">
                      <input type="file" id="file" style={{display:'none'}} onChange={handleFileChange} />
                      <label htmlFor="file" style={{cursor:'pointer'}}>
                        {newReport.img ? '✅ Photo Selected' : '📸 Click to Upload Photo'}
                      </label>
                    </div>
                  </div>
                  <button className="menu-btn active" style={{width: '100%', textAlign: 'center', fontWeight: 'bold'}} onClick={handleReportSubmit}>BROADCAST ALERT</button>
                </div>
              </div>

              {/* ACTIVE ALERTS GRID */}
              <div style={{flex: 2, minWidth: '300px'}}>
                <h3 style={{color: '#ef4444', marginBottom: '15px'}}>🚨 Active Alerts ({missingPersons.length})</h3>
                <div className="missing-grid">
                  {missingPersons.map(p => (
                    <div key={p.id} className={`missing-card ${p.status === 'sighted' ? 'sighted' : ''}`}>
                      <div className="missing-tag">{p.status === 'sighted' ? 'SIGHTED' : 'MISSING'}</div>
                      <div className="missing-image">
                        {p.img ? <img src={p.img} alt="Missing" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : '?'}
                      </div>
                      <div className="missing-details">
                        {p.status === 'sighted' && <div className="sighted-badge">👁 SIGHTING REPORTED</div>}
                        <h2 style={{color: 'white', fontSize: '20px', margin: '0 0 5px 0'}}>{p.name}</h2>
                        <p style={{color: '#aaa', fontSize: '14px', margin: 0}}>Age: <span style={{color:'white'}}>{p.age}</span></p>
                        <p style={{color: '#aaa', fontSize: '14px', margin: '5px 0'}}>Last Seen: <span style={{color:'#fbbf24'}}>{p.lastSeen}</span></p>
                        
                        <div style={{marginTop: '15px'}}>
                          {p.status === 'active' ? (
                            <>
                              <button className="contact-btn contact-guardian" onClick={() => alert(`Calling Guardian: ${p.contact}`)}>📞 Call Guardian</button>
                              <button className="contact-btn contact-security" onClick={() => handleSighting(p.id)}>👁 I Found Them</button>
                            </>
                          ) : (
                            <button className="contact-btn contact-verify" onClick={() => handleVerifyFound(p)}>✅ Verify & Close Case</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'Alerts':
        return (
          <div>
            <h2 style={{color: '#ef4444', marginBottom: '20px'}}>System Logs & Alerts</h2>
            <div className="alerts-container">
              {alertsList.length === 0 ? <p style={{color:'#666'}}>No recent alerts.</p> : 
               alertsList.map(a => (
                 <div key={a.id} className="alert-item">
                   <div style={{fontSize: '12px', color: '#888'}}>{a.time}</div>
                   <div style={{fontWeight: 'bold', color: '#ffcece'}}>{a.msg}</div>
                 </div>
               ))
              }
            </div>
          </div>
        );

      case 'Friends':
        return (
          <div className="friends-layout">
            <div className="qr-card">
              <h3>Your Connection ID</h3>
              <div className="qr-box">
                {/* Simulated QR Pattern */}
                <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2}}>
                  {Array.from({length:25}).map((_,i)=><div key={i} style={{width:20, height:20, background:Math.random()>0.5?'black':'white'}}></div>)}
                </div>
              </div>
              <p style={{color:'#888', marginBottom:'15px'}}>{myQR}</p>
              <button className="menu-btn active" style={{width:'100%', textAlign:'center'}} onClick={handleScanFriend}>📸 SCAN FRIEND'S QR</button>
            </div>

            <div className="friends-list">
              <h3 style={{color: '#3b82f6', marginBottom: '20px'}}>Connected Friends ({friends.length})</h3>
              {friends.length === 0 ? (
                <div style={{textAlign:'center', color:'#666', marginTop:'50px'}}>No friends connected yet.<br/>Scan a QR code to start.</div>
              ) : (
                <>
                  <button className="every1-btn" onClick={() => setTrackAllModalOpen(true)}>🌍 EVERY-1 (TRACK ALL)</button>
                  {friends.map(f => (
                    <div key={f.id} className="friend-item">
                      <div style={{display:'flex', alignItems:'center'}}>
                        <div className="friend-avatar">{f.name.charAt(0)}</div>
                        <div className="friend-info">
                          <div style={{color:'white', fontWeight:'bold'}}>{f.name}</div>
                          <div className="friend-status">Sector {mainGrid[f.location].name} • {mainGrid[f.location].count} ppl</div>
                        </div>
                      </div>
                      <button className="track-btn" onClick={() => handleTrackFriend(f.id)}>🛰 Track Path</button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        );

      case 'Static': // --- NEW STATIC CASE ---
        return (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Inputs Panel */}
            <div className="card" style={{ flex: 1, minWidth: '300px', background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                 <h3 style={{ color: '#00d4ff', margin: 0 }}>Manual Crowd Data Entry</h3>
                 <button onClick={resumeSimulation} style={{background: isSimulationActive ? '#10b981' : '#374151', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>
                    {isSimulationActive ? 'Simulation Running' : '▶ Resume Simulation'}
                 </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
                {mainGrid.map((sector, idx) => (
                   <div key={idx} style={{ background: '#0b0f19', padding: '10px', borderRadius: '6px', border: '1px solid #333' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>
                        {sector.name}
                      </label>
                      <input 
                        type="number" 
                        value={sector.count} 
                        onChange={(e) => handleStaticChange(idx, e.target.value)}
                        style={{ width: '100%', background: '#000', border: '1px solid #333', color: 'white', padding: '5px', borderRadius: '4px' }}
                      />
                   </div>
                ))}
              </div>
            </div>

            {/* Visualization Panel */}
            <div className="card" style={{ flex: 1.5, minWidth: '300px', display: 'flex', flexDirection: 'column', background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
              <h3 style={{ color: '#10b981', marginBottom: '15px' }}>Static Simulation View</h3>
              <div className="nav-grid" style={{ flex: 1, maxHeight: '400px' }}>
                 {mainGrid.map((sector, idx) => (
                    <div key={idx} className={`nav-cell ${sector.density}`}>
                      <span style={{ color: '#fff', fontSize: '14px' }}>{sector.name}</span>
                      <span style={{ fontSize: '18px' }}>{sector.count}</span>
                    </div>
                 ))}
              </div>
              <div style={{marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center'}}>
                <div style={{display:'flex', alignItems:'center', gap: '5px'}}><div style={{width:15, height:15, background:'rgba(16, 185, 129, 0.2)', border:'1px solid #10b981'}}></div> Safe (&lt;15)</div>
                <div style={{display:'flex', alignItems:'center', gap: '5px'}}><div style={{width:15, height:15, background:'rgba(249, 115, 22, 0.2)', border:'1px solid #f97316'}}></div> Mod (15-30)</div>
                <div style={{display:'flex', alignItems:'center', gap: '5px'}}><div style={{width:15, height:15, background:'rgba(239, 68, 68, 0.2)', border:'1px solid #ef4444'}}></div> High (&gt;30)</div>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  // --- RENDER CONTENT ---
  return (
    <div className={`app-container ${localAlert ? 'critical-alert-mode' : ''} ${globalAlert ? 'global-alert-mode' : ''}`}>
      <style>{styles}</style>

      {!locationPermission && (
        <div className="location-modal-overlay">
          <div className="location-card">
            <div className="loc-icon">🌍</div>
            <h2>Enable Location</h2>
            <p style={{color:'#aaa', marginBottom:'20px'}}>DRISTI needs your location to guide you through safe zones.</p>
            <button className="allow-btn" onClick={requestLocation}>Allow Access</button>
          </div>
        </div>
      )}

      {globalAlert && <div className="global-alert-banner"><span>🔔</span> {globalAlert}</div>}

      {localAlert && (
        <div className="local-evacuation-overlay">
          <h2>🚨 HIGH DENSITY ALERT</h2>
          <p>Your current zone is overcrowded. Please move to a safer area immediately.</p>
          <button className="safe-route-btn" onClick={() => setEvacuationModalOpen(true)}>SHOW SAFEST ROUTE ➔</button>
        </div>
      )}

      <div className="sidebar">
        <div className="brand">DRISTI</div>
        {['Dashboard', 'Heatmap', 'Navigation', 'Friends', 'Missing', 'Alerts', 'Static'].map(tab => (
          <button key={tab} className={`menu-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      <div className="main-content">
        <div className="navbar">
          <div className="user-welcome">Welcome Harish 👋</div>
          <button className="alert-btn" onClick={() => setActiveTab('Alerts')}>⚠ ALERTS</button>
        </div>
        <div className="dashboard-view">
          <h1>{activeTab}</h1>
          {renderContent()}
          
          {/* PERSISTENT EMERGENCY CONTACTS FOOTER */}
          <div className="emergency-footer">
            <h3>🚨 Emergency Contacts</h3>
            <div className="emergency-grid">
              <button className="em-btn" onClick={() => alert("Calling Police...")}>👮 Police</button>
              <button className="em-btn" onClick={() => alert("Calling Ambulance...")}>🚑 Ambulance</button>
              <button className="em-btn" onClick={() => alert("Calling Fire...")}>🔥 Fire</button>
              <button className="em-btn" onClick={() => alert("Calling Security...")}>🛡 Security</button>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && selectedGridData && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setModalOpen(false)}>CLOSE</button>
            <h2 style={{marginTop: '10px', color: '#00d4ff'}}>CAM-{String(selectedGridData.id).padStart(2, '0')} • {selectedGridData.name}</h2>
            <div style={{flex: 1, background: 'black', borderRadius: '8px', position: 'relative', overflow: 'hidden', border: '1px solid #333'}}>
              <SimulatedFeed density={selectedGridData.count} />
              <div className="scanlines"></div>
              <div className="user-marker" style={{top: '50%', left: '50%'}}>LIVE</div>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING FRIEND MODAL */}
      {friendTrackingModal && (
        <div className="modal-overlay" onClick={() => setFriendTrackingModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setFriendTrackingModal(null)}>STOP TRACKING</button>
            {renderTrackingContent()}
          </div>
        </div>
      )}

      {/* TRACK ALL (EVERY-1) MODAL */}
      {trackAllModalOpen && (
        <div className="modal-overlay" onClick={() => setTrackAllModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setTrackAllModalOpen(false)}>CLOSE</button>
            {renderTrackAllContent()}
          </div>
        </div>
      )}

      {/* EVACUATION MODAL (Existing) */}
      {evacuationModalOpen && (
        <div className="modal-overlay" style={{background: 'rgba(50, 0, 0, 0.95)'}}>
          <div className="modal-content" style={{border: '2px solid red'}}>
            <button className="close-btn" onClick={() => setEvacuationModalOpen(false)}>CLOSE</button>
            <h2 style={{color: '#ef4444', textAlign: 'center'}}>⚠ EMERGENCY EVACUATION PATH</h2>
            <div className="venue-map-wrapper" style={{maxWidth: '600px', margin: '0 auto', flex: 1}}>
              <div className="nav-grid">
              {mainGrid.map((cell, idx) => {
                 const p = calculatePath(userLocation, 0, mainGrid); 
                 const isPath = p.includes(idx);
                 const pathIndex = p.indexOf(idx);
                 const nextCell = pathIndex > -1 && pathIndex < p.length - 1 ? p[pathIndex + 1] : undefined;
                 const arrow = getNavArrow(idx, nextCell);
                 const isUser = idx === userLocation;
                 return (
                   <div key={idx} className={`nav-cell ${cell.density} ${isPath ? 'path' : ''} ${isUser ? 'user' : ''}`}>
                     {isUser ? '📍 YOU' : arrow ? <span className="nav-arrow">{arrow}</span> : cell.count}
                   </div>
                 );
              })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
