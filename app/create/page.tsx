"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Sidebar from "@/components/sidebar"
import { Upload, ChevronDown, Info, ArrowLeft, Camera } from 'lucide-react'
import useAuth from "@/hooks/use-auth"
import useCharacters from "@/hooks/use-characters"
import { useImageUpload } from "@/hooks/use-image-upload"
import { toast } from "@/hooks/use-toast"

export default function CreateCharacterPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { createCharacter } = useCharacters()
  const [isLoading, setIsLoading] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    greeting: "",
    visibility: "public" as "public" | "unlisted" | "private",
    tags: [] as string[],
    voice: "",
    allowDynamicGreetings: false,
    avatar: "",
  })
  const [tagInput, setTagInput] = useState("")

  const { isUploading, triggerFileSelect, uploadedImage, setUploadedImage } = useImageUpload({
    maxSizeInMB: 5,
    onUpload: (imageUrl) => {
      setFormData((prev) => ({ ...prev, avatar: imageUrl }))
    },
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (uploadedImage) {
      setFormData((prev) => ({ ...prev, avatar: uploadedImage }))
    }
  }, [uploadedImage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      const character = await createCharacter({
        ...formData,
        creator: `@${user.username}`,
        creatorId: user.id,
      })

      toast({
        title: "Character created! 🎉",
        description: `${character.name} has been created successfully.`,
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create character",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    }
    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag(tagInput.trim())
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-4 text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Create a Character</h1>
              <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                📖 View Character Book
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Character Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-neutral-800 rounded-full border-2 border-neutral-700 flex items-center justify-center overflow-hidden">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar || "/placeholder.svg"}
                      alt="Character"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-neutral-500" />
                  )}
                </div>
                <Button
                  type="button"
                  size="icon"
                  onClick={triggerFileSelect}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Upload Instructions */}
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileSelect}
                disabled={isUploading}
                className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Character Image
                  </>
                )}
              </Button>
              <p className="text-sm text-neutral-500 mt-2">Recommended: Square image, at least 400x400px • Max 5MB</p>
            </div>

            {/* Character Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-semibold">
                Character name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. Albert Einstein"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:border-neutral-600"
                maxLength={20}
                required
              />
              <div className="text-right text-sm text-neutral-500">{formData.name.length}/20</div>
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <Label htmlFor="tagline" className="text-lg font-semibold">
                Tagline
              </Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => handleInputChange("tagline", e.target.value)}
                placeholder="Add a short tagline of your Character"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:border-neutral-600"
                maxLength={50}
              />
              <div className="text-right text-sm text-neutral-500">{formData.tagline.length}/50</div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="How would your Character describe themselves?"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:border-neutral-600 min-h-[120px]"
                maxLength={500}
                required
              />
              <div className="text-right text-sm text-neutral-500">{formData.description.length}/500</div>
            </div>

            {/* Greeting */}
            <div className="space-y-2">
              <Label htmlFor="greeting" className="text-lg font-semibold">
                Greeting
              </Label>
              <Textarea
                id="greeting"
                value={formData.greeting}
                onChange={(e) => handleInputChange("greeting", e.target.value)}
                placeholder="e.g. Hello, I am Albert. Ask me anything about my scientific contributions."
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:border-neutral-600 min-h-[100px]"
                maxLength={4096}
                required
              />
              <div className="text-right text-sm text-neutral-500">{formData.greeting.length}/4096</div>
            </div>

            {/* Allow Dynamic Greetings */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="dynamicGreetings"
                checked={formData.allowDynamicGreetings}
                onChange={(e) => handleInputChange("allowDynamicGreetings", e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-neutral-800 border-neutral-600 rounded focus:ring-blue-500"
              />
              <Label htmlFor="dynamicGreetings" className="flex items-center space-x-2">
                <span>Allow dynamic greetings</span>
                <Info className="w-4 h-4 text-neutral-400" />
              </Label>
            </div>

            {/* Voice */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Voice</Label>
              <div className="relative">
                <select
                  value={formData.voice}
                  onChange={(e) => handleInputChange("voice", e.target.value)}
                  className="w-full bg-neutral-800 border-neutral-700 text-white rounded-md px-3 py-2 appearance-none focus:border-neutral-600"
                >
                  <option value="">Add</option>
                  <option value="male-1">Male Voice 1</option>
                  <option value="male-2">Male Voice 2</option>
                  <option value="female-1">Female Voice 1</option>
                  <option value="female-2">Female Voice 2</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Tags</Label>
              <div className="space-y-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Search tags"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:border-neutral-600"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeTag(tag)} className="text-blue-200 hover:text-white">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* More Options */}
            <div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="text-neutral-400 hover:text-white p-0 h-auto"
              >
                <span className="mr-2">More options</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMoreOptions ? "rotate-180" : ""}`} />
              </Button>

              {showMoreOptions && (
                <div className="mt-4 p-4 bg-neutral-800 rounded-lg">
                  <p className="text-neutral-400 text-sm">Additional character customization options coming soon...</p>
                </div>
              )}
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Visibility</Label>
              <div className="relative">
                <select
                  value={formData.visibility}
                  onChange={(e) => handleInputChange("visibility", e.target.value)}
                  className="w-full bg-neutral-800 border-neutral-700 text-white rounded-md px-3 py-2 appearance-none focus:border-neutral-600"
                >
                  <option value="public">🌍 Public</option>
                  <option value="unlisted">🔗 Unlisted</option>
                  <option value="private">🔒 Private</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
              <p className="text-sm text-neutral-500">
                {formData.visibility === "public" && "Anyone can find and chat with your character"}
                {formData.visibility === "unlisted" && "Only people with the link can find your character"}
                {formData.visibility === "private" && "Only you can chat with your character"}
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={isLoading || !formData.name || !formData.description || !formData.greeting}
                className="bg-neutral-600 hover:bg-neutral-500 text-white px-8 py-2 rounded-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Character"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
