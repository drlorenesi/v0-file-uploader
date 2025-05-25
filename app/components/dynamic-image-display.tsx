"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface DynamicImageDisplayProps {
  src: string
  alt: string
  className?: string
}

interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
}

export function DynamicImageDisplay({ src, alt, className }: DynamicImageDisplayProps) {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio,
      })
      setIsLoading(false)
    }

    img.onerror = () => {
      setError(true)
      setIsLoading(false)
    }

    img.src = src
  }, [src])

  if (isLoading) {
    return (
      <Card className="overflow-hidden w-fit max-w-full">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading image...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !dimensions) {
    return (
      <Card className="overflow-hidden w-fit max-w-full">
        <CardContent className="p-0">
          <div className="aspect-video relative max-w-full">
            <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-contain" priority />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate display dimensions
  const maxWidth = 800
  const maxHeight = 600

  let displayWidth = dimensions.width
  let displayHeight = dimensions.height

  // Scale down if image is too large
  if (displayWidth > maxWidth) {
    displayHeight = (displayHeight * maxWidth) / displayWidth
    displayWidth = maxWidth
  }

  if (displayHeight > maxHeight) {
    displayWidth = (displayWidth * maxHeight) / displayHeight
    displayHeight = maxHeight
  }

  return (
    <Card className={`overflow-hidden w-fit max-w-full ${className}`}>
      <CardContent className="p-0">
        <div
          className="relative"
          style={{
            width: displayWidth,
            height: displayHeight,
            maxWidth: "100%",
          }}
        >
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            width={displayWidth}
            height={displayHeight}
            className="w-full h-full object-contain"
            priority
            style={{
              width: displayWidth,
              height: displayHeight,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
