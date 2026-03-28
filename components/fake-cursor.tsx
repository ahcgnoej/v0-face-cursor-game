"use client"

import { useEffect, useState } from "react"

interface FakeCursorProps {
  x: number
  y: number
  isClicking: boolean
  combo: number
  showFire: boolean
}

export default function FakeCursor({ x, y, isClicking, combo, showFire }: FakeCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([])

  useEffect(() => {
    setPosition({ x, y })
    
    // Add trail points when combo is high
    if (combo >= 3) {
      setTrail(prev => {
        const newTrail = [...prev, { x, y, id: Date.now() }].slice(-8)
        return newTrail
      })
    } else {
      setTrail([])
    }
  }, [x, y, combo])

  const getCursorColor = () => {
    if (showFire) return "#ff6b35"
    if (combo >= 7) return "#a855f7" // purple
    if (combo >= 5) return "#f97316" // orange
    if (combo >= 3) return "#eab308" // yellow
    return "#00ff88" // green
  }

  const getCursorScale = () => {
    if (isClicking) return 0.7
    if (showFire) return 1.3
    if (combo >= 5) return 1.2
    return 1
  }

  return (
    <>
      {/* Trail effect for high combo */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="pointer-events-none fixed z-[9996] rounded-full"
          style={{
            left: point.x - 4,
            top: point.y - 4,
            width: 8 + index,
            height: 8 + index,
            backgroundColor: getCursorColor(),
            opacity: (index + 1) / trail.length * 0.4,
            filter: "blur(2px)",
          }}
        />
      ))}

      {/* Main cursor */}
      <div
        className="pointer-events-none fixed z-[9999] transition-transform duration-75"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-2px, -2px) scale(${getCursorScale()})`,
        }}
      >
        {/* Cursor arrow SVG */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-lg transition-all duration-75 ${isClicking ? "opacity-80" : "opacity-100"}`}
          style={{
            filter: showFire ? "drop-shadow(0 0 8px #ff6b35)" : combo >= 3 ? `drop-shadow(0 0 5px ${getCursorColor()})` : "none",
          }}
        >
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.53.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
            fill={getCursorColor()}
            stroke="#000"
            strokeWidth="1.5"
          />
        </svg>

        {/* Fire effect */}
        {showFire && (
          <div className="absolute -top-2 left-1 text-lg animate-bounce">🔥</div>
        )}

        {/* Combo indicator near cursor */}
        {combo >= 3 && (
          <div 
            className="absolute -right-8 -top-1 text-sm font-bold animate-pulse"
            style={{ color: getCursorColor() }}
          >
            x{combo}
          </div>
        )}
      </div>

      {/* Click ripple effect */}
      {isClicking && (
        <div
          className="pointer-events-none fixed z-[9998] animate-ping"
          style={{
            left: position.x - 20,
            top: position.y - 20,
          }}
        >
          <div 
            className="h-10 w-10 rounded-full border-2"
            style={{ 
              borderColor: getCursorColor(),
              backgroundColor: `${getCursorColor()}30`,
            }}
          />
        </div>
      )}

      {/* Outer glow for high combo */}
      {combo >= 5 && (
        <div
          className="pointer-events-none fixed z-[9997] animate-pulse rounded-full"
          style={{
            left: position.x - 25,
            top: position.y - 25,
            width: 50,
            height: 50,
            background: `radial-gradient(circle, ${getCursorColor()}40 0%, transparent 70%)`,
          }}
        />
      )}
    </>
  )
}
