import { useState, useEffect } from 'react';
import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:5001/api';

interface SensorData {
  temperature: number;
  humidity: number;
  ldr_analog: number;
  soil_moisture: number;
  timestamp: number;
}

const SensorDashboard = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 0,
    humidity: 0,
    ldr_analog: 0,
    soil_moisture: 0,
    timestamp: 0
  });
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await axios.get(`${API_URL}/sensors`);
        setSensorData(response.data);
        
        // Add to history with timestamp
        setHistory(prev => {
          const newHistory = [...prev, response.data];
          // Keep only the latest 20 readings
          return newHistory.slice(-20);
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError('Failed to load sensor data');
        setLoading(false);
      }
    };

    // Initial fetch
    fetchSensorData();

    // Set up polling every 2 seconds
    const interval = setInterval(fetchSensorData, 2000);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);

  // Function to determine status color based on value
  const getStatusColor = (value: number, type: 'temperature' | 'humidity' | 'light' | 'moisture') => {
    switch(type) {
      case 'temperature':
        if (value > 30) return 'text-red-500';
        if (value < 15) return 'text-blue-500';
        return 'text-green-500';
      case 'humidity':
        if (value < 30) return 'text-red-500';
        if (value > 80) return 'text-blue-500';
        return 'text-green-500';
      case 'light':
        if (value < 200) return 'text-red-500';
        if (value > 800) return 'text-yellow-500';
        return 'text-green-500';
      case 'moisture':
        if (value < 30) return 'text-red-500';
        if (value > 80) return 'text-blue-500';
        return 'text-green-500';
      default:
        return 'text-gray-700';
    }
  };

  // Create gauge component
  const Gauge = ({ value, max, min, type, label, unit }: { 
    value: number, 
    max: number, 
    min: number, 
    type: 'temperature' | 'humidity' | 'light' | 'moisture',
    label: string,
    unit: string
  }) => {
    // Calculate percentage (clamped between 0-100)
    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    
    // Get status color
    const color = getStatusColor(value, type);
    
    return (
      <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
          <span className={`text-xl font-bold ${color}`}>
            {value.toFixed(1)}{unit}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className={`h-4 rounded-full ${
              type === 'temperature' ? 'bg-gradient-to-r from-blue-500 via-green-500 to-red-500' :
              type === 'humidity' ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500' :
              type === 'light' ? 'bg-gradient-to-r from-gray-500 via-yellow-400 to-yellow-200' :
              'bg-gradient-to-r from-red-500 via-green-500 to-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#2DA35E] flex items-center justify-center text-white">
          <span className="text-xl">📊</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">MQTT Sensor Dashboard</h2>
          <p className="text-sm text-gray-500">Real-time sensor data from ESP32</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Gauge 
          value={sensorData.temperature} 
          min={0} 
          max={50} 
          type="temperature" 
          label="Temperature" 
          unit="°C" 
        />
        <Gauge 
          value={sensorData.humidity} 
          min={0} 
          max={100} 
          type="humidity" 
          label="Humidity" 
          unit="%" 
        />
        <Gauge 
          value={sensorData.ldr_analog} 
          min={0} 
          max={1023} 
          type="light" 
          label="Light Level" 
          unit="" 
        />
        <Gauge 
          value={sensorData.soil_moisture} 
          min={0} 
          max={100} 
          type="moisture" 
          label="Soil Moisture" 
          unit="%" 
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Latest Readings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature (°C)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidity (%)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Light Level</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soil Moisture (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.slice().reverse().slice(0, 5).map((data, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(data.timestamp * 1000).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {data.temperature.toFixed(1)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {data.humidity.toFixed(1)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {data.ldr_analog}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {data.soil_moisture}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SensorDashboard;