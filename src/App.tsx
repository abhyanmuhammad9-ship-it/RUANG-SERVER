/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RackSensorData,
  ZoneData,
  AlertEvent,
  ThresholdConfig,
  WebhookConfig,
  TimeSeriesPoint,
  SimulationScenario,
  CameraPreset,
  StatusLevel,
} from './types/datacenter';
import {
  INITIAL_RACKS,
  INITIAL_ZONES,
  DEFAULT_THRESHOLDS,
  DEFAULT_WEBHOOKS,
  generateInitialHistory,
  simulateTick,
  computeZoneStats,
} from './services/datacenterSimulation';
import { audioAlarm } from './services/audioAlarm';
import { ThreeDataCenter } from './components/ThreeDataCenter';
import { TopHeader } from './components/TopHeader';
import { BottomControlDock } from './components/BottomControlDock';
import { RackDetailModal } from './components/RackDetailModal';
import { AlertsManagerModal } from './components/AlertsManagerModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { JwtSecurityModal } from './components/JwtSecurityModal';
import { AlertTriangle, Flame, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function App() {
  // Telemetry & Facility State
  const [racks, setRacks] = useState<RackSensorData[]>(INITIAL_RACKS);
  const [zones, setZones] = useState<ZoneData[]>(INITIAL_ZONES);
  const [alerts, setAlerts] = useState<AlertEvent[]>([
    {
      id: 'init-alert-1',
      timestamp: '14:22:10',
      rackId: 'rack-b2',
      rackName: 'Rack B2 (Database Cluster)',
      zoneName: 'Zone B - Storage & Database',
      level: 'warning',
      sensorType: 'temperature',
      value: 26.8,
      threshold: 26.0,
      message: 'Suhu meningkat mendekati ambang batas peringatan',
      acknowledged: true,
      resolved: false,
    },
  ]);
  const [thresholds, setThresholds] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);
  const [webhooks, setWebhooks] = useState<WebhookConfig>(DEFAULT_WEBHOOKS);
  const [history, setHistory] = useState<TimeSeriesPoint[]>(() => generateInitialHistory(24));

  // 3D & Viewport Controls State
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const [heatmapMode, setHeatmapMode] = useState<'status' | 'temperature' | 'smoke' | 'power'>('status');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);

  // Audio Alarm State
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Simulation Stress Scenario
  const [scenario, setScenario] = useState<SimulationScenario>('normal');

  // Modal Open States
  const [isRackModalOpen, setIsRackModalOpen] = useState<boolean>(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);

  // History aggregator tick counter
  const historyTickCounter = useRef<number>(0);

  // Overall Facility Status
  const criticalCount = racks.filter((r) => r.status === 'critical').length;
  const warningCount = racks.filter((r) => r.status === 'warning').length;
  const overallStatus: StatusLevel = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'normal';

  // Sound Alarm Management Effect
  useEffect(() => {
    audioAlarm.setMuted(isAudioMuted);
    if (!isAudioMuted && criticalCount > 0) {
      audioAlarm.startEmergencySiren();
    } else {
      audioAlarm.stopAlarm();
    }
    return () => {
      audioAlarm.stopAlarm();
    };
  }, [criticalCount, isAudioMuted]);

  // Real-Time Stochastic Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setRacks((prevRacks) => {
        const { racks: updatedRacks, newAlerts } = simulateTick(prevRacks, scenario, thresholds);

        // Append new alerts if any
        if (newAlerts.length > 0) {
          setAlerts((prevAlerts) => [...newAlerts, ...prevAlerts].slice(0, 50));
          if (!isAudioMuted) {
            audioAlarm.playWarningBeep();
          }
        }

        // Recompute Zone statistics
        setZones((prevZones) => computeZoneStats(updatedRacks, prevZones));

        // Periodically update time-series history
        historyTickCounter.current += 1;
        if (historyTickCounter.current >= 4) {
          historyTickCounter.current = 0;
          const now = new Date();
          const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;

          const avgTemp = Number(
            (updatedRacks.reduce((a, r) => a + r.temperature, 0) / updatedRacks.length).toFixed(1)
          );
          const maxTemp = Number(Math.max(...updatedRacks.map((r) => r.temperature)).toFixed(1));
          const avgHum = Number(
            (updatedRacks.reduce((a, r) => a + r.humidity, 0) / updatedRacks.length).toFixed(1)
          );
          const avgSmoke = Number(
            (updatedRacks.reduce((a, r) => a + r.smokePpm, 0) / updatedRacks.length).toFixed(1)
          );
          const totalPower = Number(
            updatedRacks.reduce((a, r) => a + r.powerKw, 0).toFixed(1)
          );

          setHistory((prevHist) => [
            ...prevHist.slice(1),
            {
              timestamp: now.toISOString(),
              timeLabel,
              avgTemp,
              maxTemp,
              avgHumidity: avgHum,
              avgSmokePpm: avgSmoke,
              totalPowerKw: totalPower,
            },
          ]);
        }

        return updatedRacks;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [scenario, thresholds, isAudioMuted]);

  // Handle Rack Selection
  const handleSelectRack = useCallback((rackId: string | null) => {
    setSelectedRackId(rackId);
    if (rackId) {
      setIsRackModalOpen(true);
      audioAlarm.playClick(750);
    }
  }, []);

  // Handle Focus Camera on Selected Rack
  const handleFocusCamera = useCallback(() => {
    setCameraPreset('rack_focus');
  }, []);

  // Handle Acknowledge Alert
  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    audioAlarm.playClick(900);
  }, []);

  // Handle Acknowledge all alerts for a rack
  const handleAcknowledgeRackAlerts = useCallback((rackId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.rackId === rackId ? { ...a, acknowledged: true, resolved: true } : a))
    );
    // Reset scenario if it was targeting this rack
    setScenario('normal');
    setIsRackModalOpen(false);
    audioAlarm.playClick(1000);
  }, []);

  // Selected Rack Object
  const selectedRack = racks.find((r) => r.id === selectedRackId) || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100 flex flex-col">
      {/* Top Telemetry Header */}
      <TopHeader
        fps={fps}
        criticalAlertCount={criticalCount}
        warningAlertCount={warningCount}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        overallStatus={overallStatus}
      />

      {/* Critical Incident Emergency Strobe Bar */}
      {criticalCount > 0 && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-20 w-auto px-4 py-1.5 rounded-full bg-rose-600/95 text-white border border-rose-400 shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-bounce select-none">
          <Flame className="w-4 h-4 text-white animate-pulse" />
          <span>
            PERINGATAN KRITIS: {criticalCount} Rak Melebihi Ambang Batas Aman!
          </span>
          <button
            onClick={() => {
              const critRack = racks.find((r) => r.status === 'critical');
              if (critRack) {
                setSelectedRackId(critRack.id);
                setCameraPreset('rack_focus');
                setIsRackModalOpen(true);
              }
            }}
            className="px-2 py-0.5 rounded bg-zinc-950 text-rose-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
          >
            Periksa Spasial <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Minimal Top-Left Zone Spatial Overview Pill (Non-obtrusive HUD) */}
      <div className="fixed top-16 left-4 z-20 pointer-events-none hidden sm:flex flex-col gap-1.5 text-xs">
        <div className="pointer-events-auto p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 shadow-xl backdrop-blur-md space-y-1.5 w-60">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-zinc-800/80 pb-1">
            <span className="font-bold text-zinc-300">SPATIAL ZONES</span>
            <span>6 RACKS ONLINE</span>
          </div>

          {zones.map((zone) => (
            <div key={zone.id} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    zone.status === 'critical'
                      ? 'bg-rose-500'
                      : zone.status === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="font-medium text-zinc-200">{zone.name.split(' - ')[0]}</span>
              </div>
              <div className="font-mono text-zinc-400 text-[10px] space-x-2">
                <span>{zone.avgTemp}°C</span>
                <span>{zone.avgHumidity}% RH</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport (100% Unobstructed Center) */}
      <main className="flex-1 w-full h-full relative">
        <ThreeDataCenter
          racks={racks}
          selectedRackId={selectedRackId}
          onSelectRack={handleSelectRack}
          cameraPreset={cameraPreset}
          heatmapMode={heatmapMode}
          autoRotate={autoRotate}
          onFpsUpdate={setFps}
        />
      </main>

      {/* Ergonomic Collapsible Bottom Control Dock */}
      <BottomControlDock
        cameraPreset={cameraPreset}
        onSelectCamera={setCameraPreset}
        heatmapMode={heatmapMode}
        onSelectHeatmap={setHeatmapMode}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
        scenario={scenario}
        onSelectScenario={setScenario}
        isAudioMuted={isAudioMuted}
        onToggleAudioMute={() => setIsAudioMuted(!isAudioMuted)}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        criticalCount={criticalCount}
        warningCount={warningCount}
      />

      {/* Modals & Inspection Drawers */}
      {isRackModalOpen && selectedRack && (
        <RackDetailModal
          rack={selectedRack}
          thresholds={thresholds}
          onClose={() => setIsRackModalOpen(false)}
          onFocusCamera={handleFocusCamera}
          onAcknowledgeRackAlerts={handleAcknowledgeRackAlerts}
        />
      )}

      {isAlertsModalOpen && (
        <AlertsManagerModal
          thresholds={thresholds}
          onUpdateThresholds={setThresholds}
          webhooks={webhooks}
          onUpdateWebhooks={setWebhooks}
          alerts={alerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          onClearResolvedAlerts={() =>
            setAlerts((prev) => prev.filter((a) => !a.acknowledged || !a.resolved))
          }
          isAudioMuted={isAudioMuted}
          onToggleAudioMute={() => setIsAudioMuted(!isAudioMuted)}
          onClose={() => setIsAlertsModalOpen(false)}
        />
      )}

      {isAnalyticsModalOpen && (
        <AnalyticsModal
          history={history}
          alerts={alerts}
          onClose={() => setIsAnalyticsModalOpen(false)}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />
      )}

      {isArchitectureModalOpen && (
        <ArchitectureModal onClose={() => setIsArchitectureModalOpen(false)} />
      )}

      {isSecurityModalOpen && (
        <JwtSecurityModal onClose={() => setIsSecurityModalOpen(false)} />
      )}
    </div>
  );
}
