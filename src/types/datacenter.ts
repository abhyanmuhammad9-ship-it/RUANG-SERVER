/**
 * Data models and interfaces for 3D Datacenter Digital Twin & Sensor Monitoring System
 */

export type StatusLevel = 'normal' | 'warning' | 'critical';

export interface BladeServer {
  id: string;
  name: string;
  slot: number; // 1U to 8U
  status: StatusLevel;
  cpuTemp: number; // °C
  load: number; // %
  fanSpeed: number; // RPM
}

export interface RackSensorData {
  id: string;
  name: string;
  zoneId: 'zone-a' | 'zone-b' | 'zone-c';
  zoneName: string;
  row: number; // 0 or 1
  col: number; // 0, 1, or 2
  position: [number, number, number]; // [x, y, z] in 3D space
  temperature: number; // °C
  humidity: number; // % RH
  smokePpm: number; // PPM
  smokeDetected: boolean;
  powerKw: number; // kW
  status: StatusLevel;
  fanRpm: number;
  ipAddress: string;
  macAddress: string;
  blades: BladeServer[];
  lastUpdated: string;
}

export interface ZoneData {
  id: 'zone-a' | 'zone-b' | 'zone-c';
  name: string;
  description: string;
  avgTemp: number;
  avgHumidity: number;
  maxSmokePpm: number;
  status: StatusLevel;
  rackIds: string[];
}

export interface AlertEvent {
  id: string;
  timestamp: string;
  rackId: string;
  rackName: string;
  zoneName: string;
  level: StatusLevel;
  sensorType: 'temperature' | 'humidity' | 'smoke' | 'power';
  value: number;
  threshold: number;
  message: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface ThresholdConfig {
  tempWarning: number; // default 25 °C
  tempCritical: number; // default 30 °C
  humidityMin: number; // default 40 %
  humidityMax: number; // default 60 %
  smokeWarningPpm: number; // default 60 PPM
  smokeCriticalPpm: number; // default 100 PPM
  powerWarningKw: number; // default 8.5 kW
}

export interface WebhookConfig {
  whatsappEnabled: boolean;
  whatsappApiUrl: string;
  whatsappPhone: string;
  whatsappApiKey: string;
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
}

export interface TimeSeriesPoint {
  timestamp: string;
  timeLabel: string;
  avgTemp: number;
  maxTemp: number;
  avgHumidity: number;
  avgSmokePpm: number;
  totalPowerKw: number;
}

export type SimulationScenario =
  | 'normal'
  | 'thermal_spike'
  | 'ac_failure'
  | 'smoke_hazard'
  | 'high_gpu_load';

export type CameraPreset =
  | 'isometric'
  | 'hot_aisle'
  | 'cold_aisle'
  | 'top_down'
  | 'rack_focus';
