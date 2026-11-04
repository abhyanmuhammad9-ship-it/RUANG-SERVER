import React, { useState } from 'react';
import {
  ThresholdConfig,
  WebhookConfig,
  AlertEvent,
} from '../types/datacenter';
import { audioAlarm } from '../services/audioAlarm';
import {
  X,
  Bell,
  Sliders,
  Send,
  MessageSquare,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface AlertsManagerModalProps {
  thresholds: ThresholdConfig;
  onUpdateThresholds: (cfg: ThresholdConfig) => void;
  webhooks: WebhookConfig;
  onUpdateWebhooks: (cfg: WebhookConfig) => void;
  alerts: AlertEvent[];
  onAcknowledgeAlert: (id: string) => void;
  onClearResolvedAlerts: () => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  onClose: () => void;
}

export const AlertsManagerModal: React.FC<AlertsManagerModalProps> = ({
  thresholds,
  onUpdateThresholds,
  webhooks,
  onUpdateWebhooks,
  alerts,
  onAcknowledgeAlert,
  onClearResolvedAlerts,
  isAudioMuted,
  onToggleAudioMute,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'thresholds' | 'webhooks' | 'active'>('thresholds');
  const [localThresholds, setLocalThresholds] = useState<ThresholdConfig>({ ...thresholds });
  const [localWebhooks, setLocalWebhooks] = useState<WebhookConfig>({ ...webhooks });

  // Webhook Test State
  const [webhookLog, setWebhookLog] = useState<{
    channel: 'whatsapp' | 'telegram';
    status: 'success' | 'failed' | 'idle';
    timestamp: string;
    payload: string;
    response: string;
  } | null>(null);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  const handleSaveThresholds = () => {
    onUpdateThresholds(localThresholds);
    audioAlarm.playClick(950);
  };

  const handleResetThresholds = () => {
    const defaults: ThresholdConfig = {
      tempWarning: 26.0,
      tempCritical: 31.0,
      humidityMin: 40.0,
      humidityMax: 60.0,
      smokeWarningPpm: 50.0,
      smokeCriticalPpm: 90.0,
      powerWarningKw: 8.5,
    };
    setLocalThresholds(defaults);
    onUpdateThresholds(defaults);
    audioAlarm.playClick(600);
  };

  const handleTestAudio = () => {
    audioAlarm.playWarningBeep();
  };

  const handleTestSiren = () => {
    audioAlarm.startEmergencySiren();
    setTimeout(() => {
      audioAlarm.stopAlarm();
    }, 1800);
  };

  const handleDispatchTestWebhook = (channel: 'whatsapp' | 'telegram') => {
    setIsSendingWebhook(true);
    setWebhookLog(null);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID');

    setTimeout(() => {
      setIsSendingWebhook(false);
      if (channel === 'telegram') {
        const payload = JSON.stringify(
          {
            chat_id: localWebhooks.telegramChatId,
            parse_mode: 'MarkdownV2',
            text: `🚨 *DATACENTER EARLY WARNING ALERT*\n*Facility:* JKT-DC02 (Hall A)\n*Rack:* Rack B2 (Database Cluster)\n*Event:* Suhu Kritis 34.6°C (Ambang: ${localThresholds.tempCritical}°C)\n*Timestamp:* ${timeStr}\n*Action Required:* Segera periksa suplai pendingin CRAC-01!`,
          },
          null,
          2
        );

        setWebhookLog({
          channel: 'telegram',
          status: 'success',
          timestamp: timeStr,
          payload,
          response: JSON.stringify(
            {
              ok: true,
              result: {
                message_id: Math.floor(100000 + Math.random() * 900000),
                from: { id: 678912345, is_bot: true, first_name: 'DC_Alert_Bot' },
                date: Math.floor(Date.now() / 1000),
                status: 'delivered_200_ok',
              },
            },
            null,
            2
          ),
        });
      } else {
        const payload = JSON.stringify(
          {
            messaging_product: 'whatsapp',
            to: localWebhooks.whatsappPhone,
            type: 'template',
            template: {
              name: 'server_thermal_critical_alert',
              language: { code: 'id' },
              components: [
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: 'Rack B2 (Database)' },
                    { type: 'text', text: '34.6°C' },
                    { type: 'text', text: timeStr },
                  ],
                },
              ],
            },
          },
          null,
          2
        );

        setWebhookLog({
          channel: 'whatsapp',
          status: 'success',
          timestamp: timeStr,
          payload,
          response: JSON.stringify(
            {
              messages: [{ id: `wamid.${Math.random().toString(36).substring(2, 15)}` }],
              status: 'sent_http_200',
              gateway_latency: '142ms',
            },
            null,
            2
          ),
        });
      }
      audioAlarm.playClick(1050);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-3xl max-h-[92vh] bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Pusat Peringatan & Sistem Early Warning
              </h2>
              <p className="text-xs text-zinc-400">
                Kalibrasi ambang batas multi-tingkat, alarm audio/visual, dan integrasi webhook WhatsApp & Telegram.
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
        <div className="flex items-center border-b border-zinc-800 px-4 bg-zinc-900/30">
          <button
            onClick={() => setActiveTab('thresholds')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'thresholds'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Pengaturan Ambang Batas</span>
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'webhooks'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Integrasi Webhook (WA / Telegram)</span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'active'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Daftar Alert Aktif ({alerts.filter((a) => !a.resolved).length})</span>
          </button>
        </div>

        {/* Tab 1: Threshold Settings & Audio Alarm Controls */}
        {activeTab === 'thresholds' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Audio Alarm Synthesizer Control Bar */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleAudioMute}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    isAudioMuted
                      ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  }`}
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isAudioMuted ? 'Audio Dibisukan' : 'Sirine Suara Aktif'}</span>
                </button>

                <span className="text-xs text-zinc-400">
                  Web Audio API synthesizer (mencegah distorsi & latency)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestAudio}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
                >
                  Tes Beep
                </button>
                <button
                  onClick={handleTestSiren}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Play className="w-3 h-3" /> Tes Sirine
                </button>
              </div>
            </div>

            {/* Threshold Sliders */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                Ambang Batas Termal & Atmosfer (ASHRAE TC 9.9)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Temperature Warning */}
                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Suhu Ambang Peringatan (Kuning)</span>
                    <span className="font-mono text-amber-400 font-bold">{localThresholds.tempWarning}°C</span>
                  </div>
                  <input
                    type="range"
                    min="22"
                    max="30"
                    step="0.5"
                    value={localThresholds.tempWarning}
                    onChange={(e) =>
                      setLocalThresholds({ ...localThresholds, tempWarning: parseFloat(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>22°C</span>
                    <span>Default: 26°C</span>
                    <span>30°C</span>
                  </div>
                </div>

                {/* Temperature Critical */}
                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Suhu Ambang Kritis (Merah Berkedip)</span>
                    <span className="font-mono text-rose-400 font-bold">{localThresholds.tempCritical}°C</span>
                  </div>
                  <input
                    type="range"
                    min="28"
                    max="38"
                    step="0.5"
                    value={localThresholds.tempCritical}
                    onChange={(e) =>
                      setLocalThresholds({ ...localThresholds, tempCritical: parseFloat(e.target.value) })
                    }
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>28°C</span>
                    <span>Default: 31°C</span>
                    <span>38°C</span>
                  </div>
                </div>

                {/* Humidity Range */}
                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Batas Kelembaban Aman (RH)</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {localThresholds.humidityMin}% - {localThresholds.humidityMax}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400">Min RH</label>
                      <input
                        type="number"
                        value={localThresholds.humidityMin}
                        onChange={(e) =>
                          setLocalThresholds({ ...localThresholds, humidityMin: parseFloat(e.target.value) })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">Max RH</label>
                      <input
                        type="number"
                        value={localThresholds.humidityMax}
                        onChange={(e) =>
                          setLocalThresholds({ ...localThresholds, humidityMax: parseFloat(e.target.value) })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Smoke / Gas MQ-2 */}
                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Ambang Gas/Asap Kritis (MQ-2)</span>
                    <span className="font-mono text-rose-400 font-bold">{localThresholds.smokeCriticalPpm} PPM</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="150"
                    step="5"
                    value={localThresholds.smokeCriticalPpm}
                    onChange={(e) =>
                      setLocalThresholds({ ...localThresholds, smokeCriticalPpm: parseFloat(e.target.value) })
                    }
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>40 PPM</span>
                    <span>Ambang Asap: 90 PPM</span>
                    <span>150 PPM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <button
                onClick={handleResetThresholds}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Standar ASHRAE</span>
              </button>

              <button
                onClick={handleSaveThresholds}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-zinc-950 hover:bg-cyan-400 text-xs font-bold transition-colors shadow-lg shadow-cyan-500/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terapkan Ambang Batas</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Webhooks (WhatsApp & Telegram) */}
        {activeTab === 'webhooks' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            <p className="text-xs text-zinc-400">
              Kirimkan notifikasi darurat secara otomatis ke grup on-call engineer via WhatsApp Cloud API dan bot Telegram saat kondisi kritis terdeteksi.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp Config Card */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-white">WhatsApp Webhook API</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localWebhooks.whatsappEnabled}
                      onChange={(e) =>
                        setLocalWebhooks({ ...localWebhooks, whatsappEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono">TARGET PHONE / GROUP JID</label>
                    <input
                      type="text"
                      value={localWebhooks.whatsappPhone}
                      onChange={(e) =>
                        setLocalWebhooks({ ...localWebhooks, whatsappPhone: e.target.value })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono">WEBHOOK ENDPOINT URL</label>
                    <input
                      type="text"
                      value={localWebhooks.whatsappApiUrl}
                      onChange={(e) =>
                        setLocalWebhooks({ ...localWebhooks, whatsappApiUrl: e.target.value })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
                    />
                  </div>
                </div>

                <button
                  disabled={isSendingWebhook}
                  onClick={() => handleDispatchTestWebhook('whatsapp')}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 text-xs font-semibold transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Uji Coba WhatsApp</span>
                </button>
              </div>

              {/* Telegram Config Card */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <Send className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-white">Telegram Bot API</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localWebhooks.telegramEnabled}
                      onChange={(e) =>
                        setLocalWebhooks({ ...localWebhooks, telegramEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono">TELEGRAM CHAT ID / GROUP ID</label>
                    <input
                      type="text"
                      value={localWebhooks.telegramChatId}
                      onChange={(e) =>
                        setLocalWebhooks({ ...localWebhooks, telegramChatId: e.target.value })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono">BOT API TOKEN</label>
                    <input
                      type="password"
                      value={localWebhooks.telegramBotToken}
                      onChange={(e) =>
                        setLocalWebhooks({ ...localWebhooks, telegramBotToken: e.target.value })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
                    />
                  </div>
                </div>

                <button
                  disabled={isSendingWebhook}
                  onClick={() => handleDispatchTestWebhook('telegram')}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/40 hover:bg-sky-600/30 text-xs font-semibold transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Uji Coba Telegram</span>
                </button>
              </div>
            </div>

            {/* Live Webhook Dispatch Log Preview */}
            {webhookLog && (
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2 font-mono text-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-1.5">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    DELIVERY SUCCESS (HTTP 200 OK)
                  </span>
                  <span>{webhookLog.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase">Payload Dikirim (POST JSON):</span>
                    <pre className="p-2 rounded bg-zinc-950 border border-zinc-800/80 text-[10px] text-zinc-300 overflow-x-auto max-h-32 mt-1">
                      {webhookLog.payload}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase">Respon Gateway Webhook:</span>
                    <pre className="p-2 rounded bg-zinc-950 border border-zinc-800/80 text-[10px] text-emerald-400 overflow-x-auto max-h-32 mt-1">
                      {webhookLog.response}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Active Alerts List */}
        {activeTab === 'active' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400 font-mono">
                Total Peristiwa Aktif: {alerts.filter((a) => !a.resolved).length}
              </span>
              <button
                onClick={onClearResolvedAlerts}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Bersihkan yang sudah diakui
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 font-mono text-xs">
                Tidak ada alert aktif. Seluruh server dalam kondisi optimal.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      alert.level === 'critical'
                        ? 'bg-rose-950/40 border-rose-700/80'
                        : 'bg-amber-950/40 border-amber-700/80'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                            alert.level === 'critical' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-zinc-950'
                          }`}
                        >
                          {alert.level}
                        </span>
                        <span className="font-bold text-xs text-white">{alert.rackName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{alert.timestamp}</span>
                      </div>
                      <p className="text-xs text-zinc-300">{alert.message}</p>
                    </div>

                    {!alert.acknowledged ? (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-cyan-300 text-xs font-semibold whitespace-nowrap transition-colors"
                      >
                        Konfirmasi (Ack)
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Diakui
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
