"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, ChevronDown, ChevronLeft, Compass, Sparkles, User, Trash2 } from 'lucide-react'
import useAuth from "@/hooks/use-auth"
import useChatHistory from "@/hooks/use-chat-history"
import { ProfileMenu } from "@/components/profile-menu"

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { user } = useAuth()
  const { sessions, clearHistory } = useChatHistory()

  const todayChats = sessions.filter((session) => {
    const today = new Date()
    const sessionDate = new Date(session.timestamp)
    return sessionDate.toDateString() === today.toDateString()
  })

  const yesterdayChats = sessions.filter((session) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const sessionDate = new Date(session.timestamp)
    return sessionDate.toDateString() === yesterday.toDateString()
  })

  const handleClearChats = () => {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      clearHistory()
    }
  }

  return (
    <div
      className={`bg-card border-r border-gray-700 flex flex-col transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/dashboard" className="text-xl font-semibold text-foreground">
              coolkid.ai
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link href="/create">
          <Button className="w-full justify-start bg-secondary hover:bg-secondary/80 text-secondary-foreground border-0">
            <Plus className="w-5 h-5 mr-3" />
            {!isCollapsed && "Create"}
          </Button>
        </Link>

        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Compass className="w-5 h-5 mr-3" />
            {!isCollapsed && "Discover"}
          </Button>
        </Link>

        <Link href="/avatarfx">
          <Button
            variant="ghost"
            className="w-full justify-start text-purple-400 hover:text-purple-300 hover:bg-accent"
          >
            <Sparkles className="w-5 h-5 mr-3" />
            {!isCollapsed && "AvatarFX"}
          </Button>
        </Link>

        {!isCollapsed && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search"
              className="pl-10 bg-input border-gray-700 text-foreground placeholder-muted-foreground focus:border-ring"
            />
          </div>
        )}

        {/* Chat History */}
        {!isCollapsed && (
          <div className="mt-8">
            {(todayChats.length > 0 || yesterdayChats.length > 0) && (
              <Button
                onClick={handleClearChats}
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 mb-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chats
              </Button>
            )}
            {todayChats.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Today</h3>
                <div className="space-y-1">
                  {todayChats.map((session) => (
                    <Link href={`/chat/${session.characterId}`} key={session.id}>
                      <div className="flex items-center p-2 rounded-lg hover:bg-accent transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mr-3 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {session.characterName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-muted-foreground text-sm font-medium truncate">
                            {session.characterName}
                          </div>
                          <div className="text-muted-foreground text-xs truncate">{session.lastMessage}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {yesterdayChats.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 mt-6">Yesterday</h3>
                <div className="space-y-1">
                  {yesterdayChats.map((session) => (
                    <Link href={`/chat/${session.characterId}`} key={session.id}>
                      <div className="flex items-center p-2 rounded-lg hover:bg-accent transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mr-3 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {session.characterName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-muted-foreground text-sm font-medium truncate">
                            {session.characterName}
                          </div>
                          <div className="text-muted-foreground text-xs truncate">{session.lastMessage}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed && (
          <>
            <div className="text-xs text-muted-foreground space-y-1 mb-4">
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <span className="mx-2">•</span>
              <Link href="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
            </div>

            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 mb-4">
              Upgrade to c.ai+
            </Button>
          </>
        )}

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent p-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mr-3 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-foreground">{user?.displayName || user?.username}</div>
                  <div className="text-xs text-muted-foreground">@{user?.username}</div>
                </div>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>

          {showProfileMenu && !isCollapsed && <ProfileMenu onClose={() => setShowProfileMenu(false)} />}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
