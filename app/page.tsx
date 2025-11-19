"use client"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const featuredCharacters = [
  {
    id: "1",
    name: "Luna",
    description: "A wise and mystical AI companion who loves discussing philosophy and the mysteries of the universe.",
    avatar: "/placeholder.svg?height=80&width=80",
    category: "Philosophy",
    isOnline: true,
  },
  {
    id: "2",
    name: "Alex",
    description: "A tech-savvy AI assistant ready to help with coding, technology, and creative problem-solving.",
    avatar: "/placeholder.svg?height=80&width=80",
    category: "Technology",
    isOnline: true,
  },
  {
    id: "3",
    name: "Maya",
    description: "A creative storyteller who crafts immersive narratives and helps bring your imagination to life.",
    avatar: "/placeholder.svg?height=80&width=80",
    category: "Creative",
    isOnline: false,
  },
]

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/chat")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Coolkid.ai...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to chat
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-xl font-bold text-foreground">
              coolkid.ai
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                  Start Chatting
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">Chat with Engaging AI Characters</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create meaningful relationships, explore immersive stories, and experience conversations that feel real with
            our advanced AI personalities.
          </p>

          <div className="bg-card border border-gray-700 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-sm font-medium text-foreground">Community Guidelines</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              Our AI characters are designed for engaging, respectful conversations. Content is monitored to ensure a
              safe and positive experience for all users. Please keep interactions appropriate and follow our community
              standards.
            </p>
          </div>

          <div className="space-x-4">
            <Link href="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 border-gray-700 hover:bg-accent hover:text-accent-foreground bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">Meet Our AI Characters</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredCharacters.map((character) => (
              <Card
                key={character.id}
                className="bg-card border-gray-700 hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={character.avatar || "/placeholder.svg"}
                        alt={character.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                          character.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {character.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {character.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{character.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/auth">
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-accent hover:text-accent-foreground bg-transparent"
              >
                View All Characters
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
