"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, CheckCircle, FileImage, CloudUpload } from "lucide-react"
import Image from "next/image"
import { ProgressBar } from "./progress-bar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UploadState {
  success: boolean
  error: string
  message: string
}

export function ImageUploadForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadState, setUploadState] = useState<UploadState | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File", {
        description: "Please select an image file",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: "Please select an image smaller than 5MB",
      })
      return
    }

    setSelectedFile(file)
    setUploadState(null)
    setUploadProgress(0)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragOver(false)
      }
      return newCounter
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      setDragCounter(0)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        processFile(files[0])
      }
    },
    [processFile],
  )

  const clearPreview = () => {
    setPreview(null)
    setSelectedFile(null)
    setUploadState(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const performUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadState(null)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 200)

      const formData = new FormData()
      formData.append("image", selectedFile)

      console.log("Starting upload...")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log("Response status:", response.status)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      console.log("Upload response:", data)

      if (data.success) {
        setUploadState({
          success: true,
          error: "",
          message: data.message,
        })

        toast.success("Upload Successful! 🎉", {
          description: data.message,
          duration: 3000,
        })

        // Clear the form after successful upload
        setTimeout(() => {
          clearPreview()
          setUploadState(null)
          setUploadProgress(0)
        }, 2000)

        // Refresh the page data without full reload using Next.js router
        router.refresh()
      } else {
        // Handle duplicate file case
        if (data.error === "duplicate_skipped") {
          setUploadState({
            success: false,
            error: data.message,
            message: "",
          })

          toast.error("Duplicate File", {
            description: data.message,
          })

          // Clear the form since we're not uploading
          setTimeout(() => {
            clearPreview()
            setUploadState(null)
            setUploadProgress(0)
          }, 3000)
        } else {
          setUploadState({
            success: false,
            error: data.error || "Upload failed",
            message: "",
          })

          toast.error("Upload Failed", {
            description: data.error || "Upload failed",
          })
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadState({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
        message: "",
      })

      toast.error("Upload Error", {
        description: error instanceof Error ? error.message : "Upload failed",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card
      className={`w-full transition-all duration-300 ${
        preview || isDragOver ? "max-w-md" : "max-w-sm"
      } ${isDragOver ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg" : ""}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className={preview ? "pb-4" : "pb-6"}>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Image
        </CardTitle>
        {!preview && !isDragOver && (
          <CardDescription>Select an image file to upload to your blob storage</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Drag and Drop Zone */}
        {isDragOver && (
          <div className="border-2 border-dashed border-blue-500 bg-blue-50 rounded-lg p-8 text-center animate-fade-in">
            <CloudUpload className="w-12 h-12 mx-auto text-blue-500 mb-4" />
            <p className="text-lg font-medium text-blue-700 mb-2">Drop your image here</p>
            <p className="text-sm text-blue-600">Release to upload your image</p>
          </div>
        )}

        {/* File Input - Always visible when not dragging */}
        {!isDragOver && (
          <div className="space-y-2">
            <Label htmlFor="image">Choose Image</Label>
            <div className="relative">
              <Input
                ref={fileInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                required
                className="cursor-pointer"
              />
              <div className="absolute inset-0 flex items-center justify-start pointer-events-none pl-3">
                <span className="text-sm text-gray-500 bg-white px-2">
                  {selectedFile ? "" : "Click to browse or drag & drop"}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Supports: JPEG, PNG, WebP • Max size: 5MB</p>
          </div>
        )}

        {/* Preview Section - Only shows when image is selected */}
        {preview && !isDragOver && (
          <div className="space-y-4 animate-fade-in">
            <div className="relative">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Preview"
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-md border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearPreview}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* File Info - Improved spacing and layout */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="space-y-3">
                {/* File name section */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <FileImage className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 break-all leading-relaxed">{selectedFile?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Selected file</p>
                  </div>
                </div>

                {/* File size section */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">File size</span>
                  <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded border">
                    {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB
                  </span>
                </div>

                {/* File type section */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                  <span className="text-xs text-gray-500">File type</span>
                  <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded border uppercase">
                    {selectedFile?.type.split("/")[1] || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar - Only shows during upload */}
        {isUploading && <ProgressBar progress={uploadProgress} />}

        {/* Upload Button - Only shows when image is selected and not dragging */}
        {preview && !isDragOver && (
          <Button onClick={performUpload} disabled={isUploading || !selectedFile} className="w-full">
            {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {uploadState?.success && <CheckCircle className="w-4 h-4 mr-2 text-green-600" />}
            {isUploading ? "Uploading..." : uploadState?.success ? "Upload Complete!" : "Upload Image"}
          </Button>
        )}

        {/* Status Message */}
        {uploadState && (uploadState.success || uploadState.error) && !isDragOver && (
          <div className={`text-sm ${uploadState.success ? "text-green-600" : "text-red-600"}`}>
            {uploadState.success ? uploadState.message : uploadState.error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
