"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload, Save, Camera } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useImageUpload } from "@/hooks/use-image-upload"
import { toast } from "@/hooks/use-toast"

interface ProfileSettingsProps {
  onClose: () => void
}

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const { user, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    username: user?.username || "",
    bio: "",
  })

  const { isUploading, triggerFileSelect, setUploadedImage } = useImageUpload({
    maxSizeInMB: 5,
    onUpload: async (imageUrl) => {
      if (user) {
        await updateProfile({ avatar: imageUrl })
        toast({
          title: "Profile picture updated!",
          description: "Your new profile picture has been saved.",
        })
      }
    },
  })

  useEffect(() => {
    if (user?.avatar) {
      setUploadedImage(user.avatar)
    }
  }, [user?.avatar, setUploadedImage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateProfile({
        displayName: formData.displayName,
        username: formData.username,
      })

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const currentAvatar = user?.avatar

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Profile Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Avatar */}
          <div className="space-y-2">
            <Label className="text-foreground">Profile Picture</Label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                  {currentAvatar ? (
                    <img
                      src={currentAvatar || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-medium text-lg">
                      {formData.displayName.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  size="icon"
                  onClick={triggerFileSelect}
                  disabled={isUploading}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary hover:bg-primary/90 rounded-full"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileSelect}
                  disabled={isUploading}
                  className="bg-secondary border-border text-secondary-foreground hover:bg-secondary/80"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Max 5MB • JPG, PNG, GIF</p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-ring"
              placeholder="Your display name"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">
              Username
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-ring"
              placeholder="@username"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-foreground">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-ring"
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <Label className="text-foreground">Preferences</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={user?.preferences.voiceEnabled}
                  onChange={(e) =>
                    updateProfile({
                      preferences: {
                        ...user!.preferences,
                        voiceEnabled: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-border bg-input text-primary focus:ring-ring"
                />
                <span className="text-muted-foreground">Enable voice messages</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={user?.preferences.notifications}
                  onChange={(e) =>
                    updateProfile({
                      preferences: {
                        ...user!.preferences,
                        notifications: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-border bg-input text-primary focus:ring-ring"
                />
                <span className="text-muted-foreground">Enable notifications</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-secondary border-border text-secondary-foreground"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
