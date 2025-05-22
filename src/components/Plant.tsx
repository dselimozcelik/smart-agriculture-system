import { useState, useEffect } from 'react';

interface MQTTSensorData {
  temperature: number;
  humidity: number;
  ldr_analog: number;
  soil_moisture: number;
  timestamp: number;
}

interface PlantProps {
  plantId?: string;
  title?: string;
  isPlanted?: boolean;
  moisture?: number; // 0-100
  temperature?: number; // in Celsius
  light?: number; // 0-100
  humidity?: number; // 0-100
  isSelected?: boolean;
  onSelect?: () => void;
  imageUrl?: string;
  plantType?: string;
  condition?: string;
  isClassified?: boolean;
  plantNumber?: number;
  mqttData?: MQTTSensorData | null;
}

const Plant = ({ 
  plantId, 
  title = '',
  isPlanted = false, 
  moisture = 50, 
  temperature = 25,
  light = 50,
  humidity = 50,
  isSelected = false,
  onSelect,
  imageUrl,
  plantType = '',
  condition = '',
  isClassified = false,
  plantNumber,
  mqttData
}: PlantProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Plant growth animations
  const [growth, setGrowth] = useState(0);
  
  useEffect(() => {
    if (isPlanted) {
      setGrowth(0);
      const timer = setTimeout(() => {
        setGrowth(100);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPlanted]);
  
  const getPlantStatus = () => {
    if (!isPlanted) return 'empty';
    
    // If the plant is classified, use that status
    if (isClassified && condition) {
      if (condition.includes('Healthy')) return 'healthy';
      if (condition.includes('Critical')) return 'critical';
      return 'warning';
    }
    
    // Otherwise use sensor data
    if (moisture < 30) return 'dry';
    if (moisture > 80) return 'wet';
    if (temperature > 30) return 'hot';
    if (temperature < 10) return 'cold';
    return 'healthy';
  };

  const getStatusDetails = () => {
    const status = getPlantStatus();
    switch (status) {
      case 'empty':
        return { 
          icon: null, 
          bgColor: 'bg-white', 
          hoverColor: 'hover:bg-gray-50',
          emptyText: 'Plant here' 
        };
      case 'dry':
        return { 
          icon: null, 
          bgColor: 'bg-status-warning bg-opacity-10 dark:bg-status-warning dark:bg-opacity-20', 
          borderColor: 'border-status-warning border-opacity-50',
          hoverColor: 'hover:bg-status-warning hover:bg-opacity-15 dark:hover:bg-status-warning dark:hover:bg-opacity-30',
          plantColor: 'text-status-warning'
        };
      case 'wet':
        return { 
          icon: null, 
          bgColor: 'bg-primary bg-opacity-10 dark:bg-primary dark:bg-opacity-20', 
          borderColor: 'border-primary border-opacity-50',
          hoverColor: 'hover:bg-primary hover:bg-opacity-15 dark:hover:bg-primary dark:hover:bg-opacity-30',
          plantColor: 'text-primary'
        };
      case 'hot':
        return { 
          icon: null, 
          bgColor: 'bg-status-critical bg-opacity-10 dark:bg-status-critical dark:bg-opacity-20', 
          borderColor: 'border-status-critical border-opacity-50',
          hoverColor: 'hover:bg-status-critical hover:bg-opacity-15 dark:hover:bg-status-critical dark:hover:bg-opacity-30',
          plantColor: 'text-status-critical'
        };
      case 'cold':
        return { 
          icon: null, 
          bgColor: 'bg-primary bg-opacity-10 dark:bg-primary dark:bg-opacity-20', 
          borderColor: 'border-primary border-opacity-50',
          hoverColor: 'hover:bg-primary hover:bg-opacity-15 dark:hover:bg-primary dark:hover:bg-opacity-30',
          plantColor: 'text-primary'
        };
      case 'healthy':
        return { 
          icon: null, 
          bgColor: 'bg-status-healthy bg-opacity-10 dark:bg-status-healthy dark:bg-opacity-20', 
          borderColor: 'border-status-healthy border-opacity-50',
          hoverColor: 'hover:bg-status-healthy hover:bg-opacity-15 dark:hover:bg-status-healthy dark:hover:bg-opacity-30',
          plantColor: 'text-status-healthy'
        };
      case 'critical':
        return { 
          icon: null, 
          bgColor: 'bg-status-critical bg-opacity-10 dark:bg-status-critical dark:bg-opacity-20', 
          borderColor: 'border-status-critical border-opacity-50',
          hoverColor: 'hover:bg-status-critical hover:bg-opacity-15 dark:hover:bg-status-critical dark:hover:bg-opacity-30',
          plantColor: 'text-status-critical'
        };
      case 'warning':
        return { 
          icon: null, 
          bgColor: 'bg-status-warning bg-opacity-10 dark:bg-status-warning dark:bg-opacity-20', 
          borderColor: 'border-status-warning border-opacity-50',
          hoverColor: 'hover:bg-status-warning hover:bg-opacity-15 dark:hover:bg-status-warning dark:hover:bg-opacity-30',
          plantColor: 'text-status-warning'
        };
      default:
        return { 
          icon: null, 
          bgColor: 'bg-status-healthy bg-opacity-10 dark:bg-status-healthy dark:bg-opacity-20', 
          borderColor: 'border-status-healthy border-opacity-50',
          hoverColor: 'hover:bg-status-healthy hover:bg-opacity-15 dark:hover:bg-status-healthy dark:hover:bg-opacity-30',
          plantColor: 'text-status-healthy'
        };
    }
  };

  const status = getStatusDetails();
  const plantStatus = getPlantStatus();

  // Check if we have MQTT data
  const hasMqttData = !!mqttData;

  return (
    <div 
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        w-full h-full
        rounded-md
        border
        transition-all duration-300
        relative
        overflow-hidden
        ${status.bgColor}
        ${status.borderColor || 'border-transparent'}
        ${!isPlanted ? status.hoverColor + ' cursor-pointer' : 'cursor-pointer ' + status.hoverColor}
        ${isSelected ? '!border-primary shadow-md scale-102 z-10' : ''}
        transform hover:scale-102 aspect-square
      `}
    >
      {!isPlanted ? (
        <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-text-dark dark:opacity-70">
          {isHovered ? (
            <span className="text-xs font-medium">{status.emptyText}</span>
          ) : (
            <span className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
          )}
        </div>
      ) : (
        <>
          {/* Plant image display */}
          {imageUrl ? (
            <div className="w-full h-full">
              <img 
                src={imageUrl} 
                alt={plantType || title} 
                className="w-full h-full object-cover"
              />
              
              {/* MQTT Data Overlay - always visible if MQTT data is available */}
              {hasMqttData && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-xs">
                  <div className="flex flex-wrap justify-between">
                    <div className="flex items-center mr-1">
                      <span className="mr-1">🌡️</span>
                      <span>{mqttData.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">💧</span>
                      <span>{mqttData.humidity.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Soil base */}
              <div className="absolute bottom-0 w-full h-1/5 bg-amber-800 bg-opacity-20 dark:bg-amber-950 dark:bg-opacity-40"></div>
              
              {/* Plant visualization */}
              <div className="absolute inset-0 flex items-center justify-center pt-2">
                <div className={`relative flex flex-col items-center ${status.plantColor} transition-transform duration-700 ease-out`} style={{ transform: `translateY(${100 - growth}%)` }}>
                  {/* Stem */}
                  <div className="w-1 h-7 bg-current rounded-full"></div>
                  
                  {/* Leaves */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-45">
                      <path d="M12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" fill="currentColor" fillOpacity="0.3"/>
                    </svg>
                  </div>
                  
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-45">
                      <path d="M12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" fill="currentColor" fillOpacity="0.3"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* MQTT Data Overlay for non-image plants */}
              {hasMqttData && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-xs">
                  <div className="flex flex-wrap justify-between">
                    <div className="flex items-center mr-1">
                      <span className="mr-1">🌡️</span>
                      <span>{mqttData.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">💧</span>
                      <span>{mqttData.humidity.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Status badge */}
          {plantStatus !== 'healthy' && (
            <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
              plantStatus === 'dry' ? 'bg-status-warning' : 
              plantStatus === 'wet' ? 'bg-primary' : 
              plantStatus === 'hot' || plantStatus === 'critical' ? 'bg-status-critical' : 
              plantStatus === 'warning' ? 'bg-status-warning' :
              'bg-primary'
            } animate-pulse`}></div>
          )}
          
          {/* Plant number */}
          <div className="absolute bottom-1 left-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-700">{plantNumber}</span>
          </div>
          
          {/* Classification indicator */}
          {isClassified && (
            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          )}
        </>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-primary"></div>
      )}
    </div>
  );
};

export default Plant; 