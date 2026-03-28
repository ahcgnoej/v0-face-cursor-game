"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import FakeCursor from "@/components/fake-cursor"
import GameUI from "@/components/game-ui"
import StartScreen from "@/components/start-screen"
import GameOverScreen from "@/components/game-over-screen"

type GameState = "start" | "playing" | "gameover"

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

  const videoRef = useRef<HTMLVideoElement>(null)
  const faceMeshRef = useRef<any>(null)
  const lastClickTime = useRef(0)
  const smoothCursorPos = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()

  // Generate random target position
  const generateNewTarget = useCallback(() => {
    const padding = 100
    const x = padding + Math.random() * (window.innerWidth - padding * 2)
    const y = 150 + Math.random() * (window.innerHeight - 300)
    setTargetPos({ x, y })
  }, [])

  // Start game
  const startGame = useCallback(() => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(60)
    setMouseUnlocked(false)
    setMouseUnlockTime(0)
    generateNewTarget()
  }, [generateNewTarget])

  // Handle click
  const handleFaceClick = useCallback(() => {
    const now = Date.now()
    if (now - lastClickTime.current < 300) return // Click cooldown
    lastClickTime.current = now

    setIsClicking(true)
    setTimeout(() => setIsClicking(false), 150)

    // Find element at cursor position
    const element = document.elementFromPoint(smoothCursorPos.current.x, smoothCursorPos.current.y)
    if (element) {
      // Trigger click event
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
      // Load MediaPipe scripts
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

      // Wait a bit for scripts to initialize
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

        // Nose tip (landmark 1)
        const nose = landmarks[1]
        const x = (1 - nose.x) * window.innerWidth // Mirror horizontally
        const y = nose.y * window.innerHeight

        setCursorPos({ x, y })

        // Mouth open detection (landmarks 13: upper lip, 14: lower lip)
        const upperLip = landmarks[13]
        const lowerLip = landmarks[14]
        const mouthOpen = Math.abs(upperLip.y - lowerLip.y)

        if (mouthOpen > 0.03) {
          handleFaceClick()
        }
      })

      faceMeshRef.current = faceMesh

      // Setup camera
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
          })
          videoRef.current.srcObject = stream
          await videoRef.current.play()

          // Process video frames
          const processFrame = async () => {
            if (!mounted || !videoRef.current || !faceMeshRef.current) return
            await faceMeshRef.current.send({ image: videoRef.current })
            if (mounted) {
              setTimeout(processFrame, 33) // ~30fps
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
  }, [gameState, handleFaceClick])

  // Smooth cursor movement (lerp)
  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }

    const animate = () => {
      smoothCursorPos.current = {
        x: lerp(smoothCursorPos.current.x, cursorPos.x, 0.15),
        y: lerp(smoothCursorPos.current.y, cursorPos.y, 0.15),
      }

      // Update hovered element
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

  // Handle target click
  const handleTargetClick = useCallback(() => {
    if (gameState !== "playing") return

    setScore((prev) => prev + 1)
    setMouseUnlocked(true)
    setMouseUnlockTime(3)
    generateNewTarget()
  }, [gameState, generateNewTarget])

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
      {/* Hidden video element for face tracking */}
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
            hoveredElement={hoveredElement}
          />

          {!mouseUnlocked && (
            <FakeCursor
              x={smoothCursorPos.current.x || cursorPos.x}
              y={smoothCursorPos.current.y || cursorPos.y}
              isClicking={isClicking}
            />
          )}
        </>
      )}

      {gameState === "gameover" && <GameOverScreen score={score} onRestart={startGame} />}
    </main>
  )
}
