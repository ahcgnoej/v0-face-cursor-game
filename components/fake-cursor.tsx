"use client"

import { useEffect, useState } from "react"

interface FakeCursorProps {
  x: number
  y: number
  isClicking: boolean
}

export default function FakeCursor({ x, y, isClicking }: FakeCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setPosition({ x, y })
  }, [x, y])

  return (
    <>
      {/* Cursor */}
      <div
        className="pointer-events-none fixed z-[9999] transition-transform duration-75"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-2px, -2px) ${isClicking ? "scale(0.8)" : "scale(1)"}`,
        }}
      >
        {/* Cursor arrow SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-lg transition-all duration-75 ${isClicking ? "opacity-80" : "opacity-100"}`}
        >
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.53.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
            fill="#00ff88"
            stroke="#000"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Click ripple effect */}
      {isClicking && (
        <div
          className="pointer-events-none fixed z-[9998] animate-ping"
          style={{
            left: position.x - 15,
            top: position.y - 15,
          }}
        >
          <div className="h-8 w-8 rounded-full border-2 border-green-400 bg-green-400/30" />
        </div>
      )}

      {/* Trail effect */}
      <div
        className="pointer-events-none fixed z-[9997] h-3 w-3 rounded-full bg-green-400/50 blur-sm transition-all duration-150"
        style={{
          left: position.x - 6,
          top: position.y - 6,
        }}
      />
    </>
  )
}
