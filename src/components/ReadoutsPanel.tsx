import { CyclotronParams } from '../App'
import './ReadoutsPanel.css'

interface Props {
  params: CyclotronParams
  isRunning: boolean
}

function ReadoutsPanel({ params, isRunning }: Props) {
  return (
    <div className="readouts-panel">
      <h2 className="readouts-title">Live Readouts</h2>
      
      <div className="readouts-grid">
        <div className="readout-item">
          <div className="readout-label">ORBITAL<br/>RADIUS</div>
          <div className="readout-value cyan">{params.cyclotronRadius.toFixed(3)} <span className="unit">mm</span></div>
        </div>
        
        <div className="readout-item">
          <div className="readout-label">FREQUENCY</div>
          <div className="readout-value cyan">{params.frequency.toFixed(3)} <span className="unit">MHz</span></div>
        </div>
        
        <div className="readout-item">
          <div className="readout-label">KINETIC<br/>ENERGY</div>
          <div className="readout-value cyan">{params.kineticEnergy.toFixed(3)} <span className="unit">keV</span></div>
        </div>
        
        <div className="readout-item">
          <div className="readout-label">SPEED (v/c)</div>
          <div className="readout-value cyan">{params.speed.toFixed(2)} <span className="unit">%</span></div>
        </div>
        
        <div className="readout-item">
          <div className="readout-label">TIME ELAPSED</div>
          <div className="readout-value cyan">{params.time.toFixed(2)} <span className="unit">ns</span></div>
        </div>
        
        <div className="readout-item">
          <div className="readout-label">HALF-TURNS</div>
          <div className="readout-value cyan">{params.halfTurns} <span className="unit">turns</span></div>
        </div>
        
        <div className="readout-item">
          <div className="readout-label">LORENTZ Γ</div>
          <div className="readout-value cyan">{params.lorentzFactor.toFixed(4)}</div>
        </div>
        
        <div className="readout-item">
          <div className="readout-label">SPEED</div>
          <div className="readout-value cyan">{params.speed.toFixed(4)} <span className="unit">×10⁸<br/>m/s</span></div>
        </div>
      </div>

      <div className="how-it-works">
        <h3>How it works</h3>
        <ul>
          <li><strong>Particles start at</strong> the center with initial energy from the first acceleration</li>
          <li><strong>The magnetic field bends</strong> the particle in a semicircle</li>
          <li><strong>Each gap crossing adds energy</strong> ΔE = qV</li>
          <li><strong>Higher energy means larger radius:</strong> r = mv/(qB)</li>
          <li><strong>Frequency stays constant:</strong> f = qB/(2πm)</li>
        </ul>
      </div>
    </div>
  )
}

export default ReadoutsPanel
