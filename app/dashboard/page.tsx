"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Search, Plus, MessageCircle, Heart, Share, Send } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar from "@/components/sidebar"
import CharacterProfileModal, { Character as CharacterType } from "@/components/character-profile-modal"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface Character {
  id: string
  name: string
  description: string
  avatar: string
  tagline?: string
  creator: string
  interactions: number
  tags: string[]
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [profileCharacter, setProfileCharacter] = useState<CharacterType | null>(null)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { user, loading: authLoading } = useAuth()
  const { getPublicCharacters, searchCharacters, loading: charactersLoading } = useCharacters()

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [authLoading, user, router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedCharacter) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          character: selectedCharacter,
          history: messages,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || charactersLoading) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const publicCharacters = getPublicCharacters()
  const filteredCharacters = searchQuery ? searchCharacters(searchQuery) : publicCharacters

  if (selectedCharacter) {
    return (
      <div className="flex h-screen bg-black text-white">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-neutral-800 border-b border-neutral-700 p-4 flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedCharacter(null)
                setMessages([])
              }}
              className="text-neutral-400 hover:text-white"
            >
              ← Back
            </button>
            <img
              src={selectedCharacter.avatar || "/placeholder.svg"}
              alt={selectedCharacter.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-medium">{selectedCharacter.name}</h3>
              <p className="text-sm text-neutral-400">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    message.role === "user" ? "bg-cyan-600 text-white" : "bg-neutral-800 text-white"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 text-white p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-neutral-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-neutral-800 border-t border-neutral-700 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Message ${selectedCharacter.name}...`}
                disabled={isLoading}
                className="flex-1 bg-neutral-700 border border-neutral-600 rounded-full px-4 py-2 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-6 py-2 font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div>
              <p className="text-2xl font-medium text-neutral-400 mb-1">Welcome back,</p>
              <h1 className="text-3xl font-semibold">{user.displayName || user.username}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <Input
                  placeholder="Search characters"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:border-cyan-500"
                />
              </div>
              <Link href="/create">
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Character
                </Button>
              </Link>
            </div>
          </header>

          {/* Characters For You */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">For you</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCharacters.map((character) => (
                <article key={character.id} className="group">
                  <div className="bg-neutral-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors border border-neutral-700">
                    <div className="aspect-[4/3] relative bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {character.avatar ? (
                          <img
                            src={character.avatar || "/placeholder.svg"}
                            alt={character.name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-neutral-600"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {character.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 flex space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 bg-black/20 hover:bg-black/40 text-white"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 bg-black/20 hover:bg-black/40 text-white"
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{character.name}</h3>
                      <p className="text-sm text-neutral-400 mb-2">By {character.creator}</p>
                      <p className="text-sm text-neutral-400 mb-3 line-clamp-2">
                        {character.tagline || character.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-neutral-400 text-sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {character.interactions}
                        </span>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const profileChar: CharacterType = {
                                id: character.id,
                                name: character.name,
                                description: character.description,
                                avatar: character.avatar || "/placeholder.svg",
                                creatorName: character.creator,
                                tagline: character.tagline || "",
                                banner: undefined,
                                interactions: typeof character.interactions === 'string' ? parseInt(character.interactions) : character.interactions,
                                rating: 4.8,
                                tags: character.tags,
                              };
                              setProfileCharacter(profileChar);
                            }}
                            className="bg-neutral-700 text-white hover:bg-neutral-600"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              const selectedChar = { ...character, avatar: character.avatar || "/placeholder.svg" };
                              setSelectedCharacter(selectedChar as any);
                              setProfileCharacter(null);
                            }}
                            className="bg-cyan-600 text-white hover:bg-cyan-700"
                          >
                            Chat
                          </Button>
                        </div>
                      </div>

                      {character.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="bg-neutral-700 text-gray-300 px-2 py-1 rounded text-xs">{character.tags[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredCharacters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-neutral-400 mb-4">
                  {searchQuery ? "No characters match your search." : "No characters available."}
                </p>

                <Link href="/create">
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Character
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* Trending Tags */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Trending Tags</h2>

            <div className="flex flex-wrap gap-3">
              {trendingTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(tag)}
                  className="bg-neutral-800 border-neutral-700 text-gray-300 hover:bg-neutral-700 hover:text-white"
                >
                  #{tag}
                </Button>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-neutral-700 pt-8 mt-12">
            <div className="text-center text-neutral-400 text-sm">
              <p className="mb-2">© 2025 Coolkid.ai. All rights reserved.</p>

              <nav className="flex justify-center space-x-4 mb-4">
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
                <span className="mx-2">•</span>
                <Link href="/terms" className="hover:text-white">
                  Terms of Service
                </Link>
                <Link href="/help" className="hover:text-white">
                  Help Center
                </Link>
              </nav>

              <p>
                For support, email{" "}
                <a href="mailto:officialxoneva@gmail.com" className="text-cyan-400 hover:text-cyan-300">
                  officialxoneva@gmail.com
                </a>
              </p>
            </div>
          </footer>
        </div>
      </main>

      <CharacterProfileModal
        character={profileCharacter}
        isOpen={profileCharacter !== null}
        onClose={() => setProfileCharacter(null)}
        onChat={() => {
          if (profileCharacter) {
            const selectedChar = { ...profileCharacter, avatar: profileCharacter.avatar } as any;
            setSelectedCharacter(selectedChar);
            setProfileCharacter(null);
          }
        }}
      />
    </div>
  )
}

const trendingTags = [
  "romance",
  "fantasy",
  "anime",
  "vampire",
  "bad boy",
  "witch",
  "spy",
  "supernatural",
  "dark romance",
  "high school",
  "mysterious",
  "seductive",
]
