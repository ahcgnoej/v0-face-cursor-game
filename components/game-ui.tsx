"use client"

import { useEffect, useState } from "react"

interface GameUIProps {
  score: number
  timeLeft: number
  mouseUnlocked: boolean
  mouseUnlockTime: number
  targetPos: { x: number; y: number }
  onTargetClick: () => void
  hoveredElement: Element | null
}

export default function GameUI({
  score,
  timeLeft,
  mouseUnlocked,
  mouseUnlockTime,
  targetPos,
  onTargetClick,
  hoveredElement,
}: GameUIProps) {
  const [glitchText, setGlitchText] = useState(false)

  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchText(true)
      setTimeout(() => setGlitchText(false), 100)
    }, 3000 + Math.random() * 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-screen w-full">
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Scanline effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 136, 0.03) 2px, rgba(0, 255, 136, 0.03) 4px)",
        }}
      />

      {/* Top status bar */}
      <div className="absolute left-0 right-0 top-0 z-50 border-b border-green-500/30 bg-black/80 p-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          {/* Score */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-green-500/70">Score</span>
            <span className={`font-mono text-2xl font-bold text-green-400 ${glitchText ? "translate-x-0.5 text-red-400" : ""}`}>
              {score.toString().padStart(3, "0")}
            </span>
          </div>

          {/* Mouse status */}
          <div className="flex flex-col items-center">
            {mouseUnlocked ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="text-sm font-medium text-green-400">MOUSE UNLOCKED</span>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-green-900">
                  <div
                    className="h-full bg-green-400 transition-all duration-100"
                    style={{ width: `${(mouseUnlockTime / 3) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-400">MOUSE LOCKED</span>
              </div>
            )}
            <span className="mt-1 text-xs text-green-500/50">Move face to control cursor | Open mouth to click</span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-green-500/70">Time</span>
            <span
              className={`font-mono text-2xl font-bold ${
                timeLeft <= 10 ? "animate-pulse text-red-400" : "text-green-400"
              } ${glitchText ? "-translate-x-0.5 text-cyan-400" : ""}`}
            >
              {timeLeft.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* AI takeover message */}
      <div className="absolute left-1/2 top-24 -translate-x-1/2 text-center">
        <h1
          className={`text-4xl font-black tracking-widest text-green-500 ${
            glitchText ? "skew-x-2 text-red-500" : ""
          }`}
          style={{
            textShadow: "0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)",
          }}
        >
          SYSTEM OVERRIDE
        </h1>
        <p className="mt-2 text-sm text-green-500/60">{"// AI has taken control of your mouse"}</p>
      </div>

      {/* Target button */}
      <button
        onClick={onTargetClick}
        data-target="true"
        className={`group absolute z-40 flex h-20 w-20 items-center justify-center rounded-xl border-2 transition-all duration-200 ${
          hoveredElement?.getAttribute("data-target") === "true"
            ? "scale-110 border-green-400 bg-green-500/30 shadow-lg shadow-green-500/50"
            : "border-green-500/50 bg-green-500/10 hover:border-green-400 hover:bg-green-500/20"
        }`}
        style={{
          left: targetPos.x - 40,
          top: targetPos.y - 40,
        }}
      >
        <div className="relative">
          <span className="text-3xl font-bold text-green-400">+1</span>
          <div className="absolute -inset-2 animate-ping rounded-lg border border-green-500/30" />
        </div>
      </button>

      {/* Corner decorations */}
      <div className="absolute left-4 top-32 h-20 w-20 border-l-2 border-t-2 border-green-500/30" />
      <div className="absolute right-4 top-32 h-20 w-20 border-r-2 border-t-2 border-green-500/30" />
      <div className="absolute bottom-4 left-4 h-20 w-20 border-b-2 border-l-2 border-green-500/30" />
      <div className="absolute bottom-4 right-4 h-20 w-20 border-b-2 border-r-2 border-green-500/30" />

      {/* Random floating text */}
      <div className="pointer-events-none absolute bottom-20 left-10 font-mono text-xs text-green-500/20">
        {"> Analyzing user behavior..."}
      </div>
      <div className="pointer-events-none absolute bottom-32 right-10 font-mono text-xs text-green-500/20">
        {"> Neural interface active"}
      </div>
      <div className="pointer-events-none absolute right-20 top-48 font-mono text-xs text-green-500/20">
        {"> Face tracking: ONLINE"}
      </div>
    </div>
  )
}
