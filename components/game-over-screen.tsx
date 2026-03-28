"use client"

import { useEffect, useState } from "react"

interface GameOverScreenProps {
  score: number
  onRestart: () => void
}

export default function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [showContent, setShowContent] = useState(false)

  // Animate score counting up
  useEffect(() => {
    setShowContent(true)
    const duration = 1500
    const steps = 30
    const increment = score / steps
    let current = 0
    let step = 0

    const interval = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), score)
      setDisplayScore(current)

      if (step >= steps) {
        clearInterval(interval)
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [score])

  const getMessage = () => {
    if (score >= 20) return { text: "IMPRESSIVE, HUMAN", color: "text-green-400" }
    if (score >= 10) return { text: "ACCEPTABLE PERFORMANCE", color: "text-yellow-400" }
    if (score >= 5) return { text: "RESISTANCE IS FUTILE", color: "text-orange-400" }
    return { text: "PATHETIC ATTEMPT", color: "text-red-400" }
  }

  const message = getMessage()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-8">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
        }}
      />

      {/* Glitch overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent" />

      <div className={`text-center transition-all duration-1000 ${showContent ? "opacity-100" : "opacity-0"}`}>
        {/* Title */}
        <h1
          className="mb-4 text-5xl font-black tracking-widest text-red-500"
          style={{
            textShadow: "0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.4)",
          }}
        >
          TIME&apos;S UP
        </h1>

        {/* Message */}
        <p className={`mb-8 text-xl font-bold ${message.color}`}>{message.text}</p>

        {/* Score display */}
        <div className="mb-12 rounded-xl border border-green-500/30 bg-black/50 p-8 backdrop-blur-sm">
          <p className="mb-2 text-sm uppercase tracking-wider text-green-500/70">Final Score</p>
          <p
            className="font-mono text-8xl font-black text-green-400"
            style={{
              textShadow: "0 0 40px rgba(0, 255, 136, 0.8)",
            }}
          >
            {displayScore.toString().padStart(3, "0")}
          </p>
          <p className="mt-4 text-sm text-green-500/50">targets neutralized</p>
        </div>

        {/* Stats */}
        <div className="mb-8 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{score * 3}s</p>
            <p className="text-xs text-green-500/50">mouse freedom earned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{Math.round((score / 60) * 100)}%</p>
            <p className="text-xs text-green-500/50">clicks per second</p>
          </div>
        </div>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="group relative overflow-hidden rounded-lg border-2 border-green-500 bg-green-500/10 px-12 py-4 transition-all duration-300 hover:bg-green-500/30 hover:shadow-lg hover:shadow-green-500/50"
        >
          <span className="relative z-10 text-xl font-bold uppercase tracking-widest text-green-400">
            Try Again
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-green-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </button>

        {/* Footer message */}
        <p className="mt-8 font-mono text-xs text-green-500/30">
          {"// The AI always wins. But you can keep trying."}
        </p>
      </div>
    </div>
  )
}
