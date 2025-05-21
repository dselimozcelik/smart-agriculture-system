import { useState, useEffect } from 'react';
import axios from 'axios';
import Plant from './Plant';
import SensorPanel from './SensorPanel';

// Import all plant images
import appleBlackRot from '../assets/plants/Apple__Black_rot.jpg';
import appleHealthy from '../assets/plants/Apple___healthy.jpg';
import cherryPowderyMildew from '../assets/plants/Cherry_(including_sour)___Powdery_mildew.jpg';
import cherryHealthy from '../assets/plants/Cherry_(including_sour)___healthy.jpg';
import grapeBlackRot from '../assets/plants/Grape___Black_rot.jpg';
import grapeHealthy from '../assets/plants/Grape___healthy.jpg';
import peachBacterialSpot from '../assets/plants/Peach___Bacterial_spot.jpg';
import peachHealthy from '../assets/plants/Peach___healthy.jpg';
import pepperBacterialSpot from '../assets/plants/Pepper,_bell___Bacterial_spot.jpg';
import pepperHealthy from '../assets/plants/Pepper,_bell___healthy.jpg';
import strawberryLeafScorch from '../assets/plants/Strawberry___Leaf_scorch.jpg';
import strawberryHealthy from '../assets/plants/Strawberry___healthy.jpg';
import tomatoBacterialSpot from '../assets/plants/Tomato___Bacterial_spot.jpg';
import tomatoHealthy from '../assets/plants/Tomato___healthy.jpg';

// API base URL
const API_URL = 'http://localhost:5001/api';

// Define a type for plant type entries
interface PlantType {
  name: string;
  image: string;
  isHealthy: boolean;
}

// Plant types array
const plantPairs: PlantType[][] = [
  [
    { name: 'Apple__Black_rot', image: appleBlackRot, isHealthy: false },
    { name: 'Apple___healthy', image: appleHealthy, isHealthy: true }
  ],
  [
    { name: 'Cherry_(including_sour)___Powdery_mildew', image: cherryPowderyMildew, isHealthy: false },
    { name: 'Cherry_(including_sour)___healthy', image: cherryHealthy, isHealthy: true }
  ],
  [
    { name: 'Grape___Black_rot', image: grapeBlackRot, isHealthy: false },
    { name: 'Grape___healthy', image: grapeHealthy, isHealthy: true }
  ],
  [
    { name: 'Peach___Bacterial_spot', image: peachBacterialSpot, isHealthy: false },
    { name: 'Peach___healthy', image: peachHealthy, isHealthy: true }
  ],
  [
    { name: 'Pepper,_bell___Bacterial_spot', image: pepperBacterialSpot, isHealthy: false },
    { name: 'Pepper,_bell___healthy', image: pepperHealthy, isHealthy: true }
  ],
  [
    { name: 'Strawberry___Leaf_scorch', image: strawberryLeafScorch, isHealthy: false },
    { name: 'Strawberry___healthy', image: strawberryHealthy, isHealthy: true }
  ],
  [
    { name: 'Tomato___Bacterial_spot', image: tomatoBacterialSpot, isHealthy: false },
    { name: 'Tomato___healthy', image: tomatoHealthy, isHealthy: true }
  ]
];

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

interface FieldProps {
  rows?: number;
  columns?: number;
}

// Helper function to convert image URL to base64
const imageToBase64 = async (url: string): Promise<string> => {
  try {
    // For local images in a Vite project, fetch them as blobs
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Helper function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Field = ({ rows = 4, columns = 4 }: FieldProps) => {
  // Initialize plants with random selection from pairs
  const initializePlants = () => {
    const plantsArray: PlantData[][] = Array(rows).fill(null).map(() => 
      Array(columns).fill(null).map(() => ({
        isPlanted: false,
        moisture: 50,
        temperature: 25,
        light: 50,
        humidity: 50
      }))
    );
    
    // Create positions for all 16 slots
    let positions = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        positions.push([i, j]);
      }
    }
    positions = shuffleArray(positions);
    
    // Create an array of plant pairs that's long enough to fill all positions
    let extendedPairs: PlantType[][] = [];
    while (extendedPairs.length < positions.length) {
      extendedPairs = extendedPairs.concat(shuffleArray([...plantPairs]));
    }
    extendedPairs = extendedPairs.slice(0, positions.length);
    
    // Fill all positions with randomly selected plants
    positions.forEach(([i, j], index) => {
      const pair = extendedPairs[index];
      const selectedPlant = pair[Math.floor(Math.random() * 2)];
      
      plantsArray[i][j] = {
        isPlanted: true,
        moisture: selectedPlant.isHealthy ? Math.floor(Math.random() * 30) + 50 : Math.floor(Math.random() * 30) + 10,
        temperature: selectedPlant.isHealthy ? Math.floor(Math.random() * 5) + 20 : Math.floor(Math.random() * 15) + 25,
        light: selectedPlant.isHealthy ? Math.floor(Math.random() * 30) + 50 : Math.floor(Math.random() * 50) + 20,
        humidity: selectedPlant.isHealthy ? Math.floor(Math.random() * 30) + 50 : Math.floor(Math.random() * 40) + 30,
        plantType: selectedPlant.name,
        imageUrl: selectedPlant.image,
        isClassified: false
      };
    });
    
    return plantsArray;
  };

  const [plants, setPlants] = useState<PlantData[][]>(initializePlants);
  const [selectedPlant, setSelectedPlant] = useState<{row: number; col: number} | null>(null);
  const [stats, setStats] = useState({
    totalPlants: 0,
    healthyPlants: 0,
    warningPlants: 0,
    criticalPlants: 0
  });
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationComplete, setClassificationComplete] = useState(false);
  const [apiStatus, setApiStatus] = useState({ available: false, checked: false });

  // Check if the API is available
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/health`);
        if (response.status === 200) {
          setApiStatus({ available: true, checked: true });
          console.log('ML API is available');
        }
      } catch (error) {
        setApiStatus({ available: false, checked: true });
        console.warn('ML API is not available. Will use simulated classification.');
      }
    };
    
    checkApiStatus();
  }, []);

  // Check plant conditions and update stats
  useEffect(() => {
    const checkPlantConditions = () => {
      let totalPlants = 0;
      let healthyPlants = 0;
      let warningPlants = 0;
      let criticalPlants = 0;

      plants.forEach((row, rowIndex) => {
        row.forEach((plant, colIndex) => {
          if (!plant.isPlanted) return;
          
          totalPlants++;
          
          // If plant is classified, use that condition
          if (plant.isClassified && plant.condition) {
            if (plant.condition.includes('Healthy')) {
              healthyPlants++;
            } else if (plant.condition.includes('Critical')) {
              criticalPlants++;
            } else {
              warningPlants++;
            }
            return;
          }
          
          // Otherwise, use sensor data
          let isHealthy = true;
          let isCritical = false;
          
          // Check moisture
          if (plant.moisture < 30) {
            isHealthy = false;
            if (plant.moisture < 20) isCritical = true;
          }
          
          // Check temperature
          if (plant.temperature > 30) {
            isHealthy = false;
            if (plant.temperature > 35) isCritical = true;
          }

          // Check light
          if (plant.light < 20) {
            isHealthy = false;
          }

          // Check humidity
          if (plant.humidity < 40) {
            isHealthy = false;
          }

          if (isHealthy) {
            healthyPlants++;
          } else if (isCritical) {
            criticalPlants++;
          } else {
            warningPlants++;
          }
        });
      });

      setStats({
        totalPlants,
        healthyPlants,
        warningPlants,
        criticalPlants
      });
    };

    checkPlantConditions(); // Run immediately
    const interval = setInterval(checkPlantConditions, 5000);
    return () => clearInterval(interval);
  }, [plants]);

  const handlePlantClick = (row: number, col: number) => {
    setSelectedPlant(selectedPlant?.row === row && selectedPlant?.col === col ? null : { row, col });
  };

  // Simulated API call to classify plants
  const simulateClassification = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update plant conditions based on classification
    const updatedPlants = [...plants];
    
    plants.forEach((row, rowIndex) => {
      row.forEach((plant, colIndex) => {
        if (!plant.isPlanted) return;
        
        // Extract plant type and determine condition from original file
        const plantType = plant.plantType || '';
        
        // Determine if the plant is healthy based on its type
        const isHealthy = plantType.includes('healthy');
        
        updatedPlants[rowIndex][colIndex] = {
          ...plant,
          condition: isHealthy ? 'Healthy' : 
                     (plantType.includes('Bacterial') || plantType.includes('Black_rot')) ? 'Critical - Disease detected' : 
                     'Warning - Potential disease',
          isClassified: true,
          confidence: isHealthy ? 95 : Math.floor(Math.random() * 30) + 60
        };
      });
    });
    
    return updatedPlants;
  };

  // API classification using the Flask server
  const classifyWithApi = async () => {
    const updatedPlants = [...plants];
    
    // Process each plant sequentially to avoid overloading the server
    for (let rowIndex = 0; rowIndex < plants.length; rowIndex++) {
      for (let colIndex = 0; colIndex < plants[rowIndex].length; colIndex++) {
        const plant = plants[rowIndex][colIndex];
        
        if (!plant.isPlanted || !plant.imageUrl) continue;
        
        try {
          // Convert image to base64
          const base64Image = await imageToBase64(plant.imageUrl);
          
          // Send image to the API
          const response = await axios.post(`${API_URL}/classify`, {
            image: base64Image
          });
          
          // Update plant with classification result
          updatedPlants[rowIndex][colIndex] = {
            ...plant,
            condition: response.data.condition,
            isClassified: true,
            confidence: response.data.confidence
          };
        } catch (error) {
          console.error(`Error classifying plant at [${rowIndex}, ${colIndex}]:`, error);
          
          // Fallback to simulation for this plant
          const isHealthy = plant.plantType?.includes('healthy') || false;
          updatedPlants[rowIndex][colIndex] = {
            ...plant,
            condition: isHealthy ? 'Healthy' : 
                       (plant.plantType?.includes('Bacterial') || plant.plantType?.includes('Black_rot')) ? 
                       'Critical - Disease detected' : 'Warning - Potential disease',
            isClassified: true,
            confidence: isHealthy ? 95 : Math.floor(Math.random() * 30) + 60
          };
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return updatedPlants;
  };

  // Classify plants using API or simulation
  const classifyPlants = async () => {
    setIsClassifying(true);
    
    try {
      let updatedPlants;
      
      if (apiStatus.available) {
        // Use the real API
        updatedPlants = await classifyWithApi();
      } else {
        // Use simulation
        updatedPlants = await simulateClassification();
      }
      
      setPlants(updatedPlants);
      setClassificationComplete(true);
    } catch (error) {
      console.error('Error classifying plants:', error);
    } finally {
      setIsClassifying(false);
    }
  };

  // Reset plant classification
  const resetClassification = () => {
    const updatedPlants = plants.map(row => 
      row.map(plant => ({
        ...plant,
        condition: undefined,
        isClassified: false,
        confidence: undefined
      }))
    );
    
    setPlants(updatedPlants);
    setClassificationComplete(false);
  };

  return (
    <div className="flex flex-col bg-white">
      {/* Plant classification actions */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Field View</h2>
        
        <div className="flex space-x-3">
          {apiStatus.checked && !apiStatus.available && !isClassifying && (
            <div className="px-3 py-2 bg-amber-50 text-amber-800/80 rounded-lg text-sm flex items-center border border-amber-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Using simulated classification (API not available)
            </div>
          )}
        
          {!classificationComplete ? (
            <button 
              onClick={classifyPlants}
              disabled={isClassifying}
              className={`
                px-4 py-2 rounded-lg
                ${isClassifying ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}
                text-white font-medium transition-colors
                flex items-center
              `}
            >
              {isClassifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Classifying...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Classify Plants
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={resetClassification}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Classification
            </button>
          )}
        </div>
      </div>

      {/* Classification Summary */}
      {classificationComplete && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-emerald-200">
            <h3 className="text-lg font-semibold text-emerald-700 mb-2">Healthy Plants</h3>
            <div className="flex flex-wrap gap-2">
              {plants.flat().map((plant, index) => 
                plant.isClassified && plant.condition?.includes('Healthy') && (
                  <span key={`healthy-${index}`} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                    #{index + 1}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-amber-200">
            <h3 className="text-lg font-semibold text-amber-700 mb-2">Warning Plants</h3>
            <div className="flex flex-wrap gap-2">
              {plants.flat().map((plant, index) => 
                plant.isClassified && plant.condition?.includes('Warning') && (
                  <span key={`warning-${index}`} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">
                    #{index + 1}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-rose-200">
            <h3 className="text-lg font-semibold text-rose-700 mb-2">Critical Plants</h3>
            <div className="flex flex-wrap gap-2">
              {plants.flat().map((plant, index) => 
                plant.isClassified && plant.condition?.includes('Critical') && (
                  <span key={`critical-${index}`} className="px-2 py-1 bg-rose-50 text-rose-700 rounded-full text-sm">
                    #{index + 1}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Field grid and sensor panel container */}
      <div className="flex justify-center items-start gap-6 w-full">
        {/* Field grid */}
        <div className="max-w-2xl grid grid-cols-4 gap-3">
          {plants.map((row, rowIndex) => (
            row.map((plant, colIndex) => {
              const plantNumber = rowIndex * columns + colIndex + 1;
              return (
                <div 
                  key={`plant-${rowIndex}-${colIndex}`} 
                  className={`aspect-square relative ${selectedPlant?.row === rowIndex && selectedPlant?.col === colIndex ? 'z-10' : ''}`}
                >
                  <Plant 
                    plantId={`plant-${rowIndex}-${colIndex}`}
                    title={plant.plantType || ''}
                    isPlanted={plant.isPlanted}
                    moisture={plant.moisture}
                    temperature={plant.temperature}
                    light={plant.light}
                    humidity={plant.humidity}
                    isSelected={selectedPlant?.row === rowIndex && selectedPlant?.col === colIndex}
                    onSelect={() => handlePlantClick(rowIndex, colIndex)}
                    imageUrl={plant.imageUrl}
                    plantType={plant.plantType}
                    condition={plant.condition}
                    isClassified={plant.isClassified}
                    plantNumber={plantNumber}
                  />
                </div>
              );
            })
          ))}
        </div>

        {/* Plant detail panel - positioned to the right */}
        <div className="flex-shrink-0">
          {selectedPlant && (
            <SensorPanel 
              plant={plants[selectedPlant.row][selectedPlant.col]} 
              onClose={() => setSelectedPlant(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Field; 