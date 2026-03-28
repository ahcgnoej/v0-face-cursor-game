"use client"

import { useState, useEffect } from "react"

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [bootText, setBootText] = useState<string[]>([])
  const [showButton, setShowButton] = useState(false)

  const bootMessages = [
    "> Initializing system...",
    "> Loading neural interface...",
    "> Face detection module: READY",
    "> Mouse control: HIJACKED",
    "> Escape probability: 0.00%",
    "",
    "> ALERT: AI has taken control",
    "> Your mouse is no longer yours",
    "",
    "> Mission: Click targets to regain control",
    "> Each hit grants 3 seconds of freedom",
    "",
    "> Good luck, human.",
  ]

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < bootMessages.length) {
        setBootText((prev) => [...prev, bootMessages[index]])
        index++
      } else {
        clearInterval(interval)
        setTimeout(() => setShowButton(true), 500)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [])

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

      {/* Logo/Title */}
      <div className="relative mb-8">
        <h1
          className="text-center text-6xl font-black tracking-widest text-green-500"
          style={{
            textShadow: "0 0 30px rgba(0, 255, 136, 0.8), 0 0 60px rgba(0, 255, 136, 0.4)",
          }}
        >
          SYSTEM
          <br />
          OVERRIDE
        </h1>
        <div className="absolute -inset-4 animate-pulse rounded-lg border border-green-500/30" />
      </div>

      {/* Boot text terminal */}
      <div className="mb-8 w-full max-w-lg rounded-lg border border-green-500/30 bg-black/50 p-6 font-mono backdrop-blur-sm">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-green-500/50">terminal</span>
        </div>
        <div className="h-64 overflow-hidden">
          {bootText.map((text, i) => (
            <p
              key={i}
              className={`text-sm ${
                text.includes("ALERT") || text.includes("HIJACKED")
                  ? "text-red-400"
                  : text.includes("Mission") || text.includes("Good luck")
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {text || "\u00A0"}
            </p>
          ))}
          <span className="inline-block h-4 w-2 animate-pulse bg-green-400" />
        </div>
      </div>

      {/* Start button */}
      {showButton && (
        <button
          onClick={onStart}
          className="group relative overflow-hidden rounded-lg border-2 border-green-500 bg-green-500/10 px-12 py-4 transition-all duration-300 hover:bg-green-500/30 hover:shadow-lg hover:shadow-green-500/50"
        >
          <span className="relative z-10 text-xl font-bold uppercase tracking-widest text-green-400">
            Initialize
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-green-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </button>
      )}

      {/* Instructions */}
      {showButton && (
        <div className="mt-8 text-center">
          <p className="text-sm text-green-500/60">Webcam access required</p>
          <p className="mt-1 text-xs text-green-500/40">
            Move your face to control the cursor | Open mouth to click
          </p>
        </div>
      )}
    </div>
  )
}
