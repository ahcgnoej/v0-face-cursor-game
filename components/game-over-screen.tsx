"use client"

import { useEffect, useState } from "react"

interface GameStats {
  perfectHits: number
  goodHits: number
  misses: number
  maxCombo: number
}

interface GameOverScreenProps {
  score: number
  onRestart: () => void
  stats: GameStats
}

const SCORE_MESSAGES = [
  { min: 50, text: "ABSOLUTE FACE GOD", emoji: "👑🔥", color: "text-pink-400" },
  { min: 30, text: "NOSE LEGEND", emoji: "🏆", color: "text-purple-400" },
  { min: 20, text: "FACE MASTER", emoji: "⭐", color: "text-yellow-400" },
  { min: 15, text: "IMPRESSIVE HUMAN", emoji: "😎", color: "text-green-400" },
  { min: 10, text: "GETTING GOOD!", emoji: "👍", color: "text-cyan-400" },
  { min: 5, text: "NICE START!", emoji: "🌱", color: "text-blue-400" },
  { min: 0, text: "FACE TRAINING COMPLETE", emoji: "💪", color: "text-orange-400" },
]

const FUN_FACTS = [
  "Your nose traveled more than your mouse today!",
  "AI is actually impressed (this is rare)",
  "Your facial muscles got a workout!",
  "Pro tip: Bigger mouth = faster clicks",
  "Fun fact: You look silly right now",
  "The AI has noted your face for... reasons",
  "Your webcam is now your controller!",
  "Face gaming is the future (probably)",
]

export default function GameOverScreen({ score, onRestart, stats }: GameOverScreenProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [funFact, setFunFact] = useState("")

  // Animate score counting up
  useEffect(() => {
    setShowContent(true)
    setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)])
    
    setTimeout(() => setShowStats(true), 1000)
    
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
    for (const msg of SCORE_MESSAGES) {
      if (score >= msg.min) return msg
    }
    return SCORE_MESSAGES[SCORE_MESSAGES.length - 1]
  }

  const message = getMessage()
  const accuracy = stats.perfectHits + stats.goodHits + stats.misses > 0
    ? Math.round(((stats.perfectHits + stats.goodHits) / (stats.perfectHits + stats.goodHits + stats.misses)) * 100)
    : 0

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

      {/* Confetti-like particles for good scores */}
      {score >= 15 && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <span className="text-2xl">{["⭐", "🎉", "✨", "🔥", "💫"][Math.floor(Math.random() * 5)]}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`z-10 text-center transition-all duration-1000 ${showContent ? "opacity-100" : "opacity-0"}`}>
        {/* Title */}
        <h1
          className="mb-4 text-5xl font-black tracking-widest text-green-400"
          style={{
            textShadow: "0 0 30px rgba(0, 255, 136, 0.8), 0 0 60px rgba(0, 255, 136, 0.4)",
          }}
        >
          GAME COMPLETE!
        </h1>

        {/* Message */}
        <div className="mb-8">
          <p className={`text-3xl font-bold ${message.color}`}>
            {message.emoji} {message.text} {message.emoji}
          </p>
        </div>

        {/* Score display */}
        <div className="mb-8 rounded-xl border border-green-500/30 bg-black/50 p-8 backdrop-blur-sm">
          <p className="mb-2 text-sm uppercase tracking-wider text-green-500/70">Final Score</p>
          <p
            className="font-mono text-8xl font-black text-green-400"
            style={{
              textShadow: "0 0 40px rgba(0, 255, 136, 0.8)",
            }}
          >
            {displayScore.toString().padStart(4, "0")}
          </p>
        </div>

        {/* Stats grid */}
        <div className={`mb-8 grid grid-cols-2 gap-4 transition-all duration-500 ${showStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="text-3xl font-bold text-yellow-400">{stats.perfectHits}</p>
            <p className="text-xs text-yellow-500/70">PERFECT</p>
          </div>
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <p className="text-3xl font-bold text-green-400">{stats.goodHits}</p>
            <p className="text-xs text-green-500/70">GOOD</p>
          </div>
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
            <p className="text-3xl font-bold text-orange-400">x{stats.maxCombo}</p>
            <p className="text-xs text-orange-500/70">MAX COMBO</p>
          </div>
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
            <p className="text-3xl font-bold text-cyan-400">{accuracy}%</p>
            <p className="text-xs text-cyan-500/70">ACCURACY</p>
          </div>
        </div>

        {/* Fun fact */}
        <div className="mb-8 rounded-lg bg-green-500/10 px-6 py-3">
          <p className="text-sm italic text-green-400">{`"${funFact}"`}</p>
        </div>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="group relative overflow-hidden rounded-lg border-2 border-green-500 bg-green-500/10 px-12 py-4 transition-all duration-300 hover:scale-105 hover:bg-green-500/30 hover:shadow-lg hover:shadow-green-500/50"
        >
          <span className="relative z-10 text-xl font-bold uppercase tracking-widest text-green-400">
            Play Again!
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-green-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </button>

        {/* Encouraging footer */}
        <p className="mt-8 font-mono text-xs text-green-500/50">
          {"// Every face click makes you stronger. Keep training!"}
        </p>
      </div>
    </div>
  )
}
