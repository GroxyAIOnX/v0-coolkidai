"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  characterId: string
  characterName: string
  lastMessage: string
  timestamp: Date
  messages: ChatMessage[]
}

interface ChatHistoryContextType {
  sessions: ChatSession[]
  getSession: (characterId: string) => ChatSession | undefined
  saveMessage: (characterId: string, characterName: string, message: ChatMessage) => void
  clearHistory: () => void
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined)

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem("chat_history")
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      // Convert timestamp strings back to Date objects
      const sessionsWithDates = parsed.map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))
      setSessions(sessionsWithDates)
    }
  }, [])

  const saveToStorage = (newSessions: ChatSession[]) => {
    localStorage.setItem("chat_history", JSON.stringify(newSessions))
  }

  const getSession = (characterId: string) => {
    return sessions.find((session) => session.characterId === characterId)
  }

  const saveMessage = (characterId: string, characterName: string, message: ChatMessage) => {
    setSessions((prev) => {
      const existingSessionIndex = prev.findIndex((session) => session.characterId === characterId)

      if (existingSessionIndex >= 0) {
        // Update existing session
        const updatedSessions = [...prev]
        const session = updatedSessions[existingSessionIndex]
        session.messages.push(message)
        session.lastMessage = message.content
        session.timestamp = message.timestamp

        // Move to front
        updatedSessions.splice(existingSessionIndex, 1)
        updatedSessions.unshift(session)

        saveToStorage(updatedSessions)
        return updatedSessions
      } else {
        // Create new session
        const newSession: ChatSession = {
          id: Math.random().toString(36).substr(2, 9),
          characterId,
          characterName,
          lastMessage: message.content,
          timestamp: message.timestamp,
          messages: [message],
        }

        const newSessions = [newSession, ...prev]
        saveToStorage(newSessions)
        return newSessions
      }
    })
  }

  const clearHistory = () => {
    setSessions([])
    localStorage.removeItem("chat_history")
  }

  return (
    <ChatHistoryContext.Provider
      value={{
        sessions,
        getSession,
        saveMessage,
        clearHistory,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  )
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext)
  if (context === undefined) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider")
  }
  return context
}

export default useChatHistory
