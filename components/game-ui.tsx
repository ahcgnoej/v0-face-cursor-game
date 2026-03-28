"use client"

import { useEffect, useState } from "react"

type HitResult = "perfect" | "good" | "miss" | null

interface GameUIProps {
  score: number
  timeLeft: number
  mouseUnlocked: boolean
  mouseUnlockTime: number
  targetPos: { x: number; y: number }
  onTargetClick: () => void
  onMiss: () => void
  hoveredElement: Element | null
  combo: number
  hitResult: HitResult
  feedbackMessage: string
  targetBounce: { x: number; y: number; rotation: number }
  showComboFire: boolean
  assistLevel: number
}

const COMBO_TITLES = [
  "", // 0
  "", // 1
  "", // 2
  "NICE!", // 3
  "GREAT!", // 4
  "AMAZING!", // 5
  "INCREDIBLE!", // 6
  "UNSTOPPABLE!", // 7
  "GODLIKE!", // 8
  "FACE GOD!", // 9
  "NOSE LEGEND!", // 10+
]

export default function GameUI({
  score,
  timeLeft,
  mouseUnlocked,
  mouseUnlockTime,
  targetPos,
  onTargetClick,
  onMiss,
  hoveredElement,
  combo,
  hitResult,
  feedbackMessage,
  targetBounce,
  showComboFire,
  assistLevel,
}: GameUIProps) {
  const [glitchText, setGlitchText] = useState(false)
  const [scorePopups, setScorePopups] = useState<{ id: number; x: number; y: number; points: number }[]>([])
  const [shakeScreen, setShakeScreen] = useState(false)

  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchText(true)
      setTimeout(() => setGlitchText(false), 100)
    }, 3000 + Math.random() * 5000)

    return () => clearInterval(interval)
  }, [])

  // Screen shake on combo >= 5
  useEffect(() => {
    if (combo >= 5 && hitResult === "perfect") {
      setShakeScreen(true)
      setTimeout(() => setShakeScreen(false), 200)
    }
  }, [combo, hitResult])

  // Add score popup on hit
  useEffect(() => {
    if (hitResult && hitResult !== "miss") {
      const comboMultiplier = 1 + Math.floor(combo / 3) * 0.5
      const points = hitResult === "perfect" ? Math.round(3 * comboMultiplier) : Math.round(2 * comboMultiplier)
      const popup = {
        id: Date.now(),
        x: targetPos.x,
        y: targetPos.y - 50,
        points,
      }
      setScorePopups(prev => [...prev, popup])
      setTimeout(() => {
        setScorePopups(prev => prev.filter(p => p.id !== popup.id))
      }, 1000)
    }
  }, [hitResult, combo, targetPos])

  const getComboTitle = () => {
    if (combo >= 10) return COMBO_TITLES[10]
    return COMBO_TITLES[combo] || ""
  }

  const getComboColor = () => {
    if (combo >= 10) return "text-pink-400"
    if (combo >= 7) return "text-purple-400"
    if (combo >= 5) return "text-orange-400"
    if (combo >= 3) return "text-yellow-400"
    return "text-green-400"
  }

  const handleBackgroundClick = () => {
    onMiss()
  }

  return (
    <div 
      className={`relative h-screen w-full ${shakeScreen ? "animate-shake" : ""}`}
      onClick={handleBackgroundClick}
    >
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

      {/* Combo fire background effect */}
      {showComboFire && (
        <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-t from-orange-500/10 via-transparent to-transparent" />
      )}

      {/* Top status bar */}
      <div className="absolute left-0 right-0 top-0 z-50 border-b border-green-500/30 bg-black/80 p-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          {/* Score */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-green-500/70">Score</span>
            <span className={`font-mono text-2xl font-bold text-green-400 ${glitchText ? "translate-x-0.5 text-red-400" : ""}`}>
              {score.toString().padStart(4, "0")}
            </span>
          </div>

          {/* Combo display */}
          <div className="flex flex-col items-center">
            {combo >= 2 && (
              <div className={`flex items-center gap-2 ${getComboColor()}`}>
                <span className="text-sm uppercase tracking-wider opacity-70">Combo</span>
                <span className={`font-mono text-3xl font-black ${combo >= 5 ? "animate-pulse" : ""}`}>
                  x{combo}
                </span>
                {showComboFire && <span className="text-2xl">🔥</span>}
              </div>
            )}
            {getComboTitle() && (
              <span className={`text-lg font-black ${getComboColor()} animate-bounce`}>
                {getComboTitle()}
              </span>
            )}
          </div>

          {/* Mouse status */}
          <div className="flex flex-col items-center">
            {mouseUnlocked ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="text-sm font-medium text-green-400">MOUSE FREE!</span>
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
                <span className="text-sm font-medium text-red-400">FACE CONTROL</span>
              </div>
            )}
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

        {/* Assist level indicator */}
        <div className="mx-auto mt-2 flex max-w-5xl items-center gap-2">
          <span className="text-xs text-green-500/50">Assist:</span>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-green-900/50">
            <div 
              className="h-full bg-cyan-400/70 transition-all duration-500"
              style={{ width: `${assistLevel * 100}%` }}
            />
          </div>
          <span className="text-xs text-green-500/50">{Math.round(assistLevel * 100)}%</span>
        </div>
      </div>

      {/* Center feedback display */}
      {hitResult && (
        <div className="pointer-events-none absolute left-1/2 top-1/3 z-50 -translate-x-1/2 -translate-y-1/2">
          {hitResult === "perfect" && (
            <div className="animate-bounce text-center">
              <div 
                className="text-6xl font-black text-yellow-400"
                style={{ textShadow: "0 0 30px rgba(255, 200, 0, 0.8), 0 0 60px rgba(255, 200, 0, 0.5)" }}
              >
                PERFECT!
              </div>
              <div className="mt-2 text-xl text-yellow-300">{feedbackMessage}</div>
            </div>
          )}
          {hitResult === "good" && (
            <div className="animate-bounce text-center">
              <div 
                className="text-5xl font-black text-green-400"
                style={{ textShadow: "0 0 20px rgba(0, 255, 136, 0.8)" }}
              >
                GOOD!
              </div>
              <div className="mt-2 text-lg text-green-300">{feedbackMessage}</div>
            </div>
          )}
          {hitResult === "miss" && (
            <div className="text-center animate-wiggle">
              <div className="text-4xl font-bold text-orange-400">
                {feedbackMessage}
              </div>
              <div className="mt-1 text-sm text-orange-300">Keep going! 💪</div>
            </div>
          )}
        </div>
      )}

      {/* Score popups */}
      {scorePopups.map(popup => (
        <div
          key={popup.id}
          className="pointer-events-none absolute z-50 animate-float-up font-mono text-3xl font-black text-yellow-400"
          style={{
            left: popup.x,
            top: popup.y,
            textShadow: "0 0 10px rgba(255, 200, 0, 0.8)",
          }}
        >
          +{popup.points}
        </div>
      ))}

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
        <p className="mt-2 text-sm text-green-500/60">{"// Use your face to click the targets!"}</p>
      </div>

      {/* Target button with physics */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onTargetClick()
        }}
        data-target="true"
        className={`group absolute z-40 flex h-24 w-24 items-center justify-center rounded-2xl border-2 transition-all duration-200 ${
          hoveredElement?.getAttribute("data-target") === "true"
            ? "scale-125 border-green-400 bg-green-500/40 shadow-2xl shadow-green-500/60"
            : "border-green-500/50 bg-green-500/10 hover:border-green-400 hover:bg-green-500/20"
        } ${showComboFire ? "border-orange-400 shadow-orange-500/50" : ""}`}
        style={{
          left: targetPos.x - 48 + targetBounce.x,
          top: targetPos.y - 48 + targetBounce.y,
          transform: `rotate(${targetBounce.rotation}deg)`,
        }}
      >
        <div className="relative">
          <span className={`text-4xl font-bold ${showComboFire ? "text-orange-400" : "text-green-400"}`}>
            CLICK
          </span>
          <div className="absolute -inset-3 animate-ping rounded-xl border border-green-500/30" />
        </div>
      </button>

      {/* Helpful hint for new players */}
      {score === 0 && timeLeft > 55 && (
        <div className="pointer-events-none absolute bottom-32 left-1/2 -translate-x-1/2 animate-pulse text-center">
          <div className="rounded-lg bg-green-500/20 px-6 py-3 backdrop-blur-sm">
            <p className="text-lg text-green-400">Move your face to move the cursor</p>
            <p className="text-sm text-green-300">Open your mouth to click!</p>
          </div>
        </div>
      )}

      {/* Corner decorations */}
      <div className="absolute left-4 top-44 h-20 w-20 border-l-2 border-t-2 border-green-500/30" />
      <div className="absolute right-4 top-44 h-20 w-20 border-r-2 border-t-2 border-green-500/30" />
      <div className="absolute bottom-4 left-4 h-20 w-20 border-b-2 border-l-2 border-green-500/30" />
      <div className="absolute bottom-4 right-4 h-20 w-20 border-b-2 border-r-2 border-green-500/30" />

      {/* Random floating text */}
      <div className="pointer-events-none absolute bottom-20 left-10 font-mono text-xs text-green-500/20">
        {"> Face tracking: ONLINE"}
      </div>
      <div className="pointer-events-none absolute bottom-32 right-10 font-mono text-xs text-green-500/20">
        {"> Neural interface active"}
      </div>
      <div className="pointer-events-none absolute right-20 top-48 font-mono text-xs text-green-500/20">
        {`> Combo multiplier: x${(1 + Math.floor(combo / 3) * 0.5).toFixed(1)}`}
      </div>
    </div>
  )
}
