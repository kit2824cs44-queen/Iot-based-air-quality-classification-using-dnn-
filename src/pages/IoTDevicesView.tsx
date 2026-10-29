/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Battery,
  CheckCircle2,
  Cpu,
  Globe,
  Plus,
  Radio,
  Server,
  ShieldCheck,
  Wifi,
} from 'lucide-react';
import { DeviceInfo } from '../types/index.ts';
import { fetchDevices, registerDevice } from '../services/api.ts';

export const IoTDevicesView: React.FC = () => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    id: '',
    name: '',
    location: '',
    lat: 28.6139,
    lng: 77.2090,
  });
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const list = await fetchDevices();
      setDevices(list);
    } catch (err) {
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerDevice({
        id: newDevice.id.trim(),
        name: newDevice.name.trim(),
        location: newDevice.location.trim(),
        coordinates: { lat: newDevice.lat, lng: newDevice.lng },
      });
      setRegisterSuccess(`Sensor node ${newDevice.id} enrolled successfully!`);
      setShowAddModal(false);
      setNewDevice({ id: '', name: '', location: '', lat: 28.6139, lng: 77.2090 });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to register sensor node');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Enroll Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            IoT Sensor Fleet Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Physical hardware nodes and continuous telemetry transmitters deployed across monitoring quadrants
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Enroll New Sensor Node</span>
        </button>
      </div>

      {registerSuccess && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{registerSuccess}</span>
        </div>
      )}

      {/* Hardware Node Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {devices.map((dev) => {
          const isOnline = dev.status === 'online';
          return (
            <div
              key={dev.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-emerald-400 font-semibold">{dev.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      isOnline
                        ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
                        : 'bg-rose-950 border border-rose-700/60 text-rose-300'
                    }`}
                  >
                    {dev.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{dev.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{dev.location}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-slate-500" /> IP Address:
                  </span>
                  <span className="font-mono text-slate-200">{dev.ip_address || '192.168.1.101'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-slate-500" /> Battery:
                  </span>
                  <span className="font-mono text-emerald-400">{dev.battery_level ?? 98}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-slate-500" /> Firmware:
                  </span>
                  <span className="font-mono text-slate-300">{dev.firmware_version}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Packets Ingested:</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {dev.reading_count.toLocaleString()}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                  Heartbeat: {new Date(dev.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hardware Architecture & Sensor Node Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hardware Photo Asset Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="relative aspect-video w-full bg-slate-950">
            <img
              src="/src/assets/images/iot_sensor_station_1793250762126.jpg"
              alt="Outdoor IoT Environmental Sensor Monitoring Station"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 backdrop-blur border border-slate-700 rounded text-[11px] text-emerald-400 font-mono">
              Hardware Station: Model EQ-450
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-1">
              Field Deployment Architecture
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pole-mounted weatherproof enclosure featuring particulate laser scattering inlet, electrochemical gas sensing chambers, solar charging subsystem, and wireless telemetry antennas.
            </p>
          </div>
        </div>

        {/* Detailed Sensor Specifications */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Embedded Sensor Transducer Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
              <span className="font-semibold text-slate-200 block mb-1">Particulate Transducer (PMS5003)</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Measures PM2.5 and PM10 via 650nm semiconductor laser scattering principle with MIE optical calculation algorithms (Range: 0.3µm – 10µm; 0 – 1000 µg/m³).
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
              <span className="font-semibold text-slate-200 block mb-1">Electrochemical Gases (MQ / Figaro)</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                CO (MQ-7 heated SnO2 layer), NO2 (MICS-2714 metal oxide), SO2 (ZE03 high-sensitivity 3-electrode sensor), and O3 (MQ-131 surface resistance sensor).
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
              <span className="font-semibold text-slate-200 block mb-1">Microclimate Unit (SHT31)</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Sensirion CMOSens digital temperature sensor (±0.2°C accuracy) and capacitive relative humidity sensor (±2% RH accuracy).
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
              <span className="font-semibold text-slate-200 block mb-1">Microcontroller & Telemetry</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Espressif ESP32 dual-core Xtensa 32-bit LX6 @ 240MHz, 520 KB SRAM, 2.4GHz Wi-Fi + Bluetooth LE, fallback Quectel GPRS module.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Enroll New Device */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Enroll New Sensor Hardware Node</h3>
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Node Hardware ID (e.g. AQI-DEVICE-005)</label>
                <input
                  type="text"
                  required
                  placeholder="AQI-DEVICE-005"
                  value={newDevice.id}
                  onChange={(e) => setNewDevice({ ...newDevice, id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Station Friendly Name</label>
                <input
                  type="text"
                  required
                  placeholder="Suburban Residential Station"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Deployment Location Description</label>
                <input
                  type="text"
                  required
                  placeholder="Green Park Community Center, Sector 9"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded"
                >
                  Enroll Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
