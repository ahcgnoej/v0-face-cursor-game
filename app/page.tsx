"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import FakeCursor from "@/components/fake-cursor"
import GameUI from "@/components/game-ui"
import StartScreen from "@/components/start-screen"
import GameOverScreen from "@/components/game-over-screen"

type GameState = "start" | "playing" | "gameover"
type HitResult = "perfect" | "good" | "miss" | null

interface GameStats {
  perfectHits: number
  goodHits: number
  misses: number
  maxCombo: number
}

const FUNNY_ENCOURAGEMENTS = [
  "Nice face moves!",
  "Your nose is a pro gamer!",
  "AI impressed!",
  "Face control master!",
  "Legendary nostrils!",
  "Face of a champion!",
  "Such face, much click!",
  "Face-tastic!",
  "Nose MVP!",
  "Mouth click king!",
]

const FUNNY_MISS_MESSAGES = [
  "Almost! Your nose tried its best",
  "The target moved! (it didnt)",
  "Lag! Definitely lag!",
  "Your face blinked",
  "Warming up...",
  "That was a test click",
  "AI interference detected",
  "Face calibrating...",
  "Strategic miss",
  "Next one for sure!",
]

export default function Page() {
  const [gameState, setGameState] = useState<GameState>("start")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [mouseUnlocked, setMouseUnlocked] = useState(false)
  const [mouseUnlockTime, setMouseUnlockTime] = useState(0)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isClicking, setIsClicking] = useState(false)
  const [targetPos, setTargetPos] = useState({ x: 200, y: 200 })
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null)

  // New game mechanics
  const [combo, setCombo] = useState(0)
  const [hitResult, setHitResult] = useState<HitResult>(null)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [targetSpawnTime, setTargetSpawnTime] = useState(Date.now())
  const [assistLevel, setAssistLevel] = useState(1.0) // 1.0 = full assist, 0 = no assist
  const [targetBounce, setTargetBounce] = useState({ x: 0, y: 0, rotation: 0 })
  const [showComboFire, setShowComboFire] = useState(false)
  const [stats, setStats] = useState<GameStats>({ perfectHits: 0, goodHits: 0, misses: 0, maxCombo: 0 })

  const videoRef = useRef<HTMLVideoElement>(null)
  const faceMeshRef = useRef<any>(null)
  const lastClickTime = useRef(0)
  const smoothCursorPos = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()
  const bounceAnimationRef = useRef<number>()

  // Target bounce animation
  useEffect(() => {
    const animateBounce = () => {
      setTargetBounce(prev => ({
        x: Math.sin(Date.now() / 500) * 3,
        y: Math.sin(Date.now() / 400) * 2,
        rotation: Math.sin(Date.now() / 600) * 2,
      }))
      bounceAnimationRef.current = requestAnimationFrame(animateBounce)
    }
    animateBounce()
    return () => {
      if (bounceAnimationRef.current) cancelAnimationFrame(bounceAnimationRef.current)
    }
  }, [])

  // Combo fire effect
  useEffect(() => {
    if (combo >= 5) {
      setShowComboFire(true)
    } else {
      setShowComboFire(false)
    }
  }, [combo])

  // Generate random target position
  const generateNewTarget = useCallback(() => {
    const padding = 120
    const x = padding + Math.random() * (window.innerWidth - padding * 2)
    const y = 180 + Math.random() * (window.innerHeight - 350)
    setTargetPos({ x, y })
    setTargetSpawnTime(Date.now())
  }, [])

  // Start game
  const startGame = useCallback(() => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(60)
    setMouseUnlocked(false)
    setMouseUnlockTime(0)
    setCombo(0)
    setAssistLevel(1.0)
    setStats({ perfectHits: 0, goodHits: 0, misses: 0, maxCombo: 0 })
    generateNewTarget()
  }, [generateNewTarget])

  // Calculate timing score
  const getTimingResult = useCallback((): { result: HitResult; points: number } => {
    const timeSinceSpawn = Date.now() - targetSpawnTime
    if (timeSinceSpawn < 800) {
      return { result: "perfect", points: 3 }
    } else if (timeSinceSpawn < 1500) {
      return { result: "good", points: 2 }
    }
    return { result: "good", points: 1 }
  }, [targetSpawnTime])

  // Handle click
  const handleFaceClick = useCallback(() => {
    const now = Date.now()
    if (now - lastClickTime.current < 300) return
    lastClickTime.current = now

    setIsClicking(true)
    setTimeout(() => setIsClicking(false), 150)

    const element = document.elementFromPoint(smoothCursorPos.current.x, smoothCursorPos.current.y)
    if (element) {
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: smoothCursorPos.current.x,
        clientY: smoothCursorPos.current.y,
      })
      element.dispatchEvent(clickEvent)
    }
  }, [])

  // Initialize MediaPipe FaceMesh
  useEffect(() => {
    if (gameState !== "playing") return

    let mounted = true

    const loadFaceMesh = async () => {
      const script1 = document.createElement("script")
      script1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
      script1.crossOrigin = "anonymous"
      document.head.appendChild(script1)

      const script2 = document.createElement("script")
      script2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
      script2.crossOrigin = "anonymous"
      document.head.appendChild(script2)

      await new Promise((resolve) => {
        script2.onload = resolve
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      if (!mounted) return

      const FaceMesh = (window as any).FaceMesh
      if (!FaceMesh) {
        console.error("FaceMesh not loaded")
        return
      }

      const faceMesh = new FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        },
      })

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      faceMesh.onResults((results: any) => {
        if (!mounted || results.multiFaceLandmarks.length === 0) return

        const landmarks = results.multiFaceLandmarks[0]
        const nose = landmarks[1]
        let x = (1 - nose.x) * window.innerWidth
        let y = nose.y * window.innerHeight

        // Auto-assist: pull cursor toward target based on assist level
        if (assistLevel > 0) {
          const dx = targetPos.x - x
          const dy = targetPos.y - y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const assistRange = 200 // pixels within which assist kicks in
          
          if (distance < assistRange) {
            const assistStrength = assistLevel * (1 - distance / assistRange) * 0.4
            x += dx * assistStrength
            y += dy * assistStrength
          }
        }

        setCursorPos({ x, y })

        const upperLip = landmarks[13]
        const lowerLip = landmarks[14]
        const mouthOpen = Math.abs(upperLip.y - lowerLip.y)

        if (mouthOpen > 0.03) {
          handleFaceClick()
        }
      })

      faceMeshRef.current = faceMesh

      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
          })
          videoRef.current.srcObject = stream
          await videoRef.current.play()

          const processFrame = async () => {
            if (!mounted || !videoRef.current || !faceMeshRef.current) return
            await faceMeshRef.current.send({ image: videoRef.current })
            if (mounted) {
              setTimeout(processFrame, 33)
            }
          }
          processFrame()
        } catch (err) {
          console.error("Camera error:", err)
        }
      }
    }

    loadFaceMesh()

    return () => {
      mounted = false
      if (faceMeshRef.current) {
        faceMeshRef.current.close()
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [gameState, handleFaceClick, assistLevel, targetPos])

  // Smooth cursor movement
  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }

    const animate = () => {
      smoothCursorPos.current = {
        x: lerp(smoothCursorPos.current.x, cursorPos.x, 0.15),
        y: lerp(smoothCursorPos.current.y, cursorPos.y, 0.15),
      }

      const element = document.elementFromPoint(smoothCursorPos.current.x, smoothCursorPos.current.y)
      setHoveredElement(element)

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [cursorPos])

  // Game timer
  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("gameover")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Decrease assist level over time
  useEffect(() => {
    if (gameState !== "playing") return

    const decreaseAssist = setInterval(() => {
      setAssistLevel(prev => Math.max(0.1, prev - 0.015)) // Slowly decrease assist
    }, 1000)

    return () => clearInterval(decreaseAssist)
  }, [gameState])

  // Mouse unlock timer
  useEffect(() => {
    if (!mouseUnlocked) return

    const timer = setInterval(() => {
      setMouseUnlockTime((prev) => {
        if (prev <= 0) {
          setMouseUnlocked(false)
          return 0
        }
        return prev - 0.1
      })
    }, 100)

    return () => clearInterval(timer)
  }, [mouseUnlocked])

  // Handle target click (HIT)
  const handleTargetClick = useCallback(() => {
    if (gameState !== "playing") return

    const timing = getTimingResult()
    const comboMultiplier = 1 + Math.floor(combo / 3) * 0.5
    const finalPoints = Math.round(timing.points * comboMultiplier)

    setScore((prev) => prev + finalPoints)
    setCombo((prev) => {
      const newCombo = prev + 1
      setStats(s => ({ ...s, maxCombo: Math.max(s.maxCombo, newCombo) }))
      return newCombo
    })
    setHitResult(timing.result)

    // Update stats
    if (timing.result === "perfect") {
      setStats(s => ({ ...s, perfectHits: s.perfectHits + 1 }))
    } else {
      setStats(s => ({ ...s, goodHits: s.goodHits + 1 }))
    }

    // Set funny message
    const randomEncouragement = FUNNY_ENCOURAGEMENTS[Math.floor(Math.random() * FUNNY_ENCOURAGEMENTS.length)]
    setFeedbackMessage(randomEncouragement)

    // Clear feedback after a moment
    setTimeout(() => {
      setHitResult(null)
      setFeedbackMessage("")
    }, 800)

    setMouseUnlocked(true)
    setMouseUnlockTime(3)
    generateNewTarget()
  }, [gameState, generateNewTarget, getTimingResult, combo])

  // Handle miss (click outside target)
  const handleMiss = useCallback(() => {
    if (gameState !== "playing") return

    // Reset combo but give encouraging message
    setCombo(0)
    setHitResult("miss")
    setStats(s => ({ ...s, misses: s.misses + 1 }))

    const randomMissMessage = FUNNY_MISS_MESSAGES[Math.floor(Math.random() * FUNNY_MISS_MESSAGES.length)]
    setFeedbackMessage(randomMissMessage)

    setTimeout(() => {
      setHitResult(null)
      setFeedbackMessage("")
    }, 800)
  }, [gameState])

  // Handle real mouse for start/gameover screens or when unlocked
  useEffect(() => {
    if (gameState === "playing" && !mouseUnlocked) {
      document.body.style.cursor = "none"
    } else {
      document.body.style.cursor = "auto"
    }

    return () => {
      document.body.style.cursor = "auto"
    }
  }, [gameState, mouseUnlocked])

  return (
    <main className="relative min-h-screen bg-black overflow-hidden select-none">
      <video ref={videoRef} className="hidden" playsInline muted />

      {gameState === "start" && <StartScreen onStart={startGame} />}

      {gameState === "playing" && (
        <>
          <GameUI
            score={score}
            timeLeft={timeLeft}
            mouseUnlocked={mouseUnlocked}
            mouseUnlockTime={mouseUnlockTime}
            targetPos={targetPos}
            onTargetClick={handleTargetClick}
            onMiss={handleMiss}
            hoveredElement={hoveredElement}
            combo={combo}
            hitResult={hitResult}
            feedbackMessage={feedbackMessage}
            targetBounce={targetBounce}
            showComboFire={showComboFire}
            assistLevel={assistLevel}
          />

          {!mouseUnlocked && (
            <FakeCursor
              x={smoothCursorPos.current.x || cursorPos.x}
              y={smoothCursorPos.current.y || cursorPos.y}
              isClicking={isClicking}
              combo={combo}
              showFire={showComboFire}
            />
          )}
        </>
      )}

      {gameState === "gameover" && (
        <GameOverScreen 
          score={score} 
          onRestart={startGame} 
          stats={stats}
        />
      )}
    </main>
  )
}
