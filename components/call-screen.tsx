"use client"
import type SpeechRecognition from "speech-recognition"
import { useEffect, useRef, useState, useCallback } from "react"
import { Mic, MicOff, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import type { Character } from "@/hooks/use-characters"
import type { ChatMessage } from "@/hooks/use-chat-history"

interface CallScreenProps {
  character: Character
  messages: ChatMessage[]
  onEndCall: () => void
  onSendMessage: (message: string) => void
  isLoadingAI: boolean
}

// Declare SpeechSynthesis globally for TypeScript
declare global {
  interface Window {
    webkitSpeechSynthesis: typeof SpeechSynthesis
    webkitSpeechSynthesisUtterance: typeof SpeechSynthesisUtterance
  }
}

export function CallScreen({ character, messages, onEndCall, onSendMessage, isLoadingAI }: CallScreenProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [isListening, setIsListening] = useState(false) // State for microphone actively listening
  const lastSpokenMessageIdRef = useRef<string | null>(null) // New ref to track last spoken message

  const speakMessage = useCallback((content: string, gender?: "male" | "female" | "other", messageId?: string) => {
    if (!synthRef.current) return

    // Stop any ongoing speech
    if (synthRef.current.speaking) {
      synthRef.current.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(content)
    utteranceRef.current = utterance // Store reference to current utterance

    const voices = synthRef.current.getVoices()
    let selectedVoice: SpeechSynthesisVoice | undefined

    if (gender === "male") {
      selectedVoice = voices.find((voice) => voice.lang.startsWith("en") && voice.name.includes("Male"))
    } else if (gender === "female") {
      selectedVoice = voices.find((voice) => voice.lang.startsWith("en") && voice.name.includes("Female"))
    }

    if (!selectedVoice) {
      selectedVoice = voices.find((voice) => voice.lang.startsWith("en"))
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
      if (messageId) lastSpokenMessageIdRef.current = messageId // Mark this message as being spoken
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      // lastSpokenMessageIdRef.current = null; // Keep the ID to prevent re-speaking if component re-renders
    }
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error)
      setIsSpeaking(false)
      lastSpokenMessageIdRef.current = null // Clear on error to allow retry if needed
      toast({
        title: "Voice Output Error",
        description: `Failed to speak: ${event.error}`,
        variant: "destructive",
      })
    }

    synthRef.current.speak(utterance)
  }, [])

  // Initialize Speech Recognition and Synthesis
  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const SpeechSynthesis = window.SpeechSynthesis || window.webkitSpeechSynthesis

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true // Continuous listening for call mode
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        if (!isMuted) {
          toast({ title: "Call Active", description: "Microphone is listening." })
        }
      }

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript
        if (transcript.trim()) {
          onSendMessage(transcript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        if (event.error !== "no-speech") {
          toast({
            title: "Microphone Error",
            description: `Error: ${event.error}. Please check permissions.`,
            variant: "destructive",
          })
        }
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        // If not muted and call is still active, restart recognition
        if (!isMuted) {
          try {
            recognitionRef.current?.start()
          } catch (e) {
            console.warn("Recognition restart failed, likely already active or permission issue:", e)
          }
        }
      }
    } else {
      toast({
        title: "Browser Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      })
    }

    if (SpeechSynthesis) {
      synthRef.current = window.speechSynthesis
      synthRef.current.onvoiceschanged = () => {
        console.log("Voices loaded:", synthRef.current?.getVoices())
      }
    } else {
      toast({
        title: "Browser Not Supported",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive",
      })
    }

    // Start recognition on component mount if not muted
    if (!isMuted && recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.warn("Initial recognition start failed:", e)
      }
    }

    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      if (synthRef.current) {
        synthRef.current.cancel()
        synthRef.current = null
      }
    }
  }, [isMuted, onSendMessage])

  // Speak AI messages
  useEffect(() => {
    if (!synthRef.current || messages.length === 0) return

    const lastMessage = messages[messages.length - 1]
    // Only speak if it's an assistant message and it hasn't been spoken yet
    if (lastMessage.role === "assistant" && lastMessage.id !== lastSpokenMessageIdRef.current) {
      speakMessage(lastMessage.content, character.gender, lastMessage.id)
    }
  }, [messages, character.gender]) // Removed speakMessage from dependencies

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newState = !prev
      if (recognitionRef.current) {
        if (newState) {
          recognitionRef.current.stop() // Stop listening when muted
          toast({ title: "Microphone Muted", description: "You are now muted." })
        } else {
          try {
            recognitionRef.current.start() // Start listening when unmuted
            toast({ title: "Microphone Unmuted", description: "Microphone is listening." })
          } catch (e) {
            console.warn("Recognition start failed on unmute:", e)
          }
        }
      }
      return newState
    })
  }

  const handleInterrupt = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      toast({ title: "Interrupted", description: "AI speech stopped." })
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex flex-col items-center justify-center text-white z-50">
      {/* Pulsating dots at the top */}
      <div className="absolute top-8 w-full flex justify-center">
        <div className="relative w-48 h-12">
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white opacity-0 animate-pulse-dots"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  transform: `rotate(${i * 36}deg) translateX(60px)`,
                  transformOrigin: "center center",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Character Info */}
      <div className="flex flex-col items-center mt-20">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <img
            src={character.avatar || "/placeholder.svg"}
            alt={character.name}
            className="w-full h-full object-cover"
          />
          {/* Pulsating ring around avatar */}
          <div
            className={`absolute inset-0 rounded-full border-4 border-blue-400 opacity-0 animate-pulse-ring ${isListening && !isMuted ? "animate-pulse-ring-active" : ""}`}
          />
        </div>
        <h2 className="text-3xl font-bold mt-4">{character.name}</h2>
        <p className="text-lg text-gray-300">character.ai</p>
      </div>

      {/* Tap to Interrupt */}
      <div className="mt-12">
        <Button
          variant="outline"
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 px-8 py-4 rounded-full text-lg"
          onClick={handleInterrupt}
          disabled={!isSpeaking && !isLoadingAI} // Disable if AI is not speaking or thinking
        >
          Tap to interrupt
        </Button>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-16 flex space-x-8">
        <Button
          size="lg"
          className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 flex flex-col items-center justify-center text-white"
          onClick={toggleMute}
        >
          {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          <span className="text-xs mt-1">{isMuted ? "Unmute" : "Mute"}</span>
        </Button>
        <Button
          size="lg"
          className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex flex-col items-center justify-center text-white"
          onClick={onEndCall}
        >
          <PhoneOff className="w-8 h-8" />
          <span className="text-xs mt-1">Hang Up</span>
        </Button>
      </div>

      {/* QR Code Section */}
      <div className="absolute bottom-8 right-8 bg-white/10 p-4 rounded-lg flex items-center space-x-4">
        <div className="text-sm text-gray-300">Chat on the app</div>
        <img src="/placeholder.svg?height=64&width=64" alt="QR Code" className="w-16 h-16 bg-white rounded" />
        {/* Add app store icons here if desired */}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse-dots {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.5);
          }
        }
        .animate-pulse-dots {
          animation: pulse-dots 2s infinite ease-in-out;
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        .animate-pulse-ring {
          animation: none; /* Default to no animation */
        }
        .animate-pulse-ring-active {
          animation: pulse-ring 1.5s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  )
}
