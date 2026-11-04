import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Key,
  Shield,
  Wifi,
  RefreshCw,
  Copy,
  CheckCircle,
  CheckCircle2,
  Globe,
  Radio,
} from 'lucide-react';

interface JwtSecurityModalProps {
  onClose: () => void;
}

export const JwtSecurityModal: React.FC<JwtSecurityModalProps> = ({ onClose }) => {
  const [tokenCopied, setTokenCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(3600);
  const [tokenVersion, setTokenVersion] = useState(1);

  // Simulated JWT Payload
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload = {
    sub: 'dc-ops-admin-88952',
    name: 'Datacenter Senior Facility Engineer',
    role: 'datacenter_admin',
    facility_id: 'JKT-DC02',
    permissions: [
      'telemetry:read',
      'telemetry:subscribe',
      'thresholds:write',
      'alerts:acknowledge',
      'webhooks:dispatch',
    ],
    iat: Math.floor(Date.now() / 1000) - 300,
    exp: Math.floor(Date.now() / 1000) + secondsRemaining,
    jti: `sig-${tokenVersion}-${Math.random().toString(36).substring(2, 9)}`,
  };

  const simulatedToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
    JSON.stringify(payload)
  ).replace(/=/g, '')}.7K8x9pW3LqR2M6vT5yB1zN4X0sA8fD9jC2eH5gI8kL1`;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(simulatedToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleRefreshToken = () => {
    setSecondsRemaining(3600);
    setTokenVersion((v) => v + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-3xl max-h-[92vh] bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-zinc-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Keamanan JWT & Broker WebSocket Terenkripsi
              </h2>
              <p className="text-xs text-zinc-400">
                Otentikasi token Bearer, validasi klaim RBAC, dan audit protokol komunikasi WebSocket &lt;1 detik.
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm">
          {/* JWT Token Card */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>ACTIVE SESSION TOKEN (BEARER)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-400">
                  Kadaluarsa dalam: <strong className="text-emerald-400">{Math.floor(secondsRemaining / 60)}m {secondsRemaining % 60}s</strong>
                </span>

                <button
                  onClick={handleRefreshToken}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs transition-colors flex items-center gap-1"
                  title="Refresh Token"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono break-all text-zinc-300 pr-10">
                <span className="text-rose-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>.
                <span className="text-purple-400">{btoa(JSON.stringify(payload)).replace(/=/g, '')}</span>.
                <span className="text-cyan-400">7K8x9pW3LqR2M6vT5yB1zN4X0sA8fD9jC2eH5gI8kL1</span>
              </div>

              <button
                onClick={handleCopy}
                className="absolute right-2 top-2 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                title="Salin Token"
              >
                {tokenCopied ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Decoded Claims Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-zinc-400 font-mono uppercase">Header (Algorithm):</span>
                <pre className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-rose-300 font-mono mt-1">
                  {JSON.stringify(header, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-mono uppercase">Decoded Payload Claims:</span>
                <pre className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-purple-300 font-mono mt-1 max-h-36 overflow-y-auto">
                  {JSON.stringify(payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* WebSocket Broker Specs (<1s Latency Non-Functional Requirement) */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Wifi className="w-4 h-4 text-cyan-400" />
                Spesifikasi Broker WebSocket Real-Time
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                WSS PROTOCOL LIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">ENDPOINT</div>
                <div className="text-zinc-200 mt-0.5 truncate">wss://broker.datacenter.internal/v1</div>
              </div>

              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">LATENSI RATA-RATA</div>
                <div className="text-emerald-400 font-bold mt-0.5">42 ms (Batas &lt;1000 ms)</div>
              </div>

              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">CIPHER SUITE</div>
                <div className="text-cyan-300 mt-0.5">TLS_AES_256_GCM_SHA384</div>
              </div>
            </div>
          </div>

          {/* Browser Compatibility & Performance Audit */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-indigo-400" />
              Kompatibilitas Lingkungan & Non-Fungsional
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">WebGL 2.0</div>
                  <div className="text-[10px] text-zinc-400">Hardware Accelerated</div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Web Audio API</div>
                  <div className="text-[10px] text-zinc-400">Zero-File Synth</div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Target 60 FPS</div>
                  <div className="text-[10px] text-zinc-400">Smooth Loop Pacing</div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Cross-Browser</div>
                  <div className="text-[10px] text-zinc-400">Chrome, Safari, Firefox</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
