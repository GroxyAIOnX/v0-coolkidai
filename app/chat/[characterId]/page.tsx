"use client"

import type React from "react"
import type SpeechRecognition from "speech-recognition"
import { useChat } from "ai/react"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, MoreVertical, Volume2, Share, ThumbsUp, ThumbsDown, Heart, Mic, MicOff, Send } from "lucide-react"
import Sidebar from "@/components/sidebar"
import useAuth from "@/hooks/use-auth"
import useChatHistory from "@/hooks/use-chat-history"
import useCharacters from "@/hooks/use-characters"
import ChatMenu from "@/components/chat-menu"
import { toast } from "@/hooks/use-toast"
import { CallScreen } from "@/components/call-screen" // Import the new CallScreen component

// Declare SpeechSynthesis globally for TypeScript
declare global {
  interface Window {
    webkitSpeechSynthesis: typeof SpeechSynthesis
    webkitSpeechSynthesisUtterance: typeof SpeechSynthesisUtterance
  }
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const characterId = params.characterId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false) // New state for call screen
  const { user, loading } = useAuth()
  const { saveMessage } = useChatHistory()
  const { getCharacter } = useCharacters()

  const character = getCharacter(characterId)

  // Web Speech API instances
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }

    if (!character) {
      router.push("/dashboard")
      return
    }

    // Initialize Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const SpeechSynthesis = window.SpeechSynthesis || window.webkitSpeechSynthesis

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false // Default to false for chat mode
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onstart = () => {
          setIsRecording(true)
          toast({ title: "Listening...", description: "Speak now to send a message." })
        }

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          handleInputChange({ target: { value: transcript } } as React.ChangeEvent<HTMLInputElement>)
          // Automatically submit after speech recognition if not in call mode
          if (!isCallActive) {
            customHandleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)
          }
        }

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          toast({
            title: "Speech Input Error",
            description: `Error: ${event.error}. Please ensure microphone access.`,
            variant: "destructive",
          })
          setIsRecording(false)
        }

        recognitionRef.current.onend = () => {
          setIsRecording(false)
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
          // Voices might not be immediately available
          console.log("Voices loaded:", synthRef.current?.getVoices())
        }
      } else {
        toast({
          title: "Browser Not Supported",
          description: "Speech synthesis is not supported in your browser.",
          variant: "destructive",
        })
      }
    }
  }, [characterId, router, user, loading, character, isCallActive]) // Added isCallActive to dependencies

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      characterId,
    },
    initialMessages: character
      ? [
          {
            id: "welcome-message",
            role: "assistant",
            content: character.greeting,
          },
        ]
      : [],
    onFinish: (message) => {
      if (character) {
        saveMessage(characterId, character.name, {
          id: message.id,
          role: message.role as "user" | "assistant",
          content: message.content,
          timestamp: new Date(),
        })
        // Only speak automatically if not in call mode
        if (!isCallActive) {
          speakMessage(message.content, character.gender, message.id)
        }
      }
    },
    onError: (error) => {
      console.error("Chat error:", error)
      toast({
        title: "Chat Error",
        description: "Failed to get response from character. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Save user messages to history
  const originalHandleSubmit = handleSubmit
  const customHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Prevent default form submission
    if (isLoading) return // Prevent sending multiple messages while loading

    if (input.trim()) {
      // Only save and send if there's actual input
      if (character) {
        saveMessage(characterId, character.name, {
          id: Math.random().toString(),
          role: "user",
          content: input,
          timestamp: new Date(),
        })
      }
      originalHandleSubmit(e) // Call the original handleSubmit from useChat
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Microphone Not Available",
        description: "Speech recognition is not supported or initialized.",
        variant: "destructive",
      })
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.start()
      } catch (e: any) {
        console.error("Error starting recognition:", e)
        toast({
          title: "Microphone Error",
          description: `Could not start microphone: ${e.message}. Please check permissions.`,
          variant: "destructive",
        })
        setIsRecording(false)
      }
    }
  }

  const speakMessage = (content: string, gender?: "male" | "female" | "other", messageId?: string) => {
    if (!synthRef.current) {
      toast({
        title: "Voice Output Not Available",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive",
      })
      return
    }

    // Stop any ongoing speech
    if (synthRef.current.speaking) {
      synthRef.current.cancel()
      setSpeakingMessageId(null)
    }

    const utterance = new SpeechSynthesisUtterance(content)
    const voices = synthRef.current.getVoices()

    let selectedVoice: SpeechSynthesisVoice | undefined

    if (gender === "male") {
      selectedVoice = voices.find((voice) => voice.lang.startsWith("en") && voice.name.includes("Male"))
    } else if (gender === "female") {
      selectedVoice = voices.find((voice) => voice.lang.startsWith("en") && voice.name.includes("Female"))
    }

    // Fallback to a default English voice if specific gender voice not found
    if (!selectedVoice) {
      selectedVoice = voices.find((voice) => voice.lang.startsWith("en"))
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.onstart = () => {
      if (messageId) setSpeakingMessageId(messageId)
    }
    utterance.onend = () => {
      setSpeakingMessageId(null)
    }
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error)
      setSpeakingMessageId(null)
      toast({
        title: "Voice Output Error",
        description: `Failed to speak: ${event.error}`,
        variant: "destructive",
      })
    }

    synthRef.current.speak(utterance)
  }

  const rateResponse = (rating: "up" | "down") => {
    // In a real app, send rating to backend for AI improvement
    console.log(`Rated response: ${rating}`)
    toast({
      title: "Feedback Received",
      description: `You rated this response: ${rating === "up" ? "👍" : "👎"}`,
    })
  }

  const handleSendMessageFromCall = (messageContent: string) => {
    handleInputChange({ target: { value: messageContent } } as React.ChangeEvent<HTMLInputElement>)
    customHandleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      </div>
    )
  }

  if (!user || !character) {
    return null
  }

  if (isCallActive) {
    return (
      <CallScreen
        character={character}
        messages={messages}
        onEndCall={() => setIsCallActive(false)}
        onSendMessage={handleSendMessageFromCall}
        isLoadingAI={isLoading}
      />
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {character.avatar ? (
                <img
                  src={character.avatar || "/placeholder.svg"}
                  alt={character.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{character.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div>
                <h1 className="font-semibold text-lg text-foreground">{character.name}</h1>
                <p className="text-sm text-muted-foreground">By {character.creator}</p>
                <p className="text-xs text-muted-foreground">{character.interactions} interactions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLiked(!isLiked)}
                className={`${isLiked ? "text-red-500" : "text-muted-foreground"} hover:text-red-400 hover:bg-accent`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Share className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCallActive(true)} // Activate call screen
                className={`text-muted-foreground hover:text-foreground hover:bg-accent`}
                title="Start voice call"
              >
                <Phone className="w-5 h-5" />
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
                {showMenu && <ChatMenu character={character} onClose={() => setShowMenu(false)} />}
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div key={message.id || index} className="space-y-4">
              {message.role === "assistant" && (
                <div className="flex items-start space-x-3">
                  {character.avatar ? (
                    <img
                      src={character.avatar || "/placeholder.svg"}
                      alt={character.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">{character.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-foreground">{character.name}</span>
                      <span className="text-xs text-muted-foreground">c.ai</span>
                    </div>
                    <div className="text-foreground whitespace-pre-wrap leading-relaxed mb-2">{message.content}</div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => rateResponse("up")}
                        className="w-6 h-6 text-muted-foreground hover:text-green-400"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => rateResponse("down")}
                        className="w-6 h-6 text-muted-foreground hover:text-red-400"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => speakMessage(message.content, character.gender, message.id)}
                        className={`w-6 h-6 text-muted-foreground hover:text-foreground ${speakingMessageId === message.id ? "text-primary" : ""}`}
                        title="Speak message"
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {message.role === "user" && (
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2 max-w-[80%]">
                    {message.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              {character.avatar ? (
                <img
                  src={character.avatar || "/placeholder.svg"}
                  alt={character.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{character.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-foreground">{character.name}</span>
                  <span className="text-xs text-muted-foreground">c.ai</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <footer className="border-t border-border p-4">
          <form onSubmit={customHandleSubmit} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={`Message ${character.name}...`}
                className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-ring pr-20"
                disabled={isLoading || isRecording}
                maxLength={2000}
              />
              <div className="absolute right-1 top-1 flex items-center space-x-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={toggleRecording}
                  className={`h-8 w-8 ${isRecording ? "text-red-500 hover:text-red-400" : "text-muted-foreground hover:text-foreground"} hover:bg-accent`}
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="h-8 w-8 bg-primary hover:bg-primary/90 disabled:bg-muted"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
              <Phone className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This is A.I. and not a real person. Treat everything it says as fiction
          </p>
        </footer>
      </main>
    </div>
  )
}
