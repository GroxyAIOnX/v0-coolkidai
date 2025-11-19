"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import type { User } from "@/hooks/use-auth"
import { Camera, X } from 'lucide-react'

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [avatar, setAvatar] = useState<string>("")
  const [showDotlyAuth, setShowDotlyAuth] = useState(false)
  const [dotlyEmail, setDotlyEmail] = useState("")
  const [dotlyPassword, setDotlyPassword] = useState("")
  const [dotlyUsername, setDotlyUsername] = useState("")
  const [dotlyAvatar, setDotlyAvatar] = useState<string>("")
  const { signIn, signUp, setAuthUser } = useAuth()
  const router = useRouter()

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDotlyAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setDotlyAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive",
      })
      return
    }

    if (isSignUp && !username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      })
      return
    }

    if (isSignUp && !avatar) {
      toast({
        title: "Error",
        description: "Please upload a profile picture",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password, username, avatar)
        toast({
          title: "Welcome to Coolkid.ai! 🎉",
          description: "Your account has been created successfully",
        })
      } else {
        await signIn(email, password)
        toast({
          title: "Welcome back! 👋",
          description: "Successfully signed in",
        })
      }
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    if (provider === "dotly") {
      setShowDotlyAuth(true)
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: `user@${provider}.com`,
        username: `${provider}_user`,
        displayName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        preferences: {
          theme: "dark",
          voiceEnabled: true,
          notifications: true,
        },
      }

      setAuthUser(userData)
      localStorage.setItem("coolkid_user", JSON.stringify(userData))

      toast({
        title: `Welcome! 🎉`,
        description: `Successfully signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Social Login Error",
        description: `Failed to sign in with ${provider}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDotlyAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!dotlyEmail.trim() || !dotlyPassword.trim() || !dotlyUsername.trim() || !dotlyAvatar) {
      toast({
        title: "Error",
        description: "Please fill in all fields and upload an avatar",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: dotlyEmail,
        username: dotlyUsername,
        displayName: dotlyUsername,
        avatar: dotlyAvatar,
        preferences: {
          theme: "dark",
          voiceEnabled: true,
          notifications: true,
        },
      }

      setAuthUser(userData)
      localStorage.setItem("coolkid_user", JSON.stringify(userData))

      toast({
        title: "Welcome! 🎉",
        description: "Successfully signed in with Dotly",
      })

      setShowDotlyAuth(false)
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Dotly Authorization Error",
        description: "Failed to authorize with Dotly. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {showDotlyAuth && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl border border-gray-700 p-8 w-full max-w-md relative">
            <button
              onClick={() => setShowDotlyAuth(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Copilot_20251004_215400-1y7hCanlnzP2wYIkmJE9qCUhqSE667.png"
                alt="Dotly"
                className="w-20 h-20 mx-auto mb-4"
              />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Authorize with Dotly
              </h2>
              <p className="text-sm text-muted-foreground">
                Connect your account to continue
              </p>
            </div>

            <form onSubmit={handleDotlyAuth} className="space-y-4">
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-800 rounded-full border-2 border-gray-700 flex items-center justify-center overflow-hidden">
                    {dotlyAvatar ? (
                      <img src={dotlyAvatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-500 text-center text-xs p-2">Upload Avatar</div>
                    )}
                  </div>
                  <label
                    htmlFor="dotly-avatar-upload"
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      id="dotly-avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleDotlyAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <Input
                type="text"
                placeholder="Username"
                value={dotlyUsername}
                onChange={(e) => setDotlyUsername(e.target.value)}
                required
                className="h-12 rounded-lg border-gray-700 bg-gray-900 text-foreground"
              />

              <Input
                type="email"
                placeholder="Email"
                value={dotlyEmail}
                onChange={(e) => setDotlyEmail(e.target.value)}
                required
                className="h-12 rounded-lg border-gray-700 bg-gray-900 text-foreground"
              />

              <Input
                type="password"
                placeholder="Password"
                value={dotlyPassword}
                onChange={(e) => setDotlyPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 rounded-lg border-gray-700 bg-gray-900 text-foreground"
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg h-12"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authorizing...
                  </>
                ) : (
                  "Continue with Dotly"
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      <header className="bg-card border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-xl font-semibold text-foreground">
              coolkid.ai
            </Link>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isSignUp ? "Login" : "Sign Up"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-sm border border-gray-700 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isSignUp ? "Get access to 10M+ Characters" : "Sign in to continue chatting"}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleSocialLogin("dotly")}
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-12 flex items-center justify-center space-x-3"
              >
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Copilot_20251004_215400-1y7hCanlnzP2wYIkmJE9qCUhqSE667.png"
                  alt="Dotly"
                  className="w-5 h-5"
                />
                <span>Continue with Dotly</span>
              </Button>

              <Button
                onClick={() => handleSocialLogin("apple")}
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-12 flex items-center justify-center space-x-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span>Continue with Apple</span>
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground uppercase tracking-wide">OR</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gray-800 rounded-full border-2 border-gray-700 flex items-center justify-center overflow-hidden">
                          {avatar ? (
                            <img src={avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-gray-500 text-center text-xs p-2">Upload Profile Picture</div>
                          )}
                        </div>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Camera className="w-4 h-4 text-white" />
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Profile picture required for account creation
                      </p>
                    </div>
                    <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="h-12 rounded-lg border-input bg-background text-foreground"
                    />
                  </>
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-lg border-input bg-background text-foreground"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-lg border-input bg-background text-foreground"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-12"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isSignUp ? "Creating account..." : "Signing in..."}
                    </>
                  ) : (
                    `Continue with email`
                  )}
                </Button>
              </form>
            </div>

            <p className="text-xs text-muted-foreground mt-6 text-center">
              By continuing, you agree with the{" "}
              <Link href="/terms" className="underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
            </p>

            <p className="text-sm text-muted-foreground mt-4 text-center">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-foreground hover:underline font-medium"
              >
                {isSignUp ? "Login" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
