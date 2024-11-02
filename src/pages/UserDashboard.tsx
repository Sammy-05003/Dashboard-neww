import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuthStore } from '../stores/authStore';
import { predictAmmoNeeds } from '../utils/predictions';
import { STATES_UT, ZONES, HIGH_RISK_AREAS } from '../data/locations';
import ZoneIndicator from '../components/ZoneIndicator';
import StockChart from '../components/StockChart';
import StockRadarChart from '../components/RadarChart';

export default function UserDashboard() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [predictionResults, setPredictionResults] = useState(null);

  const handlePredict = async () => {
    if (!selectedState || !selectedZone || !currentStock) return;

    const results = await predictAmmoNeeds({
      state: selectedState,
      zone: selectedZone,
      currentStock: parseInt(currentStock)
    });

    setPredictionResults(results);
  };

  const getAvailableZones = (state: string) => {
    if (!state) return ZONES;
    const riskZone = HIGH_RISK_AREAS[state];
    if (!riskZone) return ZONES.filter(z => z.id !== 'Z5');
    return ZONES.filter(z => {
      if (riskZone === 'Z5') return true;
      if (riskZone === 'Z4') return z.id !== 'Z5';
      if (riskZone === 'Z3') return !['Z4', 'Z5'].includes(z.id);
      return true;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4">Ammunition Prediction Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">State/UT</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedZone('');
              }}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700/50 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select State/UT</option>
              {STATES_UT.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700/50 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Zone</option>
              {getAvailableZones(selectedState).map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Current Stock</label>
            <input
              type="number"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700/50 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter current stock"
            />
          </div>
        </div>

        {selectedZone && (
          <div className="mb-4">
            <ZoneIndicator
              level={ZONES.find(z => z.id === selectedZone)?.level || 'normal'}
            />
          </div>
        )}
        
        <button
          onClick={handlePredict}
          className="w-full md:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generate Prediction
        </button>
      </div>

      {predictionResults && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Prediction Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="text-sm font-medium text-gray-300">Predicted Depletion Date</h4>
                <p className="text-xl font-bold text-white">{predictionResults.depletionDate}</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="text-sm font-medium text-gray-300">Recommended Order</h4>
                <p className="text-xl font-bold text-white">{predictionResults.recommendedOrder}</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="text-sm font-medium text-gray-300">Production Time</h4>
                <p className="text-xl font-bold text-white">{predictionResults.productionTime}</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="text-sm font-medium text-gray-300">Depletion Rate</h4>
                <p className="text-xl font-bold text-white">{predictionResults.depletionRate}/day</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/10">
              <h4 className="text-sm font-medium text-gray-300 mb-4">Stock Projection</h4>
              <StockChart data={predictionResults.projectionData} />
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/10">
              <h4 className="text-sm font-medium text-gray-300 mb-4">Stock Distribution</h4>
              <StockRadarChart data={predictionResults.radarData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}