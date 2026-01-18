import { useEffect, useState } from 'react'
import './DataExport.css'

export interface TurnData {
  turn: number
  t: number        // time (s)
  gamma: number    // relativistic Lorentz factor (unitless)
  p: number        // relativistic momentum magnitude (kg·m/s)
  K: number        // relativistic kinetic energy (J)
  E: number        // total energy (J)
  T: number        // instantaneous cyclotron period (s)
}

interface Props {
  turnData: TurnData[]
  isRunning: boolean
}

function DataExport({ turnData, isRunning }: Props) {
  const [autoExport, setAutoExport] = useState(false)

  const exportToCSV = () => {
    if (turnData.length === 0) {
      alert('No data to export. Run the simulation first.')
      return
    }

    // Create CSV header
    const headers = ['Turn', 'Time (s)', 'Gamma', 'Momentum (kg·m/s)', 'Kinetic Energy (J)', 'Total Energy (J)', 'Period (s)']
    const csvContent = [
      headers.join(','),
      ...turnData.map(row => 
        `${row.turn},${row.t.toExponential(6)},${row.gamma.toFixed(6)},${row.p.toExponential(6)},${row.K.toExponential(6)},${row.E.toExponential(6)},${row.T.toExponential(6)}`
      )
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `cyclotron_data_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Auto-export when simulation completes
  useEffect(() => {
    if (autoExport && !isRunning && turnData.length > 0) {
      exportToCSV()
    }
  }, [isRunning, autoExport, turnData.length])

  return (
    <div className="data-export">
      <h3>Data Export</h3>
      <div className="export-info">
        <p>Turns recorded: <strong>{turnData.length}</strong></p>
      </div>
      <div className="export-controls">
        <label className="checkbox-label">
          <input 
            type="checkbox"
            checked={autoExport}
            onChange={(e) => setAutoExport(e.target.checked)}
          />
          Auto-export when complete
        </label>
        <button 
          className="btn-export"
          onClick={exportToCSV}
          disabled={turnData.length === 0}
        >
          Export CSV
        </button>
      </div>
      {turnData.length > 0 && (
        <div className="data-preview">
          <h4>Latest Data:</h4>
          <div className="preview-grid">
            <div className="preview-item">
              <span className="preview-label">Turn:</span>
              <span className="preview-value">{turnData[turnData.length - 1].turn}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Time:</span>
              <span className="preview-value">{turnData[turnData.length - 1].t.toExponential(3)} s</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Gamma:</span>
              <span className="preview-value">{turnData[turnData.length - 1].gamma.toFixed(4)}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Energy:</span>
              <span className="preview-value">{turnData[turnData.length - 1].K.toExponential(3)} J</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataExport
