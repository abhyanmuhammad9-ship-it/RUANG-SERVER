import {
  RackSensorData,
  ZoneData,
  AlertEvent,
  ThresholdConfig,
  WebhookConfig,
  TimeSeriesPoint,
  SimulationScenario,
  StatusLevel,
} from '../types/datacenter';

// Default threshold settings based on ASHRAE TC 9.9 Thermal Guidelines for Data Processing Environments
export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  tempWarning: 26.0,
  tempCritical: 31.0,
  humidityMin: 40.0,
  humidityMax: 60.0,
  smokeWarningPpm: 50.0,
  smokeCriticalPpm: 90.0,
  powerWarningKw: 8.5,
};

export const DEFAULT_WEBHOOKS: WebhookConfig = {
  whatsappEnabled: true,
  whatsappApiUrl: 'https://api.whatsapp.com/v1/messages/datacenter-alerts',
  whatsappPhone: '+6281298765432',
  whatsappApiKey: 'wa_live_tok_dc99x_sec',
  telegramEnabled: true,
  telegramBotToken: 'bot678912345:AAH_dcMonitoringBotToken',
  telegramChatId: '-1001928374650',
};

// Layout coordinates in 3D scene (X, Y, Z)
// Hot aisle is down the center Z, cold aisles outside
export const INITIAL_RACKS: RackSensorData[] = [
  {
    id: 'rack-a1',
    name: 'Rack A1 (Compute)',
    zoneId: 'zone-a',
    zoneName: 'Zone A - General Compute',
    row: 0,
    col: 0,
    position: [-3.2, 0, -2.4],
    temperature: 21.8,
    humidity: 48.5,
    smokePpm: 18.2,
    smokeDetected: false,
    powerKw: 5.4,
    status: 'normal',
    fanRpm: 3800,
    ipAddress: '10.24.10.11',
    macAddress: '00:1A:2B:3C:4D:11',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
    blades: [
      { id: 'b1', name: 'Node 01-Web', slot: 1, status: 'normal', cpuTemp: 44, load: 38, fanSpeed: 3800 },
      { id: 'b2', name: 'Node 02-Web', slot: 2, status: 'normal', cpuTemp: 46, load: 42, fanSpeed: 3900 },
      { id: 'b3', name: 'Node 03-App', slot: 3, status: 'normal', cpuTemp: 45, load: 39, fanSpeed: 3800 },
      { id: 'b4', name: 'Node 04-App', slot: 4, status: 'normal', cpuTemp: 47, load: 45, fanSpeed: 4000 },
    ],
  },
  {
    id: 'rack-a2',
    name: 'Rack A2 (Compute)',
    zoneId: 'zone-a',
    zoneName: 'Zone A - General Compute',
    row: 0,
    col: 1,
    position: [0, 0, -2.4],
    temperature: 22.4,
    humidity: 47.9,
    smokePpm: 19.1,
    smokeDetected: false,
    powerKw: 5.8,
    status: 'normal',
    fanRpm: 3950,
    ipAddress: '10.24.10.12',
    macAddress: '00:1A:2B:3C:4D:12',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
    blades: [
      { id: 'b5', name: 'Node 05-K8s-Worker', slot: 1, status: 'normal', cpuTemp: 48, load: 52, fanSpeed: 4100 },
      { id: 'b6', name: 'Node 06-K8s-Worker', slot: 2, status: 'normal', cpuTemp: 49, load: 55, fanSpeed: 4200 },
      { id: 'b7', name: 'Node 07-Ingress', slot: 3, status: 'normal', cpuTemp: 43, load: 35, fanSpeed: 3700 },
      { id: 'b8', name: 'Node 08-Ingress', slot: 4, status: 'normal', cpuTemp: 44, load: 37, fanSpeed: 3750 },
    ],
  },
  {
    id: 'rack-b1',
    name: 'Rack B1 (Storage/SAN)',
    zoneId: 'zone-b',
    zoneName: 'Zone B - Storage & Database',
    row: 0,
    col: 2,
    position: [3.2, 0, -2.4],
    temperature: 23.1,
    humidity: 50.2,
    smokePpm: 21.0,
    smokeDetected: false,
    powerKw: 6.2,
    status: 'normal',
    fanRpm: 4100,
    ipAddress: '10.24.20.21',
    macAddress: '00:1A:2B:3C:4D:21',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
    blades: [
      { id: 'b9', name: 'NVMe-Array-01', slot: 1, status: 'normal', cpuTemp: 49, load: 48, fanSpeed: 4100 },
      { id: 'b10', name: 'NVMe-Array-02', slot: 2, status: 'normal', cpuTemp: 51, load: 50, fanSpeed: 4250 },
      { id: 'b11', name: 'Ceph-OSD-01', slot: 3, status: 'normal', cpuTemp: 47, load: 44, fanSpeed: 4000 },
      { id: 'b12', name: 'Ceph-OSD-02', slot: 4, status: 'normal', cpuTemp: 46, load: 43, fanSpeed: 3950 },
    ],
  },
  {
    id: 'rack-b2',
    name: 'Rack B2 (Database Cluster)',
    zoneId: 'zone-b',
    zoneName: 'Zone B - Storage & Database',
    row: 1,
    col: 0,
    position: [-3.2, 0, 2.4],
    temperature: 23.8,
    humidity: 49.0,
    smokePpm: 22.4,
    smokeDetected: false,
    powerKw: 7.1,
    status: 'normal',
    fanRpm: 4300,
    ipAddress: '10.24.20.22',
    macAddress: '00:1A:2B:3C:4D:22',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
    blades: [
      { id: 'b13', name: 'PostgreSQL-Primary', slot: 1, status: 'normal', cpuTemp: 53, load: 62, fanSpeed: 4400 },
      { id: 'b14', name: 'PostgreSQL-Standby', slot: 2, status: 'normal', cpuTemp: 48, load: 45, fanSpeed: 4100 },
      { id: 'b15', name: 'Redis-Cluster-01', slot: 3, status: 'normal', cpuTemp: 45, load: 38, fanSpeed: 3900 },
      { id: 'b16', name: 'Kafka-Broker-01', slot: 4, status: 'normal', cpuTemp: 50, load: 58, fanSpeed: 4300 },
    ],
  },
  {
    id: 'rack-c1',
    name: 'Rack C1 (AI Inference)',
    zoneId: 'zone-c',
    zoneName: 'Zone C - AI & High-Density GPU',
    row: 1,
    col: 1,
    position: [0, 0, 2.4],
    temperature: 24.5,
    humidity: 46.2,
    smokePpm: 23.5,
    smokeDetected: false,
    powerKw: 7.9,
    status: 'normal',
    fanRpm: 4600,
    ipAddress: '10.24.30.31',
    macAddress: '00:1A:2B:3C:4D:31',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
    blades: [
      { id: 'b17', name: 'HGX-H100-Node-01', slot: 1, status: 'normal', cpuTemp: 58, load: 68, fanSpeed: 4800 },
      { id: 'b18', name: 'HGX-H100-Node-02', slot: 2, status: 'normal', cpuTemp: 60, load: 72, fanSpeed: 5000 },
      { id: 'b19', name: 'vLLM-Serving-01', slot: 3, status: 'normal', cpuTemp: 54, load: 61, fanSpeed: 4500 },
      { id: 'b20', name: 'InfiniBand-Switch', slot: 4, status: 'normal', cpuTemp: 42, load: 30, fanSpeed: 3800 },
    ],
  },
  {
    id: 'rack-c2',
    name: 'Rack C2 (AI Deep Learning)',
    zoneId: 'zone-c',
    zoneName: 'Zone C - AI & High-Density GPU',
    row: 1,
    col: 2,
    position: [3.2, 0, 2.4],
    temperature: 24.1,
    humidity: 45.8,
    smokePpm: 22.1,
    smokeDetected: false,
    powerKw: 8.2,
    status: 'normal',
    fanRpm: 4750,
    ipAddress: '10.24.30.32',
    macAddress: '00:1A:2B:3C:4D:32',
    lastUpdated: new Date().toLocaleTimeString('id-ID'),
    blades: [
      { id: 'b21', name: 'DGX-A100-Trainer-01', slot: 1, status: 'normal', cpuTemp: 61, load: 75, fanSpeed: 5100 },
      { id: 'b22', name: 'DGX-A100-Trainer-02', slot: 2, status: 'normal', cpuTemp: 59, load: 70, fanSpeed: 4950 },
      { id: 'b23', name: 'TensorRT-Optimizer', slot: 3, status: 'normal', cpuTemp: 52, load: 55, fanSpeed: 4400 },
      { id: 'b24', name: 'Storage-Cache-Scratch', slot: 4, status: 'normal', cpuTemp: 46, load: 40, fanSpeed: 3900 },
    ],
  },
];

export const INITIAL_ZONES: ZoneData[] = [
  {
    id: 'zone-a',
    name: 'Zona A - General Compute',
    description: 'Kluster server web frontend, microservices, dan kubernetes workers.',
    avgTemp: 22.1,
    avgHumidity: 48.2,
    maxSmokePpm: 19.1,
    status: 'normal',
    rackIds: ['rack-a1', 'rack-a2'],
  },
  {
    id: 'zone-b',
    name: 'Zona B - Storage & DB',
    description: 'All-flash NVMe SAN array, Ceph distributed storage, dan PostgreSQL primary.',
    avgTemp: 23.4,
    avgHumidity: 49.6,
    maxSmokePpm: 22.4,
    status: 'normal',
    rackIds: ['rack-b1', 'rack-b2'],
  },
  {
    id: 'zone-c',
    name: 'Zona C - AI & High-Density GPU',
    description: 'Inference node cluster H100/A100 dengan liquid-assisted air cooling manifold.',
    avgTemp: 24.3,
    avgHumidity: 46.0,
    maxSmokePpm: 23.5,
    status: 'normal',
    rackIds: ['rack-c1', 'rack-c2'],
  },
];

/**
 * Generate simulated initial historical time-series points
 */
export function generateInitialHistory(points = 24): TimeSeriesPoint[] {
  const result: TimeSeriesPoint[] = [];
  const now = Date.now();
  const stepMs = 5 * 60 * 1000; // 5 min interval

  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    const hour = t.getHours().toString().padStart(2, '0');
    const min = t.getMinutes().toString().padStart(2, '0');
    const noise = Math.sin(i * 0.4) * 0.8 + (Math.random() - 0.5) * 0.5;

    result.push({
      timestamp: t.toISOString(),
      timeLabel: `${hour}:${min}`,
      avgTemp: Number((22.5 + noise).toFixed(1)),
      maxTemp: Number((24.2 + noise * 1.2).toFixed(1)),
      avgHumidity: Number((48.0 - noise * 0.6).toFixed(1)),
      avgSmokePpm: Number((20.0 + Math.random() * 4).toFixed(1)),
      totalPowerKw: Number((38.0 + noise * 2.5).toFixed(1)),
    });
  }

  return result;
}

/**
 * Determine StatusLevel based on reading and thresholds
 */
export function evaluateRackStatus(
  rack: RackSensorData,
  thresholds: ThresholdConfig
): { status: StatusLevel; triggerReason?: string } {
  // Check smoke / gas critical first
  if (rack.smokePpm >= thresholds.smokeCriticalPpm || rack.smokeDetected) {
    return {
      status: 'critical',
      triggerReason: `Sensor gas/asap terdeteksi ${rack.smokePpm.toFixed(1)} PPM (Ambang Kritis: ${thresholds.smokeCriticalPpm} PPM)`,
    };
  }

  // Check temperature critical
  if (rack.temperature >= thresholds.tempCritical) {
    return {
      status: 'critical',
      triggerReason: `Suhu mencapai ${rack.temperature.toFixed(1)}°C (Ambang Kritis: ${thresholds.tempCritical}°C)`,
    };
  }

  // Check temperature warning
  if (rack.temperature >= thresholds.tempWarning) {
    return {
      status: 'warning',
      triggerReason: `Suhu meningkat ${rack.temperature.toFixed(1)}°C (Ambang Peringatan: ${thresholds.tempWarning}°C)`,
    };
  }

  // Check smoke warning
  if (rack.smokePpm >= thresholds.smokeWarningPpm) {
    return {
      status: 'warning',
      triggerReason: `Konsentrasi asap/gas meningkat ${rack.smokePpm.toFixed(1)} PPM`,
    };
  }

  // Check humidity bounds
  if (rack.humidity < thresholds.humidityMin || rack.humidity > thresholds.humidityMax) {
    return {
      status: 'warning',
      triggerReason: `Kelembaban ${rack.humidity.toFixed(1)}% di luar batas aman (${thresholds.humidityMin}% - ${thresholds.humidityMax}%)`,
    };
  }

  // Check power warning
  if (rack.powerKw >= thresholds.powerWarningKw) {
    return {
      status: 'warning',
      triggerReason: `Konsumsi daya tinggi ${rack.powerKw.toFixed(1)} kW (Batas: ${thresholds.powerWarningKw} kW)`,
    };
  }

  return { status: 'normal' };
}

/**
 * Simulate stochastic tick with scenario impact
 */
export function simulateTick(
  prevRacks: RackSensorData[],
  scenario: SimulationScenario,
  thresholds: ThresholdConfig
): { racks: RackSensorData[]; newAlerts: AlertEvent[] } {
  const newAlerts: AlertEvent[] = [];
  const timestampStr = new Date().toLocaleTimeString('id-ID');

  const updatedRacks = prevRacks.map((rack) => {
    let targetTemp = 22.0;
    let targetHumidity = 48.0;
    let targetSmoke = 20.0;
    let targetPower = 6.0;
    let smokeFlag = false;

    // Apply Scenario Behaviors
    if (scenario === 'thermal_spike') {
      if (rack.id === 'rack-b2') {
        // Dramatic thermal runaway on Database rack
        targetTemp = 34.6;
        targetPower = 9.4;
      } else if (rack.id === 'rack-b1') {
        targetTemp = 28.5;
      }
    } else if (scenario === 'ac_failure') {
      // Entire server hall heats up gradually
      targetTemp = 32.2;
      targetHumidity = 66.5; // moisture accumulation
    } else if (scenario === 'smoke_hazard') {
      if (rack.id === 'rack-c1') {
        targetSmoke = 185.0;
        smokeFlag = true;
        targetTemp = 33.0;
      } else if (rack.id === 'rack-c2') {
        targetSmoke = 75.0;
      }
    } else if (scenario === 'high_gpu_load') {
      if (rack.zoneId === 'zone-c') {
        targetTemp = 28.8;
        targetPower = 9.8;
      }
    }

    // Smooth inertia physics towards target
    const alpha = 0.15;
    const tempNoise = (Math.random() - 0.5) * 0.3;
    const newTemp = Math.max(16, Number((rack.temperature + (targetTemp - rack.temperature) * alpha + tempNoise).toFixed(1)));

    const humNoise = (Math.random() - 0.5) * 0.4;
    const newHum = Math.min(95, Math.max(20, Number((rack.humidity + (targetHumidity - rack.humidity) * alpha + humNoise).toFixed(1))));

    const smokeNoise = (Math.random() - 0.5) * 1.5;
    const newSmoke = Math.max(10, Number((rack.smokePpm + (targetSmoke - rack.smokePpm) * alpha + smokeNoise).toFixed(1)));

    const newPower = Number((rack.powerKw + (targetPower - rack.powerKw) * alpha + (Math.random() - 0.5) * 0.2).toFixed(1));

    // Dynamic fan speed response based on temperature
    const fanSpeed = Math.min(7200, Math.max(3200, Math.round(3000 + (newTemp - 20) * 260)));

    // Update blades
    const updatedBlades = rack.blades.map((b) => {
      const bladeTemp = Math.round(newTemp * 1.8 + (Math.random() * 8));
      const bladeStatus: StatusLevel =
        bladeTemp >= 75 ? 'critical' : bladeTemp >= 62 ? 'warning' : 'normal';
      return {
        ...b,
        cpuTemp: bladeTemp,
        status: bladeStatus,
        fanSpeed,
      };
    });

    const candidateRack: RackSensorData = {
      ...rack,
      temperature: newTemp,
      humidity: newHum,
      smokePpm: newSmoke,
      smokeDetected: smokeFlag || newSmoke >= thresholds.smokeCriticalPpm,
      powerKw: newPower,
      fanRpm: fanSpeed,
      blades: updatedBlades,
      lastUpdated: timestampStr,
      status: 'normal',
    };

    const evalResult = evaluateRackStatus(candidateRack, thresholds);
    candidateRack.status = evalResult.status;

    // If transitioned into warning or critical from normal, produce alert event
    if (evalResult.status !== 'normal' && rack.status !== evalResult.status) {
      newAlerts.push({
        id: `alert-${Date.now()}-${candidateRack.id}`,
        timestamp: timestampStr,
        rackId: candidateRack.id,
        rackName: candidateRack.name,
        zoneName: candidateRack.zoneName,
        level: evalResult.status,
        sensorType:
          candidateRack.smokeDetected || candidateRack.smokePpm >= thresholds.smokeWarningPpm
            ? 'smoke'
            : candidateRack.temperature >= thresholds.tempWarning
            ? 'temperature'
            : 'humidity',
        value:
          candidateRack.smokeDetected || candidateRack.smokePpm >= thresholds.smokeWarningPpm
            ? candidateRack.smokePpm
            : candidateRack.temperature,
        threshold:
          evalResult.status === 'critical' ? thresholds.tempCritical : thresholds.tempWarning,
        message: evalResult.triggerReason || 'Anomali ambang sensor terdeteksi',
        acknowledged: false,
        resolved: false,
      });
    }

    return candidateRack;
  });

  return { racks: updatedRacks, newAlerts };
}

/**
 * Recompute zone statistics from rack readings
 */
export function computeZoneStats(racks: RackSensorData[], zones: ZoneData[]): ZoneData[] {
  return zones.map((zone) => {
    const zoneRacks = racks.filter((r) => r.zoneId === zone.id);
    if (zoneRacks.length === 0) return zone;

    const avgTemp = Number((zoneRacks.reduce((acc, r) => acc + r.temperature, 0) / zoneRacks.length).toFixed(1));
    const avgHumidity = Number((zoneRacks.reduce((acc, r) => acc + r.humidity, 0) / zoneRacks.length).toFixed(1));
    const maxSmokePpm = Number(Math.max(...zoneRacks.map((r) => r.smokePpm)).toFixed(1));

    const hasCritical = zoneRacks.some((r) => r.status === 'critical');
    const hasWarning = zoneRacks.some((r) => r.status === 'warning');
    const status: StatusLevel = hasCritical ? 'critical' : hasWarning ? 'warning' : 'normal';

    return {
      ...zone,
      avgTemp,
      avgHumidity,
      maxSmokePpm,
      status,
    };
  });
}
