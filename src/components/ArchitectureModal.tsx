import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Layers,
  Cpu,
  Server,
  Monitor,
  Flame,
  ShieldCheck,
  Zap,
  TrendingUp,
  Target,
  ArrowRight,
  Clock,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'intro' | 'architecture' | 'flow_kpi'>('intro');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[92vh] bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-zinc-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Spesifikasi Sistem, Latar Belakang & Arsitektur
              </h2>
              <p className="text-xs text-zinc-400">
                Dokumentasi teknis menyeluruh, arsitektur 3-lapisan IoT-Broker-3D, serta metrik kesuksesan KPI.
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

        {/* Tab Navigator */}
        <div className="flex items-center border-b border-zinc-800 px-4 bg-zinc-900/30 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('intro')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'intro'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pendahuluan & Tujuan Produk</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Arsitektur 3 Lapisan (IoT & Broker)</span>
          </button>

          <button
            onClick={() => setActiveTab('flow_kpi')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'flow_kpi'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>User Flow & Metrik Kesuksesan</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm">
          {/* TAB 1: Pendahuluan & Tujuan Produk */}
          {activeTab === 'intro' && (
            <div className="space-y-6">
              {/* Latar Belakang */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  1. Latar Belakang & Urgensi Monitoring Fisik Server
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Di era komputasi awan dan AI berkecepatan tinggi, kegagalan fisik infrastruktur server menyumbang lebih dari <strong className="text-white">40% insiden downtime tak terencana</strong>. Data center modern memerlukan pemantauan kondisi lingkungan fisik secara simultan dan berkelanjutan:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                      <Flame className="w-4 h-4" /> Thermal Runaway
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Penumpukan panas di hot aisle memicu degradasi silikon CPU/GPU, thermal throttling kinerja, dan kegagalan kapasitor VRM motherboard.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                      <Zap className="w-4 h-4" /> Kelembaban & ESD
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      RH di bawah 40% memicu lonjakan muatan listrik statis (ESD), sedangkan RH di atas 60% memicu kondensasi uap air dan korosi sirkuit PCB.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs">
                      <ShieldCheck className="w-4 h-4" /> Bahaya Kebakaran / Gas
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Sensor gas/asap MQ-2 mendeteksi pirolisis isolasi kabel sebelum api terbuka muncul, meminimalkan potensi kebakaran total pada rak.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tujuan Produk (Product Goals) */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  2. Tujuan Produk (Product Goals)
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-0.5">Real-Time Spatial Awareness</h4>
                      <p className="text-zinc-400 text-[11px]">
                        Menyajikan Digital Twin 3D interaktif yang merefleksikan posisi spasial rak server secara akurat (Hot Aisle vs Cold Aisle containment, ventilasi CRAC, dan zonasi rak). Operator dapat langsung melihat lokasi hotspot tanpa menebak nomor U-rack di spreadsheet 2D.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-0.5">Early Warning System (EWS) Multi-Tingkat</h4>
                      <p className="text-zinc-400 text-[11px]">
                        Mendeteksi deviasi ambang batas suhu, kelembaban, dan gas dalam hitungan detik. Menggabungkan visualisasi lampu beacon 3D berkedip, sirine audio Web Audio API, serta dispatch pesan darurat instan via Webhook WhatsApp dan Telegram.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-0.5">Performa 3D WebGL Optimal (60 FPS)</h4>
                      <p className="text-zinc-400 text-[11px]">
                        Dirancang dengan teknik rendering modern Three.js: deteksi software GL, instancing geometri, pembersihan memory garbage collection, dan pacing frame rate untuk kelancaran navigasi di berbagai spesifikasi browser.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Arsitektur 3 Lapisan */}
          {activeTab === 'architecture' && (
            <div className="space-y-5">
              <p className="text-xs text-zinc-400">
                Sistem dirancang dengan arsitektur decoupled end-to-end dari node fisik di ruang server hingga visualisasi browser pengguna:
              </p>

              {/* 3 Tier Visual Diagram */}
              <div className="space-y-3">
                {/* Layer 1: Hardware & IoT */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-emerald-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <Cpu className="w-4 h-4" />
                      Lapisan 1: Hardware & IoT Edge Layer
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Edge Telemetry
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Modul sensor yang terpasang langsung di rak server, kabel intake/exhaust, dan unit pendingin AC (CRAC):
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono pt-1">
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Sensor Suhu & RH: DHT22 / BME280 (Akurasi ±0.5°C)
                    </li>
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Sensor Asap/Gas: MQ-2 Flammable & Smoke Gas PPM
                    </li>
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Power & Tachometer: CT Clamp KWh Meter & Fan Hall Sensor
                    </li>
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Microcontroller: ESP32 Dual-Core (WiFi / RS485 Modbus)
                    </li>
                  </ul>
                </div>

                {/* Layer 2: Backend & Broker */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-cyan-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                      <Server className="w-4 h-4" />
                      Lapisan 2: Backend & Realtime Message Broker
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      &lt;1 Detik Latency
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Pusat agregasi data real-time, evaluasi ambang batas (Threshold Engine), dan otentikasi token:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono pt-1">
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Broker Protokol: MQTT Broker (EMQX) & WebSocket Gateway
                    </li>
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Keamanan: JSON Web Token (JWT) Bearer Auth & HMAC-SHA256
                    </li>
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Event Engine: Evaluasi ambang batas ASHRAE secara instan
                    </li>
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Alert Dispatcher: Webhook Trigger WhatsApp Cloud API & Telegram Bot
                    </li>
                  </ul>
                </div>

                {/* Layer 3: Frontend Dashboard 3D */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-indigo-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                      <Monitor className="w-4 h-4" />
                      Lapisan 3: Frontend 3D Three.js Digital Twin
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      WebGL 60 FPS
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Aplikasi Single-Page React + Three.js dengan visualisasi spasial 3D resolusi tinggi:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono pt-1">
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Three.js WebGL: PBR MeshPhysicalMaterial, RoomEnvironment
                    </li>
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Raycasting Interaktif: Deteksi klik rak & tooltip dinamis
                    </li>
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Dynamic Beacon & Heatmap: Status warna Hijau/Kuning/Merah kedip
                    </li>
                    <li className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      • Web Audio Synthesizer: Sirine darurat tanpa aset file eksternal
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: User Flow & KPI Kesuksesan */}
          {activeTab === 'flow_kpi' && (
            <div className="space-y-6">
              {/* User Flow Stepper */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                  Alur Pengguna & Penanganan Insiden (User Flow)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">LANGKAH 1</span>
                      <h4 className="font-bold text-white mt-1">Pemantauan 3D</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Operator memantau ruang server global via mode Isometric atau Hot Aisle.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-amber-400 font-bold">LANGKAH 2</span>
                      <h4 className="font-bold text-white mt-1">Deteksi Anomali</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Sensor membaca lonjakan suhu / gas, memicu warna kuning atau merah berkedip.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-rose-400 font-bold">LANGKAH 3</span>
                      <h4 className="font-bold text-white mt-1">Alarm & Webhook</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Sirine audio berbunyi, webhook WhatsApp & Telegram terkirim otomatis ke tim.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-indigo-400 font-bold">LANGKAH 4</span>
                      <h4 className="font-bold text-white mt-1">Inspeksi Rak</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Klik pada rak 3D membuka drawer telemetri blade server & log tren time-series.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">LANGKAH 5</span>
                      <h4 className="font-bold text-white mt-1">Remediasi & Ack</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Teknisi mematikan beban / memulihkan pendingin, dan mengonfirmasi status insiden.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Kesuksesan */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Metrik Kesuksesan (Success Metrics Scorecard)
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase">Target Framerate 3D</span>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">60 FPS</div>
                    <span className="text-[10px] text-zinc-500">Render time &lt; 16.6 ms</span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase">Latensi WebSocket</span>
                    <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">&lt; 1.0 Detik</div>
                    <span className="text-[10px] text-zinc-500">Rata-rata 42ms live broker</span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase">MTTD (Mean Time to Detect)</span>
                    <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">&lt; 30 Detik</div>
                    <span className="text-[10px] text-zinc-500">Sebelumnya: 15-30 menit</span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase">Pencegahan Kerusakan</span>
                    <div className="text-xl font-bold font-mono text-purple-400 mt-0.5">100%</div>
                    <span className="text-[10px] text-zinc-500">Zero undetected thermal runaway</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
