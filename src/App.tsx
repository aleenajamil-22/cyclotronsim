import { useState, useRef } from 'react'
import './App.css'
import CyclotronCanvas from './components/CyclotronCanvas'
import ParameterPanel from './components/ParameterPanel'
import ReadoutsPanel from './components/ReadoutsPanel'
import DataExport, { TurnData } from './components/DataExport'

export interface CyclotronParams {
  mode: 'Classic' | 'Relativistic'
  accelerationVoltage: number
  magneticFluxDensity: number
  particleType: 'Proton' | 'Deuteron' | 'Alpha' | 'Electron'
  simulationSpeed: number
  cyclotronRadius: number
  frequency: number
  kineticEnergy: number
  speed: number
  time: number
  halfTurns: number
  lorentzFactor: number
}

function App() {
  const [params, setParams] = useState<CyclotronParams>({
    mode: 'Classic',
    accelerationVoltage: 5000,
    magneticFluxDensity: 1.0,
    particleType: 'Proton',
    simulationSpeed: 20,
    cyclotronRadius: 3.231,
    frequency: 15.245,
    kineticEnergy: 0.500,
    speed: 0.10,
    time: 0.00,
    halfTurns: 0,
    lorentzFactor: 1.0000
  })

  const [isRunning, setIsRunning] = useState(false)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [turnData, setTurnData] = useState<TurnData[]>([])

  const handleReset = () => {
    setResetTrigger(prev => prev + 1)
    setTurnData([]) // Clear data on reset
  }

  const handleTurnData = (data: TurnData) => {
    setTurnData(prev => [...prev, data])
  }

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1 className="title">Cyclotron Simulator</h1>
          <p className="subtitle">
            Interactive physics simulation of a particle cyclotron accelerator. Watch charged particles
            spiral outward as they gain energy crossing the acceleration gap.
          </p>
        </div>
        <div className="content">
          <ParameterPanel 
            params={params} 
            setParams={setParams}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
            onReset={handleReset}
          />
          <CyclotronCanvas 
            params={params}
            isRunning={isRunning}
            resetTrigger={resetTrigger}
            onTurnData={handleTurnData}
          />
          <div>
            <ReadoutsPanel params={params} isRunning={isRunning} />
            <DataExport turnData={turnData} isRunning={isRunning} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
