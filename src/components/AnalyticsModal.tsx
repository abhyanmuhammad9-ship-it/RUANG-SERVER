import React, { useState } from 'react';
import {
  TimeSeriesPoint,
  AlertEvent,
  StatusLevel,
} from '../types/datacenter';
import {
  X,
  LineChart,
  Thermometer,
  Droplets,
  Flame,
  Zap,
  Calendar,
  Filter,
  CheckCircle,
  AlertTriangle,
  History,
} from 'lucide-react';

interface AnalyticsModalProps {
  history: TimeSeriesPoint[];
  alerts: AlertEvent[];
  onClose: () => void;
  onAcknowledgeAlert: (id: string) => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  history,
  alerts,
  onClose,
  onAcknowledgeAlert,
}) => {
  const [activeMetric, setActiveMetric] = useState<'temperature' | 'humidity' | 'smoke' | 'power'>('temperature');
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '6h' | '24h'>('15m');
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter alerts
  const filteredAlerts = alerts.filter((a) => {
    if (alertFilter === 'all') return true;
    return a.level === alertFilter;
  });

  // Calculate statistics from history
  const temps = history.map((h) => h.avgTemp);
  const maxTemps = history.map((h) => h.maxTemp);
  const hums = history.map((h) => h.avgHumidity);
  const smokes = history.map((h) => h.avgSmokePpm);
  const powers = history.map((h) => h.totalPowerKw);

  const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '22.0';
  const peakTemp = maxTemps.length > 0 ? Math.max(...maxTemps).toFixed(1) : '24.0';
  const avgHum = hums.length > 0 ? (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1) : '48.0';
  const avgSmoke = smokes.length > 0 ? (smokes.reduce((a, b) => a + b, 0) / smokes.length).toFixed(1) : '20.0';
  const avgPower = powers.length > 0 ? (powers.reduce((a, b) => a + b, 0) / powers.length).toFixed(1) : '38.5';

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Determine min & max for active metric
  let currentValues: number[] = [];
  let unit = '';
  let color = '#38bdf8';
  let label = '';

  if (activeMetric === 'temperature') {
    currentValues = history.map((h) => h.avgTemp);
    unit = '°C';
    color = '#f59e0b';
    label = 'Suhu Ruangan (°C)';
  } else if (activeMetric === 'humidity') {
    currentValues = history.map((h) => h.avgHumidity);
    unit = '% RH';
    color = '#06b6d4';
    label = 'Kelembaban Relatif (% RH)';
  } else if (activeMetric === 'smoke') {
    currentValues = history.map((h) => h.avgSmokePpm);
    unit = 'PPM';
    color = '#f43f5e';
    label = 'Gas & Asap MQ-2 (PPM)';
  } else {
    currentValues = history.map((h) => h.totalPowerKw);
    unit = 'kW';
    color = '#a855f7';
    label = 'Total Konsumsi Daya (kW)';
  }

  const minVal = Math.min(...currentValues, 0) * 0.9;
  const maxVal = Math.max(...currentValues, 10) * 1.15;

  const getX = (idx: number) => {
    if (history.length <= 1) return padding.left;
    return padding.left + (idx / (history.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return padding.top + innerHeight - ((val - minVal) / range) * innerHeight;
  };

  // Generate SVG path string
  const pointsString = currentValues.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');
  const areaString = `${getX(0)},${padding.top + innerHeight} ${pointsString} ${getX(
    currentValues.length - 1
  )},${padding.top + innerHeight}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[92vh] bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Riwayat & Analisis Telemetri Server
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                  ASHRAE TC 9.9
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Grafik time-series tren sensor suhu, kelembaban, konsentrasi gas, serta riwayat audit alarm.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Summary Metric Scorecards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  Rata-rata Suhu
                </span>
                <span className="font-mono text-[10px] text-zinc-500">Peak: {peakTemp}°C</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {avgTemp}°C
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">Rentang aman ASHRAE (18-27°C)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  Kelembaban Rata-rata
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {avgHum}% <span className="text-xs font-normal text-zinc-400 font-sans">RH</span>
              </div>
              <div className="text-[10px] text-cyan-400 mt-1">Non-kondensasi optimal</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  Gas / Asap (MQ-2)
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {avgSmoke} <span className="text-xs font-normal text-zinc-400">PPM</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">Batas ambang: 60 PPM</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Total Beban Fasilitas
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {avgPower} <span className="text-xs font-normal text-zinc-400">kW</span>
              </div>
              <div className="text-[10px] text-purple-300 mt-1">PUE Index: 1.18 (Efisiensi Tinggi)</div>
            </div>
          </div>

          {/* Time-Series Chart Section */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Metric Selectors */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveMetric('temperature')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    activeMetric === 'temperature'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-white'
                  }`}
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>Tren Suhu</span>
                </button>

                <button
                  onClick={() => setActiveMetric('humidity')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    activeMetric === 'humidity'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-white'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Tren Kelembaban</span>
                </button>

                <button
                  onClick={() => setActiveMetric('smoke')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    activeMetric === 'smoke'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Gas & Asap MQ-2</span>
                </button>

                <button
                  onClick={() => setActiveMetric('power')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    activeMetric === 'power'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Daya Listrik</span>
                </button>
              </div>

              {/* Time Range Pills */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                {(['15m', '1h', '6h', '24h'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      timeRange === range
                        ? 'bg-zinc-800 text-cyan-400 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {range === '15m' ? 'Live 15m' : range}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Chart Canvas */}
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-56 select-none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = padding.top + innerHeight * (1 - pct);
                  const val = (minVal + (maxVal - minVal) * pct).toFixed(1);
                  return (
                    <g key={idx}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#27272a"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 4}
                        fill="#71717a"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Filled Area */}
                <polygon points={areaString} fill="url(#chartGradient)" />

                {/* Stroke Line */}
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {currentValues.map((v, i) => (
                  <circle
                    key={i}
                    cx={getX(i)}
                    cy={getY(v)}
                    r={hoveredIndex === i ? '5' : '3'}
                    fill={hoveredIndex === i ? '#ffffff' : color}
                    stroke="#09090b"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ))}

                {/* X Axis Time Labels */}
                {history.map((h, i) => {
                  if (i % 4 !== 0 && i !== history.length - 1) return null;
                  return (
                    <text
                      key={i}
                      x={getX(i)}
                      y={chartHeight - 10}
                      fill="#71717a"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {h.timeLabel}
                    </text>
                  );
                })}

                {/* Scrubber Crosshair Indicator */}
                {hoveredIndex !== null && (
                  <g>
                    <line
                      x1={getX(hoveredIndex)}
                      y1={padding.top}
                      x2={getX(hoveredIndex)}
                      y2={padding.top + innerHeight}
                      stroke="#ffffff"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  </g>
                )}
              </svg>

              {/* Scrubber Tooltip */}
              {hoveredIndex !== null && history[hoveredIndex] && (
                <div
                  className="absolute top-2 pointer-events-none px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 shadow-xl text-xs font-mono text-zinc-100 backdrop-blur-md"
                  style={{ left: `${Math.min(chartWidth - 140, Math.max(20, getX(hoveredIndex)))}px` }}
                >
                  <div className="text-[10px] text-zinc-400">
                    Waktu: {history[hoveredIndex].timeLabel}
                  </div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span style={{ color }}>{label}:</span>
                    <span>
                      {currentValues[hoveredIndex]} {unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Incident Audit Log / Event Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                Audit Log Peristiwa & Anomali Sensor
              </h3>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setAlertFilter('all')}
                  className={`px-2.5 py-1 rounded-md border ${
                    alertFilter === 'all'
                      ? 'bg-zinc-800 text-white border-zinc-700'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Semua ({alerts.length})
                </button>
                <button
                  onClick={() => setAlertFilter('critical')}
                  className={`px-2.5 py-1 rounded-md border ${
                    alertFilter === 'critical'
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Kritis
                </button>
                <button
                  onClick={() => setAlertFilter('warning')}
                  className={`px-2.5 py-1 rounded-md border ${
                    alertFilter === 'warning'
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Peringatan
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/40">
              <div className="overflow-x-auto max-h-56">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 font-mono">
                    <tr>
                      <th className="p-2.5">WAKTU</th>
                      <th className="p-2.5">SEVERITY</th>
                      <th className="p-2.5">LOKASI RAK</th>
                      <th className="p-2.5">PESAN KEJADIAN</th>
                      <th className="p-2.5 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {filteredAlerts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-zinc-500 font-mono">
                          Tidak ada rekaman anomali pada filter ini. Sistem beroperasi normal.
                        </td>
                      </tr>
                    ) : (
                      filteredAlerts.map((alert) => (
                        <tr key={alert.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-2.5 font-mono text-zinc-400 whitespace-nowrap">
                            {alert.timestamp}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                alert.level === 'critical'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                  : 'bg-amber-950 text-amber-300 border border-amber-700'
                              }`}
                            >
                              {alert.level}
                            </span>
                          </td>
                          <td className="p-2.5 font-semibold text-zinc-200 whitespace-nowrap">
                            {alert.rackName}
                          </td>
                          <td className="p-2.5 text-zinc-300">{alert.message}</td>
                          <td className="p-2.5 text-right whitespace-nowrap">
                            {alert.acknowledged ? (
                              <span className="text-[11px] text-emerald-400 flex items-center justify-end gap-1 font-mono">
                                <CheckCircle className="w-3.5 h-3.5" /> Diakui
                              </span>
                            ) : (
                              <button
                                onClick={() => onAcknowledgeAlert(alert.id)}
                                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-[11px] font-medium transition-colors"
                              >
                                Konfirmasi
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
