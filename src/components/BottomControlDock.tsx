import React, { useState } from 'react';
import {
  CameraPreset,
  SimulationScenario,
  StatusLevel,
} from '../types/datacenter';
import {
  Camera,
  Layers,
  Flame,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Gauge,
  Thermometer,
  ShieldAlert,
  Play,
  RotateCcw,
} from 'lucide-react';

interface BottomControlDockProps {
  cameraPreset: CameraPreset;
  onSelectCamera: (preset: CameraPreset) => void;
  heatmapMode: 'status' | 'temperature' | 'smoke' | 'power';
  onSelectHeatmap: (mode: 'status' | 'temperature' | 'smoke' | 'power') => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  scenario: SimulationScenario;
  onSelectScenario: (scen: SimulationScenario) => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  onOpenAlerts: () => void;
  onOpenAnalytics: () => void;
  onOpenArchitecture: () => void;
  criticalCount: number;
  warningCount: number;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  cameraPreset,
  onSelectCamera,
  heatmapMode,
  onSelectHeatmap,
  autoRotate,
  onToggleAutoRotate,
  scenario,
  onSelectScenario,
  isAudioMuted,
  onToggleAudioMute,
  onOpenAlerts,
  onOpenAnalytics,
  onOpenArchitecture,
  criticalCount,
  warningCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'heatmap' | 'scenarios'>('camera');

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 pointer-events-none transition-all duration-300">
      {/* Collapse / Expand Toggle Button */}
      <div className="flex justify-center mb-1 pointer-events-auto">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors shadow-lg backdrop-blur-md"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Buka Kontrol 3D</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sembunyikan Dock (Mode Zen)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Control Dock Card */}
      {!isCollapsed && (
        <div className="pointer-events-auto rounded-xl bg-zinc-950/92 border border-zinc-800/90 shadow-2xl p-2.5 backdrop-blur-xl">
          {/* Top Bar Tabs & Quick Actions */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'camera'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Preset Kamera</span>
              </button>

              <button
                onClick={() => setActiveTab('heatmap')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'heatmap'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Visual Layer</span>
              </button>

              <button
                onClick={() => setActiveTab('scenarios')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'scenarios'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Simulasi Stress Test</span>
              </button>
            </div>

            {/* Quick Utility Badges */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleAutoRotate}
                title="Toggle Auto Orbit"
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  autoRotate
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                <span className="text-[11px] hidden sm:inline">Orbit</span>
              </button>

              <button
                onClick={onToggleAudioMute}
                title={isAudioMuted ? 'Nyalakan Audio Alarm' : 'Senyapkan Audio Alarm'}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  isAudioMuted
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                }`}
              >
                {isAudioMuted ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span className="text-[11px] hidden sm:inline">
                  {isAudioMuted ? 'Muted' : 'Siren On'}
                </span>
              </button>
            </div>
          </div>

          {/* Tab 1: Camera Presets */}
          {activeTab === 'camera' && (
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => onSelectCamera('isometric')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cameraPreset === 'isometric'
                      ? 'bg-cyan-500 text-zinc-950 font-semibold border-cyan-400 shadow-md'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  Isometric Global
                </button>
                <button
                  onClick={() => onSelectCamera('cold_aisle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cameraPreset === 'cold_aisle'
                      ? 'bg-cyan-500 text-zinc-950 font-semibold border-cyan-400 shadow-md'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  Cold Aisle (Front)
                </button>
                <button
                  onClick={() => onSelectCamera('hot_aisle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cameraPreset === 'hot_aisle'
                      ? 'bg-cyan-500 text-zinc-950 font-semibold border-cyan-400 shadow-md'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  Hot Aisle (Exhaust)
                </button>
                <button
                  onClick={() => onSelectCamera('top_down')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cameraPreset === 'top_down'
                      ? 'bg-cyan-500 text-zinc-950 font-semibold border-cyan-400 shadow-md'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  Top-Down Floorplan
                </button>
                <button
                  onClick={() => onSelectCamera('rack_focus')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cameraPreset === 'rack_focus'
                      ? 'bg-cyan-500 text-zinc-950 font-semibold border-cyan-400 shadow-md'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  Fokus Rak Aktif
                </button>
              </div>

              <div className="text-[11px] text-zinc-500 hidden md:block">
                Drag mouse untuk orbit, scroll untuk zoom, klik kanan untuk pan
              </div>
            </div>
          )}

          {/* Tab 2: Visual Layer / Heatmap */}
          {activeTab === 'heatmap' && (
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => onSelectHeatmap('status')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    heatmapMode === 'status'
                      ? 'bg-cyan-500 text-zinc-950 font-semibold border-cyan-400'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Status Zona (Normal / Peringatan / Kritis)</span>
                </button>

                <button
                  onClick={() => onSelectHeatmap('temperature')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    heatmapMode === 'temperature'
                      ? 'bg-amber-500 text-zinc-950 font-semibold border-amber-400'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>Distribusi Gradien Suhu (°C)</span>
                </button>

                <button
                  onClick={() => onSelectHeatmap('smoke')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    heatmapMode === 'smoke'
                      ? 'bg-rose-500 text-zinc-950 font-semibold border-rose-400'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Sensor Asap / Gas MQ-2</span>
                </button>

                <button
                  onClick={() => onSelectHeatmap('power')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    heatmapMode === 'power'
                      ? 'bg-indigo-500 text-zinc-100 font-semibold border-indigo-400'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Beban Daya Rak (kW)</span>
                </button>
              </div>

              <div className="text-[11px] text-zinc-400 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Normal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Warning
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Kritis (Kedip)
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Simulation Stress Scenarios */}
          {activeTab === 'scenarios' && (
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => onSelectScenario('normal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    scenario === 'normal'
                      ? 'bg-emerald-500 text-zinc-950 font-semibold border-emerald-400'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Normal (Baseline)</span>
                </button>

                <button
                  onClick={() => onSelectScenario('thermal_spike')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    scenario === 'thermal_spike'
                      ? 'bg-amber-500 text-zinc-950 font-semibold border-amber-400'
                      : 'bg-zinc-900/80 text-amber-300/90 border-amber-900/50 hover:bg-amber-950/30'
                  }`}
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>Thermal Spike (Rak B2 34.6°C)</span>
                </button>

                <button
                  onClick={() => onSelectScenario('ac_failure')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    scenario === 'ac_failure'
                      ? 'bg-rose-500 text-zinc-100 font-semibold border-rose-400'
                      : 'bg-zinc-900/80 text-rose-300/90 border-rose-900/50 hover:bg-rose-950/30'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Kegagalan CRAC-01 (Ruang Panas)</span>
                </button>

                <button
                  onClick={() => onSelectScenario('smoke_hazard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    scenario === 'smoke_hazard'
                      ? 'bg-rose-600 text-zinc-100 font-semibold border-rose-400 shadow-rose-900/50 shadow-lg'
                      : 'bg-zinc-900/80 text-rose-300/90 border-rose-900/50 hover:bg-rose-950/30'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Bahaya Asap (MQ-2 Rak C1)</span>
                </button>

                <button
                  onClick={() => onSelectScenario('high_gpu_load')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    scenario === 'high_gpu_load'
                      ? 'bg-indigo-500 text-zinc-100 font-semibold border-indigo-400'
                      : 'bg-zinc-900/80 text-indigo-300/90 border-indigo-900/50 hover:bg-indigo-950/30'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>GPU Cluster Surge</span>
                </button>
              </div>

              <div className="text-[11px] text-zinc-400 font-mono">
                {scenario === 'normal'
                  ? 'Sistem beroperasi optimal'
                  : 'Skenario stres aktif - memicu simulasi IoT'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
