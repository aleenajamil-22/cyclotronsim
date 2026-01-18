import { CyclotronParams } from '../App'
import './ParameterPanel.css'

interface Props {
  params: CyclotronParams
  setParams: (params: CyclotronParams) => void
  isRunning: boolean
  setIsRunning: (running: boolean) => void
  onReset: () => void
}

const PARTICLE_MASSES = {
  Proton: 1.6726e-27,
  Deuteron: 3.3435e-27,
  Alpha: 6.6447e-27,
  Electron: 9.1094e-31
}

const PARTICLE_CHARGES = {
  Proton: 1.6022e-19,
  Deuteron: 1.6022e-19,
  Alpha: 3.2044e-19,
  Electron: 1.6022e-19
}

function ParameterPanel({ params, setParams, isRunning, setIsRunning, onReset }: Props) {
  
  const calculateDerivedValues = (newParams: Partial<CyclotronParams>) => {
    const updated = { ...params, ...newParams }
    const mass = PARTICLE_MASSES[updated.particleType]
    const charge = PARTICLE_CHARGES[updated.particleType]
    
    // Calculate frequency (MHz)
    const frequency = (charge * updated.magneticFluxDensity) / (2 * Math.PI * mass) / 1e6
    
    // Calculate cyclotron radius (mm)
    const kineticEnergyJ = updated.kineticEnergy * 1000 * 1.6022e-19
    const speed = Math.sqrt(2 * kineticEnergyJ / mass)
    const radius = (mass * speed) / (charge * updated.magneticFluxDensity) * 1000 // convert to mm
    
    // Calculate time (ns)
    const time = (2 * Math.PI * mass) / (charge * updated.magneticFluxDensity) * 1e9
    
    // Speed as percentage of c
    const speedPercent = (speed / 299792458) * 100
    
    return {
      ...updated,
      frequency: parseFloat(frequency.toFixed(3)),
      cyclotronRadius: parseFloat(radius.toFixed(3)),
      speed: parseFloat(speedPercent.toFixed(2)),
      time: parseFloat(time.toFixed(2)),
      kineticEnergy: updated.kineticEnergy,
      halfTurns: 0,
      lorentzFactor: 1.0000
    }
  }

  const handleChange = (field: keyof CyclotronParams, value: any) => {
    const newParams = calculateDerivedValues({ [field]: value })
    setParams(newParams)
  }

  const handleReset = () => {
    onReset() // Clear the trail and reset particle position
    const defaultParams = calculateDerivedValues({
      mode: 'Classic',
      accelerationVoltage: 5000,
      magneticFluxDensity: 1.0,
      particleType: 'Proton',
      kineticEnergy: 0.500
    })
    setParams(defaultParams)
    setIsRunning(false)
  }

  return (
    <div className="parameter-panel">
      <div className="panel-header">
        <h2>Controls</h2>
      </div>
      
      <div className="panel-content">
        <div className="form-group">
          <label>Mode</label>
          <select 
            value={params.mode}
            onChange={(e) => handleChange('mode', e.target.value)}
          >
            <option value="Classic">Classic</option>
            <option value="Relativistic">Relativistic</option>
          </select>
        </div>

        <div className="form-group">
          <label>Acceleration Voltage</label>
          <input 
            type="range"
            min="500"
            max="10000"
            step="100"
            value={params.accelerationVoltage}
            onChange={(e) => handleChange('accelerationVoltage', parseFloat(e.target.value))}
          />
          <div className="speed-value">{params.accelerationVoltage.toLocaleString()} V</div>
        </div>

        <div className="form-group">
          <label>Magnetic Flux Density</label>
          <input 
            type="range"
            min="0.05"
            max="2.0"
            step="0.01"
            value={params.magneticFluxDensity}
            onChange={(e) => handleChange('magneticFluxDensity', parseFloat(e.target.value))}
          />
          <div className="speed-value">{params.magneticFluxDensity.toFixed(3)} T</div>
        </div>

        <div className="form-group">
          <label>Particle type</label>
          <select 
            value={params.particleType}
            onChange={(e) => handleChange('particleType', e.target.value)}
          >
            <option value="Proton">Proton</option>
            <option value="Deuteron">Deuteron</option>
            <option value="Alpha">Alpha</option>
            <option value="Electron">Electron</option>
          </select>
        </div>

        <div className="button-group">
          <button 
            className="btn btn-primary"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default ParameterPanel
