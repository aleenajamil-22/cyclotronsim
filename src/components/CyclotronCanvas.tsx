import { useEffect, useRef, useState } from 'react'
import { CyclotronParams } from '../App'
import './CyclotronCanvas.css'
import { TurnData } from './DataExport'

interface Props {
  params: CyclotronParams
  isRunning: boolean
  resetTrigger: number
  onTurnData: (data: TurnData) => void
}

function CyclotronCanvas({ params, isRunning, resetTrigger, onTurnData }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [currentRadius, setCurrentRadius] = useState(0)
  const trailRef = useRef<Array<{ x: number; y: number }>>([])
  
  // Physics state
  const physicsStateRef = useRef({
    x: 0.0,
    y: 0.0,
    vx: 0.1,
    vy: 0.0,
    t: 0.0
  })

  // Track turns for data export
  const lastAngleRef = useRef(0)
  const turnCountRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2
      const maxRadius = Math.min(width, height) * 0.4

      // Clear canvas with dark background
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, width, height)

      // Draw outer circle
      ctx.strokeStyle = '#1a4d5c'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2)
      ctx.stroke()

      // Draw grid dots
      const gridSpacing = 30
      ctx.fillStyle = '#1a3a47'
      for (let x = centerX - maxRadius; x <= centerX + maxRadius; x += gridSpacing) {
        for (let y = centerY - maxRadius; y <= centerY + maxRadius; y += gridSpacing) {
          const dx = x - centerX
          const dy = y - centerY
          if (Math.sqrt(dx * dx + dy * dy) <= maxRadius) {
            ctx.beginPath()
            ctx.arc(x, y, 1.5, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      // Draw center divider line
      ctx.strokeStyle = '#2a5a6a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - maxRadius)
      ctx.lineTo(centerX, centerY + maxRadius)
      ctx.stroke()

      // Draw trail as glowing line
      if (trailRef.current.length > 1) {
        // Draw glow
        ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)'
        ctx.lineWidth = 6
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y)
        for (let i = 1; i < trailRef.current.length; i++) {
          ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y)
        }
        ctx.stroke()

        // Draw main line
        ctx.strokeStyle = '#00d9ff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y)
        for (let i = 1; i < trailRef.current.length; i++) {
          ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y)
        }
        ctx.stroke()
      }

      // Get current particle position
      const state = physicsStateRef.current
      const scale = maxRadius / 2.0 // Scale physics coordinates to canvas
      const particleX = centerX + state.x * scale
      const particleY = centerY + state.y * scale

      // Particle glow
      const particleGradient = ctx.createRadialGradient(particleX, particleY, 0, particleX, particleY, 15)
      particleGradient.addColorStop(0, '#00d9ff')
      particleGradient.addColorStop(0.3, '#00a8cc')
      particleGradient.addColorStop(1, 'rgba(0, 217, 255, 0)')
      ctx.fillStyle = particleGradient
      ctx.beginPath()
      ctx.arc(particleX, particleY, 15, 0, Math.PI * 2)
      ctx.fill()

      // Particle core
      ctx.fillStyle = '#00d9ff'
      ctx.beginPath()
      ctx.arc(particleX, particleY, 4, 0, Math.PI * 2)
      ctx.fill()

      const radius = Math.sqrt(state.x * state.x + state.y * state.y)
      setCurrentRadius(radius)
    }

    draw()
  }, [isRunning, physicsStateRef.current.x, physicsStateRef.current.y])

  // Reset when reset button is clicked
  useEffect(() => {
    if (resetTrigger > 0) {
      trailRef.current = []
      physicsStateRef.current = {
        x: 0.0,
        y: 0.0,
        vx: 0.1,
        vy: 0.0,
        t: 0.0
      }
      lastAngleRef.current = 0
      turnCountRef.current = 0
    }
  }, [resetTrigger])

  // Animation loop with proper physics
  useEffect(() => {
    if (isRunning) {
      const canvas = canvasRef.current
      if (!canvas) return

      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2
      const maxRadius = Math.min(width, height) * 0.4
      const scale = maxRadius / 2.0

      let lastTime = performance.now()

      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 1000 // Convert to seconds
        lastTime = currentTime

        const state = physicsStateRef.current
        
        // Check if particle has reached the edge
        const radius = Math.sqrt(state.x * state.x + state.y * state.y)
        if (radius >= 2.0) { // Stop at edge (radius 2.0 in physics units)
          return
        }

        // Time step
        const dt = 0.05
        
        // Cyclotron angular frequency (scaled by magnetic flux density and frequency)
        const omega = params.frequency * 0.1
        
        // Simple circular motion with acceleration
        const ax = -omega * state.vy
        const ay = omega * state.vx
        
        // Update velocity
        state.vx += ax * dt
        state.vy += ay * dt
        
        // Update position
        state.x += state.vx * dt
        state.y += state.vy * dt
        state.t += dt

        // Calculate angle for turn detection
        const currentAngle = Math.atan2(state.y, state.x)
        
        // Detect when particle completes a half-turn (crosses the gap)
        if (lastAngleRef.current < 0 && currentAngle >= 0) {
          turnCountRef.current++
          
          // Calculate physics values for this turn
          const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy)
          const c = 299792458 // speed of light (m/s)
          const gamma = 1 / Math.sqrt(1 - (speed * speed) / (c * c))
          
          // Get particle properties
          const PARTICLE_MASSES: Record<string, number> = {
            Proton: 1.6726e-27,
            Deuteron: 3.3435e-27,
            Alpha: 6.6447e-27,
            Electron: 9.1094e-31
          }
          const PARTICLE_CHARGES: Record<string, number> = {
            Proton: 1.6022e-19,
            Deuteron: 1.6022e-19,
            Alpha: 3.2044e-19,
            Electron: 1.6022e-19
          }
          
          const mass = PARTICLE_MASSES[params.particleType]
          const charge = PARTICLE_CHARGES[params.particleType]
          
          // Relativistic momentum: p = γmv
          const p = gamma * mass * speed
          
          // Rest energy: E₀ = mc²
          const E0 = mass * c * c
          
          // Total energy: E = γmc²
          const E = gamma * E0
          
          // Kinetic energy: K = E - E₀ = (γ - 1)mc²
          const K = (gamma - 1) * E0
          
          // Cyclotron period: T = 2πm/(qB)
          const T = (2 * Math.PI * mass) / (charge * params.magneticFluxDensity)
          
          // Send data to parent
          onTurnData({
            turn: turnCountRef.current,
            t: state.t,
            gamma: gamma,
            p: p,
            K: K,
            E: E,
            T: T
          })
        }
        
        lastAngleRef.current = currentAngle

        // Convert to canvas coordinates
        const particleX = centerX + state.x * scale
        const particleY = centerY + state.y * scale

        // Add to trail (sample every few frames)
        if (trailRef.current.length === 0 || 
            Math.hypot(particleX - trailRef.current[trailRef.current.length - 1].x, 
                      particleY - trailRef.current[trailRef.current.length - 1].y) > 2) {
          trailRef.current.push({ x: particleX, y: particleY })
        }

        // Trigger re-render
        setCurrentRadius(radius)

        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, params.magneticFluxDensity, params.accelerationVoltage])

  return (
    <div className="simulation-container">
      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef}
          width={600}
          height={600}
          className="cyclotron-canvas"
        />
      </div>
      <div className="status-indicator">
        <div className={`status-dot ${isRunning ? 'running' : ''}`}></div>
        <span>{isRunning ? 'Running' : 'Paused'}</span>
      </div>
    </div>
  )
}

export default CyclotronCanvas
