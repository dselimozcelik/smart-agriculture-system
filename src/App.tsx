import { useState } from 'react'
import Field from './components/Field'
import SensorDashboard from './components/SensorDashboard'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'field' | 'mqtt'>('field');

  return (
    <div className="min-h-screen h-full w-full bg-white text-gray-900">
      <header className="bg-[#2DA35E] text-white shadow-sm sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🌱</span>
              <h1 className="text-2xl font-semibold">
                Smart Agriculture System
              </h1>
            </div>
          </div>
        </div>
      </header>
      
      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('field')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'field'
                  ? 'border-[#2DA35E] text-[#2DA35E]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Plant Field
            </button>
            <button
              onClick={() => setActiveTab('mqtt')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mqtt'
                  ? 'border-[#2DA35E] text-[#2DA35E]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              MQTT Dashboard
            </button>
          </div>
        </div>
      </div>
      
      <main className="w-full flex-grow px-2 sm:px-4 lg:px-6 py-8 bg-white">
        {activeTab === 'field' ? (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#2DA35E] flex items-center justify-center text-white">
                  <span className="text-xl">🌱</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Plant Field with MQTT Sensor Data</h2>
                  <p className="text-sm text-gray-500">Click on a plant to view live MQTT sensor readings</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              <Field rows={4} columns={4} />
            </div>
          </>
        ) : (
          <SensorDashboard />
        )}
      </main>
      <footer className="bg-white mt-auto border-t border-gray-200">
        <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Smart Agriculture System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
