import React from 'react';
import {
  RackSensorData,
  ThresholdConfig,
} from '../types/datacenter';
import {
  X,
  Thermometer,
  Droplets,
  Flame,
  Zap,
  Fan,
  Server,
  Cpu,
  ShieldAlert,
  Network,
  Focus,
  CheckCircle2,
} from 'lucide-react';

interface RackDetailModalProps {
  rack: RackSensorData | null;
  thresholds: ThresholdConfig;
  onClose: () => void;
  onFocusCamera: () => void;
  onAcknowledgeRackAlerts: (rackId: string) => void;
}

export const RackDetailModal: React.FC<RackDetailModalProps> = ({
  rack,
  thresholds,
  onClose,
  onFocusCamera,
  onAcknowledgeRackAlerts,
}) => {
  if (!rack) return null;

  const isTempCritical = rack.temperature >= thresholds.tempCritical;
  const isTempWarning = rack.temperature >= thresholds.tempWarning && !isTempCritical;

  const isSmokeCritical = rack.smokePpm >= thresholds.smokeCriticalPpm || rack.smokeDetected;
  const isSmokeWarning = rack.smokePpm >= thresholds.smokeWarningPpm && !isSmokeCritical;

  const isHumWarning = rack.humidity < thresholds.humidityMin || rack.humidity > thresholds.humidityMax;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end sm:p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="w-full sm:max-w-md h-full sm:h-[94vh] bg-zinc-950 sm:rounded-2xl border-l sm:border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                rack.status === 'critical'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                  : rack.status === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
              }`}
            >
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{rack.name}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    rack.status === 'critical'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : rack.status === 'warning'
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  }`}
                >
                  {rack.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400">{rack.zoneName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-zinc-300 text-sm">
          {/* Quick Hardware Spec Tag */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>IP:</span>
              <span className="text-zinc-200">{rack.ipAddress}</span>
            </div>
            <div className="text-zinc-400">
              <span>MAC:</span> <span className="text-zinc-200">{rack.macAddress}</span>
            </div>
            <div className="text-zinc-400">
              <span>Sensor:</span> <span className="text-zinc-200">ESP32-IoT-Node #04</span>
            </div>
            <div className="text-zinc-400">
              <span>Update:</span> <span className="text-cyan-400">{rack.lastUpdated}</span>
            </div>
          </div>

          {/* Primary Sensor Gauges */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Temperature */}
            <div
              className={`p-3 rounded-xl border ${
                isTempCritical
                  ? 'bg-rose-950/30 border-rose-600/60'
                  : isTempWarning
                  ? 'bg-amber-950/30 border-amber-600/60'
                  : 'bg-zinc-900/70 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  Suhu Udara
                </span>
                <span className="text-[10px] font-mono">Max {thresholds.tempCritical}°C</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {rack.temperature}°C
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isTempCritical ? 'bg-rose-500' : isTempWarning ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (rack.temperature / 45) * 100)}%` }}
                />
              </div>
            </div>

            {/* Humidity */}
            <div
              className={`p-3 rounded-xl border ${
                isHumWarning ? 'bg-amber-950/30 border-amber-600/60' : 'bg-zinc-900/70 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  Kelembaban
                </span>
                <span className="text-[10px] font-mono">{thresholds.humidityMin}-{thresholds.humidityMax}%</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {rack.humidity}% <span className="text-xs font-normal text-zinc-400 font-sans">RH</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isHumWarning ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${rack.humidity}%` }}
                />
              </div>
            </div>

            {/* Smoke / Gas MQ-2 */}
            <div
              className={`p-3 rounded-xl border ${
                isSmokeCritical
                  ? 'bg-rose-950/40 border-rose-500'
                  : isSmokeWarning
                  ? 'bg-amber-950/30 border-amber-600/60'
                  : 'bg-zinc-900/70 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Gas & Asap (MQ-2)
                </span>
                <span className="text-[10px] font-mono">Ambang {thresholds.smokeCriticalPpm}</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-1">
                {rack.smokePpm} <span className="text-xs font-normal text-zinc-400">PPM</span>
              </div>
              <div className="text-[11px] mt-1 font-mono">
                {rack.smokeDetected || isSmokeCritical ? (
                  <span className="text-rose-400 font-bold">ASAP / GAS TERDETEKSI!</span>
                ) : (
                  <span className="text-emerald-400">Udara Bersih (Normal)</span>
                )}
              </div>
            </div>

            {/* Power & Fan RPM */}
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  Beban Daya
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono">
                  <Fan className="w-3 h-3 text-cyan-400" /> {rack.fanRpm} RPM
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {rack.powerKw} <span className="text-xs font-normal text-zinc-400">kW</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Efisiensi PUE: <span className="text-zinc-200 font-mono">1.18</span>
              </div>
            </div>
          </div>

          {/* Blade Server Chassis Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Daftar Node Blade Server (U-Slots)
              </h3>
              <span className="text-[11px] text-zinc-500 font-mono">
                {rack.blades.length} Node Aktif
              </span>
            </div>

            <div className="space-y-2">
              {rack.blades.map((blade) => (
                <div
                  key={blade.id}
                  className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                        Slot {blade.slot}U
                      </span>
                      <span className="font-semibold text-zinc-200">{blade.name}</span>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold ${
                        blade.cpuTemp >= 70
                          ? 'text-rose-400'
                          : blade.cpuTemp >= 55
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {blade.cpuTemp}°C CPU
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono">
                    <div>
                      Load: <span className="text-zinc-200 font-semibold">{blade.load}%</span>
                    </div>
                    <div>
                      Fan: <span className="text-zinc-200">{blade.fanSpeed} RPM</span>
                    </div>
                  </div>

                  <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${blade.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between gap-2">
          <button
            onClick={onFocusCamera}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 text-xs font-semibold transition-colors"
          >
            <Focus className="w-3.5 h-3.5" />
            <span>Arahkan Kamera ke Rak</span>
          </button>

          <button
            onClick={() => onAcknowledgeRackAlerts(rack.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-semibold transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reset Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
