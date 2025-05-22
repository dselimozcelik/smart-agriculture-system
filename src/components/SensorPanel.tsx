import { useState, useEffect } from 'react';
import axios from 'axios';

interface PlantData {
  isPlanted: boolean;
  moisture: number;
  temperature: number;
  light: number;
  humidity: number;
  plantType?: string;
  imageUrl?: string;
  condition?: string;
  isClassified?: boolean;
  confidence?: number;
}

interface MQTTSensorData {
  temperature: number;
  humidity: number;
  ldr_analog: number;
  soil_moisture: number;
  timestamp: number;
}

interface SensorPanelProps {
  plant: PlantData;
  onClose: () => void;
  mqttData: MQTTSensorData;
  alwaysVisible?: boolean;
}

// API base URL
const API_URL = 'http://localhost:5001/api';

// Helper function to determine color based on value
const getStatusColor = (
  value: number, 
  { warning, critical, reverse = false }: { warning: number, critical: number, reverse?: boolean }
) => {
  if (reverse) {
    if (value <= critical) return 'text-status-critical';
    if (value <= warning) return 'text-status-warning';
    return 'text-status-healthy';
  } else {
    if (value >= critical) return 'text-status-critical';
    if (value >= warning) return 'text-status-warning';
    return 'text-status-healthy';
  }
};

// SVG gauge component
const CircularGauge = ({ 
  value, 
  max = 100, 
  label, 
  icon, 
  color = 'text-primary',
  warningThreshold = 70,
  criticalThreshold = 90,
  reverse = false
}: { 
  value: number; 
  max?: number; 
  label: string; 
  icon: string;
  color?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  reverse?: boolean;
}) => {
  const percentage = (value / max) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const statusColor = getStatusColor(percentage, { 
    warning: warningThreshold, 
    critical: criticalThreshold,
    reverse
  });

  const isCritical = reverse 
    ? percentage <= criticalThreshold 
    : percentage >= criticalThreshold;

  const isWarning = !isCritical && (reverse 
    ? percentage <= warningThreshold 
    : percentage >= warningThreshold);

  // Modern color scheme
  const gaugeColor = isCritical 
    ? 'text-rose-700 dark:text-rose-400' 
    : isWarning 
    ? 'text-amber-700 dark:text-amber-400' 
    : 'text-emerald-700 dark:text-emerald-400';

  const backgroundClass = isCritical 
    ? 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/10 border-rose-200 dark:border-rose-800/30' 
    : isWarning 
    ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200 dark:border-amber-800/30' 
    : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-700/20 border-slate-200 dark:border-slate-700/30';

  const textClass = isCritical 
    ? 'text-rose-800 dark:text-rose-300' 
    : isWarning 
    ? 'text-amber-800 dark:text-amber-300' 
    : 'text-slate-800 dark:text-slate-300';

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${backgroundClass} shadow-sm`}>
      <div className="relative w-24 h-24">
        {/* Background ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            strokeWidth="10" 
            stroke="currentColor"
            fill="transparent"
            className="text-slate-300 dark:text-slate-700"
          />
          {/* Foreground ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={gaugeColor}
            strokeLinecap="round"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl mb-1">{icon}</span>
          <span className={`text-xl font-bold ${gaugeColor}`}>{value}{label === 'Temperature' ? '°C' : '%'}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-semibold text-black dark:text-white">{label}</span>
    </div>
  );
};

const SensorPanel = ({
  plant,
  onClose,
  mqttData,
  alwaysVisible = false
}: SensorPanelProps) => {
  // Format the plant type for display
  const getFormattedPlantType = () => {
    if (!plant || !plant.plantType) return 'MQTT Sensor Data';
    
    // Extract just the plant name before any underscores or special characters
    const basicName = plant.plantType
      .split('___')[0]  // Split on triple underscore first
      .split('__')[0]   // Split on double underscore
      .split('_')[0]    // Split on single underscore
      .replace(/,.*$/, '')  // Remove anything after a comma
      .replace(/\(.*\)/, '') // Remove anything in parentheses
      .trim();
    
    // Capitalize first letter
    return basicName.charAt(0).toUpperCase() + basicName.slice(1);
  };

  if (!mqttData) {
    return (
      <div className="bg-white dark:bg-grid rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-[400px]">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-text-dark">
            Loading sensor data...
          </h3>
          {!alwaysVisible && (
            <button 
              onClick={onClose}
              className="ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-grid rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-[400px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-text-dark mb-1">
            {alwaysVisible ? 'Live MQTT Sensor Data' : getFormattedPlantType()}
          </h3>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2 py-1 mr-2 rounded-full text-xs font-medium bg-blue-500 bg-opacity-10 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              ESP32 Sensors
            </span>
            <span className="text-xs text-gray-500">Last updated: {new Date(mqttData.timestamp * 1000).toLocaleTimeString()}</span>
          </div>
        </div>
        {!alwaysVisible && (
          <button 
            onClick={onClose}
            className="ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Sensor data */}
      <div className="grid grid-cols-2 gap-4">
        <CircularGauge 
          value={mqttData.soil_moisture} 
          label="Moisture" 
          icon="💧"
          warningThreshold={70}
          criticalThreshold={90}
        />
        <CircularGauge 
          value={mqttData.temperature} 
          label="Temperature" 
          icon="🌡️"
          warningThreshold={70}
          criticalThreshold={90}
        />
        <CircularGauge 
          value={mqttData.ldr_analog / 10} // Scale down for display
          label="Light" 
          icon="☀️"
          warningThreshold={20}
          criticalThreshold={10}
          reverse={true}
        />
        <CircularGauge 
          value={mqttData.humidity} 
          label="Humidity" 
          icon="💦"
          warningThreshold={30}
          criticalThreshold={20}
          reverse={true}
        />
      </div>
      
    </div>
  );
};

export default SensorPanel; 