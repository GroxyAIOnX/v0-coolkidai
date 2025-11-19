"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  preferences: {
    theme: "light" | "dark"
    voiceEnabled: boolean
    notifications: boolean
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string, avatar?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  setAuthUser: (u: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("coolkid_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate authentication: check if email and password are "valid"
    if (!email.includes("@") || password.length < 6) {
      throw new Error("Invalid email or password")
    }

    // Simulate loading the *existing* user from localStorage if they "authenticate"
    const savedUser = localStorage.getItem("coolkid_user")
    if (savedUser) {
      const parsedUser: User = JSON.parse(savedUser)
      // In a real app, you'd match by email/ID from the backend.
      // For this simulation, we'll assume if any user data exists, and the email matches, it's "this" user.
      if (parsedUser.email === email) {
        setUser(parsedUser)
        // No need to save to localStorage here, it's already there.
      } else {
        throw new Error("User not found or credentials do not match.")
      }
    } else {
      // If no user data in localStorage, it means they haven't signed up yet
      throw new Error("No account found with this email. Please sign up.")
    }
  }

  const signUp = async (email: string, password: string, username: string, avatar?: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long")
    }
    if (!email.includes("@")) {
      throw new Error("Please enter a valid email address")
    }
    if (username.length < 2) {
      throw new Error("Username must be at least 2 characters long")
    }

    // Check if user already exists (simulated)
    const existingUser = localStorage.getItem("coolkid_user")
    if (existingUser && JSON.parse(existingUser).email === email) {
      throw new Error("Account with this email already exists. Please sign in.")
    }

    const newUserData: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      username,
      displayName: username,
      avatar: avatar || undefined,
      preferences: {
        theme: "dark",
        voiceEnabled: true,
        notifications: true,
      },
    }

    setUser(newUserData)
    localStorage.setItem("coolkid_user", JSON.stringify(newUserData))
  }

  const signOut = async () => {
    setUser(null)
    // Keep user data in localStorage, only clear chat history
    localStorage.removeItem("chat_history")
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("coolkid_user", JSON.stringify(updatedUser))
  }

  const setAuthUser = (u: User | null) => {
    setUser(u)
    if (u) {
      localStorage.setItem("coolkid_user", JSON.stringify(u))
    } else {
      // This path is for clearing user data, which we want to avoid on logout
      // but might be used for other scenarios (e.g., account deletion).
      localStorage.removeItem("coolkid_user")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        setAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default useAuth
export type { User }
