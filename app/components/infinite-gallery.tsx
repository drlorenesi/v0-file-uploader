"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calendar, ExternalLink, Loader2, AlertCircle, RefreshCw, Grid3X3, List } from "lucide-react"
import { ImageActions } from "./image-actions"
import { ImageTableView } from "./image-table-view"
import { useInfiniteScroll } from "../hooks/use-infinite-scroll"
import { toast } from "sonner"

interface ImageData {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  downloadUrl: string
}

interface PaginationData {
  page: number
  limit: number
  totalCount: number
  hasMore: boolean
  totalPages: number
}

interface InfiniteGalleryProps {
  initialImages: ImageData[]
  initialPagination: PaginationData
}

type ViewMode = "grid" | "table"

export function InfiniteGallery({ initialImages, initialPagination }: InfiniteGalleryProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages)
  const [pagination, setPagination] = useState<PaginationData>(initialPagination)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isViewModeLoaded, setIsViewModeLoaded] = useState(false)

  // Load saved view mode from localStorage on component mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem("gallery-view-mode") as ViewMode
    if (savedViewMode && (savedViewMode === "grid" || savedViewMode === "table")) {
      setViewMode(savedViewMode)
    }
    setIsViewModeLoaded(true)
  }, [])

  // Save view mode to localStorage when it changes
  useEffect(() => {
    if (isViewModeLoaded) {
      localStorage.setItem("gallery-view-mode", viewMode)
    }
  }, [viewMode, isViewModeLoaded])

  const loadMoreImages = useCallback(async () => {
    if (isLoading || !pagination.hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      const nextPage = pagination.page + 1
      const response = await fetch(`/api/images?page=${nextPage}&limit=${pagination.limit}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setImages((prev) => [...prev, ...data.images])
        setPagination(data.pagination)
      } else {
        throw new Error(data.error || "Failed to load more images")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load more images"
      setError(errorMessage)
      toast.error("Error", {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, pagination])

  const { loadingRef } = useInfiniteScroll({
    hasMore: pagination.hasMore && viewMode === "grid", // Only enable infinite scroll for grid view
    isLoading,
    onLoadMore: loadMoreImages,
    threshold: 300,
  })

  const retryLoad = () => {
    setError(null)
    loadMoreImages()
  }

  // Listen for image updates (uploads, deletes, renames)
  useEffect(() => {
    const handleStorageChange = () => {
      // Refresh the first page when images are modified
      window.location.reload()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  if (images.length === 0 && !isLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto text-gray-400 mb-4">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No images yet</h3>
        <p className="text-gray-600 mb-6">Upload your first image to get started!</p>
        <Link href="/">
          <Button>Go to Upload</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-3"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 px-3"
            >
              <List className="w-4 h-4 mr-2" />
              Table
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-500">
          Showing {images.length} of {pagination.totalCount} images
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "table" ? (
        <ImageTableView images={images} isLoading={isLoading} />
      ) : (
        <>
          {/* Grid View */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
            {images.map((image, index) => (
              <Card
                key={`${image.url}-${index}`}
                className="overflow-hidden hover:shadow-lg transition-all duration-200 group animate-fade-in border-0 shadow-sm"
                style={{
                  animationDelay: `${(index % 20) * 25}ms`,
                }}
              >
                <Link href={`/image/${encodeURIComponent(image.url)}`} className="block">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.pathname}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                      loading={index < 20 ? "eager" : "lazy"}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white rounded-full p-2 shadow-lg">
                          <ExternalLink className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    </div>
                    {/* New badge for the most recent image */}
                    {index === 0 && (
                      <div className="absolute top-1 left-1">
                        <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-lg">
                          Latest
                        </span>
                      </div>
                    )}
                    {/* Recent badge for images uploaded in the last 24 hours */}
                    {index > 0 && new Date().getTime() - new Date(image.uploadedAt).getTime() < 24 * 60 * 60 * 1000 && (
                      <div className="absolute top-1 left-1">
                        <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-lg">
                          Recent
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Compact card content */}
                <CardContent className="p-2">
                  <div className="space-y-2">
                    <Link href={`/image/${encodeURIComponent(image.url)}`}>
                      <h3
                        className="font-medium text-xs truncate hover:text-blue-600 transition-colors leading-tight"
                        title={image.pathname}
                      >
                        {image.pathname}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="truncate">
                          {new Date(image.uploadedAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                        {(image.size / 1024).toFixed(0)}KB
                      </span>
                    </div>

                    {/* All action buttons in a single row */}
                    <div className="flex gap-0.5">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="flex-1 h-6 text-xs px-0.5"
                        title="Download"
                      >
                        <a href={image.downloadUrl} download target="_blank" rel="noopener noreferrer">
                          <Download className="w-3 h-3" />
                        </a>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="flex-1 h-6 text-xs px-0.5"
                        title="View full size"
                      >
                        <a href={image.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                      <ImageActions imageUrl={image.url} currentName={image.pathname} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Loading/Error States for Grid View */}
          <div ref={loadingRef} className="flex justify-center py-8">
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more images...</span>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>Failed to load more images</span>
                </div>
                <Button onClick={retryLoad} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {!pagination.hasMore && !isLoading && images.length > 0 && (
              <div className="text-center text-gray-500">
                <p className="text-sm">You've reached the end!</p>
                <p className="text-xs mt-1">
                  Showing all {pagination.totalCount} image{pagination.totalCount !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Load More Button for Table View */}
      {viewMode === "table" && pagination.hasMore && (
        <div className="flex justify-center py-4">
          <Button onClick={loadMoreImages} disabled={isLoading} variant="outline">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? "Loading..." : "Load More Images"}
          </Button>
        </div>
      )}

      {/* Progress indicator */}
      {pagination.totalCount > pagination.limit && (
        <div className="text-center text-xs text-gray-500 pb-4">
          {pagination.hasMore && (
            <span className="ml-2">
              • Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
