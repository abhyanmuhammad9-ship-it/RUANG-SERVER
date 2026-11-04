import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Bell,
  LineChart,
  BookOpen,
  Lock,
  Wifi,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { StatusLevel } from '../types/datacenter';

interface TopHeaderProps {
  fps: number;
  criticalAlertCount: number;
  warningAlertCount: number;
  onOpenAlerts: () => void;
  onOpenAnalytics: () => void;
  onOpenArchitecture: () => void;
  onOpenSecurity: () => void;
  overallStatus: StatusLevel;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  fps,
  criticalAlertCount,
  warningAlertCount,
  onOpenAlerts,
  onOpenAnalytics,
  onOpenArchitecture,
  onOpenSecurity,
  overallStatus,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [simLatency, setSimLatency] = useState<number>(45);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subtle realistic ping jitter for WebSocket broker latency (< 1s requirement)
  useEffect(() => {
    const interval = setInterval(() => {
      setSimLatency(Math.floor(38 + Math.random() * 22));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const totalActiveAlerts = criticalAlertCount + warningAlertCount;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-3.5 py-2.5 bg-zinc-950/85 border-b border-zinc-800/80 backdrop-blur-md flex items-center justify-between gap-3 text-zinc-100 select-none">
      {/* Left: Branding & Data Center Specs */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
          <Server className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              DC-TWIN 3D
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 font-mono">
                TIER-III
              </span>
            </h1>
            <span className="hidden md:inline-block text-zinc-600 text-xs">|</span>
            <span className="hidden md:inline-block text-xs text-zinc-400">
              Spatial Awareness & Early Warning System
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
            <span>FACILITY-ID: JKT-DC02</span>
            <span>•</span>
            <span className="text-zinc-400">HALL A (6 RACKS / 3 ZONES)</span>
          </div>
        </div>
      </div>

      {/* Center: System Telemetry Badges (Non-Functional Requirements Monitor) */}
      <div className="hidden lg:flex items-center gap-2.5 font-mono text-[11px]">
        {/* 3D Framerate Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-zinc-800">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-zinc-400">3D FPS:</span>
          <span
            className={`font-semibold ${
              fps >= 55 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {fps} FPS
          </span>
          <span className="text-[10px] text-zinc-500">
            ({fps > 0 ? (1000 / fps).toFixed(1) : '16.6'}ms)
          </span>
        </div>

        {/* WebSocket Latency Badge (< 1s constraint) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-zinc-800">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-400">WS Broker:</span>
          <span className="font-semibold text-emerald-400">{simLatency} ms</span>
          <span className="text-[10px] text-zinc-500">(&lt;1s target)</span>
        </div>

        {/* System State Banner */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-semibold ${
            overallStatus === 'critical'
              ? 'bg-rose-950/60 border-rose-700/60 text-rose-300'
              : overallStatus === 'warning'
              ? 'bg-amber-950/60 border-amber-700/60 text-amber-300'
              : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              overallStatus === 'critical'
                ? 'bg-rose-500'
                : overallStatus === 'warning'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
          />
          <span>
            {overallStatus === 'critical'
              ? 'ALARM KRITIS AKTIF'
              : overallStatus === 'warning'
              ? 'PERINGATAN ANOMALI'
              : 'SISTEM NORMAL'}
          </span>
        </div>

        {/* Clock */}
        <div className="px-2.5 py-1 rounded-md bg-zinc-900/70 border border-zinc-800/80 text-zinc-300">
          {currentTime || '00:00:00'} WIB
        </div>
      </div>

      {/* Right: Action Buttons & Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Alerts Center Trigger */}
        <button
          onClick={onOpenAlerts}
          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            criticalAlertCount > 0
              ? 'bg-rose-950/80 text-rose-200 border-rose-600/70 hover:bg-rose-900/90'
              : warningAlertCount > 0
              ? 'bg-amber-950/80 text-amber-200 border-amber-600/70 hover:bg-amber-900/90'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Peringatan</span>
          {totalActiveAlerts > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                criticalAlertCount > 0 ? 'bg-rose-500 text-white' : 'bg-amber-400 text-zinc-950'
              }`}
            >
              {totalActiveAlerts}
            </span>
          )}
        </button>

        {/* Analytics & History Trigger */}
        <button
          onClick={onOpenAnalytics}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <LineChart className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Riwayat & Tren</span>
        </button>

        {/* Architecture & Overview Trigger */}
        <button
          onClick={onOpenArchitecture}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Latar Belakang & Scope</span>
        </button>

        {/* JWT & Security Modal Trigger */}
        <button
          onClick={onOpenSecurity}
          title="Keamanan JWT & Broker WebSocket"
          className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200 transition-colors flex items-center gap-1"
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline font-mono text-[11px]">JWT Auth</span>
        </button>
      </div>
    </header>
  );
};
