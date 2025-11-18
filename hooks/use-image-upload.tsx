"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"

interface UseImageUploadOptions {
  maxSizeInMB?: number
  allowedTypes?: string[]
  onUpload?: (imageUrl: string) => void
}

export function useImageUpload({
  maxSizeInMB = 5,
  allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  onUpload,
}: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true)

    try {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `Please upload one of: ${allowedTypes.map((type) => type.split("/")[1]).join(", ")}`,
          variant: "destructive",
        })
        return null
      }

      // Validate file size
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024
      if (file.size > maxSizeInBytes) {
        toast({
          title: "File too large",
          description: `Please upload an image smaller than ${maxSizeInMB}MB`,
          variant: "destructive",
        })
        return null
      }

      // Convert to base64
      const base64 = await fileToBase64(file)
      setUploadedImage(base64)
      onUpload?.(base64)

      toast({
        title: "Image uploaded successfully!",
        description: "Your image has been saved.",
      })

      return base64
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
  }

  const triggerFileSelect = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = allowedTypes.join(",")
    input.onchange = handleFileSelect
    input.click()
  }

  return {
    isUploading,
    uploadedImage,
    uploadImage,
    handleFileSelect,
    triggerFileSelect,
    setUploadedImage,
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
