"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, MoreHorizontal, Download, ExternalLink, Edit2, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { deleteImage } from "../actions/image-actions"

interface ImageData {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  downloadUrl: string
}

interface ImageTableViewProps {
  images: ImageData[]
  isLoading?: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  })
}

export function ImageTableView({ images, isLoading }: ImageTableViewProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set())

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(new Set(images.map((img) => img.url)))
    } else {
      setSelectedImages(new Set())
    }
  }

  const handleSelectImage = (url: string, checked: boolean) => {
    const newSelected = new Set(selectedImages)
    if (checked) {
      newSelected.add(url)
    } else {
      newSelected.delete(url)
    }
    setSelectedImages(newSelected)
  }

  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("URL Copied", {
        description: "Image URL copied to clipboard",
      })
    } catch (error) {
      toast.error("Copy Failed", {
        description: "Failed to copy URL to clipboard",
      })
    }
  }

  const handleDeleteImage = async (url: string, pathname: string) => {
    setDeletingImages((prev) => new Set(prev).add(url))

    try {
      const result = await deleteImage(url)

      if (result.success) {
        toast.success("Delete Successful", {
          description: result.message,
        })

        // Remove from selected images if it was selected
        setSelectedImages((prev) => {
          const newSelected = new Set(prev)
          newSelected.delete(url)
          return newSelected
        })

        // Refresh the page to update the list
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        toast.error("Delete Failed", {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error("Delete Error", {
        description: "An unexpected error occurred",
      })
    } finally {
      setDeletingImages((prev) => {
        const newDeleting = new Set(prev)
        newDeleting.delete(url)
        return newDeleting
      })
    }
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox disabled />
              </TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>SIZE</TableHead>
              <TableHead>CREATION DATE</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-6 h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-gray-500">No images to display</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedImages.size === images.length && images.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all images"
              />
            </TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>SIZE</TableHead>
            <TableHead>CREATION DATE</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((image) => {
            const isSelected = selectedImages.has(image.url)
            const isDeleting = deletingImages.has(image.url)

            return (
              <TableRow
                key={image.url}
                className={`${isSelected ? "bg-blue-50" : ""} ${isDeleting ? "opacity-50" : ""}`}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectImage(image.url, checked as boolean)}
                    aria-label={`Select ${image.pathname}`}
                    disabled={isDeleting}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/image/${encodeURIComponent(image.url)}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium max-w-xs truncate block"
                    title={image.pathname}
                  >
                    {image.pathname}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 max-w-xs">
                    <span className="text-gray-600 font-mono text-sm truncate" title={image.url}>
                      {image.url.length > 40 ? `${image.url.substring(0, 40)}...` : image.url}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 flex-shrink-0"
                      onClick={() => copyImageUrl(image.url)}
                      title="Copy Image URL"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">{formatFileSize(image.size)}</TableCell>
                <TableCell className="text-gray-700">{formatDate(image.uploadedAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={isDeleting}>
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <a href={image.downloadUrl} download target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={image.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Full Size
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/image/${encodeURIComponent(image.url)}`}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteImage(image.url, image.pathname)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Selection Summary */}
      {selectedImages.size > 0 && (
        <div className="border-t bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {selectedImages.size} of {images.length} images selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedImages(new Set())}>
                Clear Selection
              </Button>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
