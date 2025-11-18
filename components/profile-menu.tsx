"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, Settings, LogOut, Moon, Sun } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { ProfileSettings } from "@/components/profile-settings"

interface ProfileMenuProps {
  onClose: () => void
}

export function ProfileMenu({ onClose }: ProfileMenuProps) {
  const [showSettings, setShowSettings] = useState(false)
  const { user, signOut, updateProfile } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  const toggleTheme = async () => {
    if (user) {
      await updateProfile({
        preferences: {
          ...user.preferences,
          theme: user.preferences.theme === "dark" ? "light" : "dark",
        },
      })
    }
  }

  if (showSettings) {
    return <ProfileSettings onClose={() => setShowSettings(false)} />
  }

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card rounded-lg border border-border shadow-lg">
      <div className="p-2 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={() => setShowSettings(true)}
        >
          <User className="w-4 h-4 mr-3" />
          Public profile
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={toggleTheme}
        >
          {user?.preferences.theme === "dark" ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
          {user?.preferences.theme === "dark" ? "Light mode" : "Dark mode"}
        </Button>

        <div className="border-t border-border my-1"></div>

        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )
}
