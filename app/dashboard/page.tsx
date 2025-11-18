"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Plus, MessageCircle, Heart, Share } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const { user, loading: authLoading } = useAuth()
  const { getPublicCharacters, searchCharacters, loading: charactersLoading } = useCharacters()

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth")
  }, [authLoading, user, router])

  if (authLoading || charactersLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const publicCharacters = getPublicCharacters()
  const filteredCharacters = searchQuery ? searchCharacters(searchQuery) : publicCharacters

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div>
              <p className="text-2xl font-medium text-muted-foreground mb-1">Welcome back,</p>
              <h1 className="text-3xl font-semibold">{user.displayName}</h1>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 bg-input border-border text-foreground placeholder-muted-foreground focus:border-ring"
              />
            </div>
          </header>

          {/* Characters For You */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">For you</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCharacters.map((character) => (
                <article key={character.id} className="group">
                  <div className="bg-card rounded-lg overflow-hidden hover:bg-card/80 transition-colors">
                    <div className="aspect-[4/3] relative bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {character.avatar ? (
                          <img
                            src={character.avatar || "/placeholder.svg"}
                            alt={character.name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-border"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
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
                      <p className="text-sm text-muted-foreground mb-2">By {character.creator}</p>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {character.tagline || character.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-muted-foreground text-sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {character.interactions}
                        </span>

                        <Link href={`/chat/${character.id}`}>
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            Chat
                          </Button>
                        </Link>
                      </div>

                      {character.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                            {character.tags[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredCharacters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No characters match your search." : "No characters available."}
                </p>

                <Link href="/auth">
                  <Button className="bg-primary hover:bg-primary/90">
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
                  className="bg-muted border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  #{tag}
                </Button>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-border pt-8 mt-12">
            <div className="text-center text-muted-foreground text-sm">
              <p className="mb-2">© 2025 Coolkid.ai. All rights reserved.</p>

              <nav className="flex justify-center space-x-4 mb-4">
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
                <span className="mx-2">•</span>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
                <Link href="/help" className="hover:text-foreground">
                  Help Center
                </Link>
              </nav>

              <p>
                For support, email
                <a href="mailto:officialxoneva@gmail.com" className="text-blue-400 hover:text-blue-300">
                  officialxoneva@gmail.com
                </a>
              </p>
            </div>
          </footer>
        </div>
      </main>
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
