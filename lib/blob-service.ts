import { blobCache } from "./blob-cache"
import type { ListBlobResultBlob } from "@vercel/blob"

export interface BlobStats {
  totalFiles: number
  totalStorage: number
  averageFileSize: number
  largestFile: number
  smallestFile: number
  recentUploads: number
  fileTypes: Record<string, number>
  uploadDates: {
    today: number
    thisWeek: number
    thisMonth: number
  }
}

export interface PaginatedImages {
  images: Array<{
    url: string
    pathname: string
    size: number
    uploadedAt: string
    downloadUrl: string
  }>
  pagination: {
    page: number
    limit: number
    totalCount: number
    hasMore: boolean
    totalPages: number
  }
}

// Centralized blob service to reduce API calls
export class BlobService {
  // Get all blobs with caching
  async getAllBlobs(forceRefresh = false) {
    const result = await blobCache.getBlobs(forceRefresh)
    return result.blobs
  }

  // Check if a file with exact name already exists
  async fileExists(filename: string, forceRefresh = false): Promise<boolean> {
    const blobs = await this.getAllBlobs(forceRefresh)
    return blobs.some((blob) => blob.pathname === filename)
  }

  // Get recent images for home page
  async getRecentImages(limit = 6, forceRefresh = false) {
    const blobs = await this.getAllBlobs(forceRefresh)
    const sortedBlobs = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    return sortedBlobs.slice(0, limit)
  }

  // Get paginated images for gallery
  async getPaginatedImages(page = 1, limit = 20, forceRefresh = false): Promise<PaginatedImages> {
    const blobs = await this.getAllBlobs(forceRefresh)
    const sortedBlobs = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    const offset = (page - 1) * limit
    const paginatedBlobs = sortedBlobs.slice(offset, offset + limit)
    const hasMore = offset + limit < sortedBlobs.length
    const totalCount = sortedBlobs.length

    return {
      images: paginatedBlobs.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        downloadUrl: blob.downloadUrl,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }

  // Find specific image by URL
  async findImageByUrl(targetUrl: string, forceRefresh = false): Promise<ListBlobResultBlob | null> {
    const blobs = await this.getAllBlobs(forceRefresh)
    return blobs.find((blob) => blob.url === targetUrl) || null
  }

  // Find specific image by pathname (exact filename)
  async findImageByPathname(pathname: string, forceRefresh = false): Promise<ListBlobResultBlob | null> {
    const blobs = await this.getAllBlobs(forceRefresh)
    return blobs.find((blob) => blob.pathname === pathname) || null
  }

  // Calculate statistics
  async getStatistics(forceRefresh = false): Promise<BlobStats | null> {
    try {
      const blobs = await this.getAllBlobs(forceRefresh)

      if (blobs.length === 0) {
        return {
          totalFiles: 0,
          totalStorage: 0,
          averageFileSize: 0,
          largestFile: 0,
          smallestFile: 0,
          recentUploads: 0,
          fileTypes: {},
          uploadDates: {
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
          },
        }
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const totalStorage = blobs.reduce((sum, blob) => sum + blob.size, 0)
      const averageFileSize = totalStorage / blobs.length
      const fileSizes = blobs.map((blob) => blob.size)
      const largestFile = Math.max(...fileSizes)
      const smallestFile = Math.min(...fileSizes)

      const recentUploads = blobs.filter(
        (blob) => new Date(blob.uploadedAt).getTime() > now.getTime() - 24 * 60 * 60 * 1000,
      ).length

      const fileTypes: Record<string, number> = {}
      blobs.forEach((blob) => {
        const extension = blob.pathname.split(".").pop()?.toLowerCase() || "unknown"
        fileTypes[extension] = (fileTypes[extension] || 0) + 1
      })

      const uploadDates = {
        today: blobs.filter((blob) => new Date(blob.uploadedAt) >= today).length,
        thisWeek: blobs.filter((blob) => new Date(blob.uploadedAt) >= thisWeek).length,
        thisMonth: blobs.filter((blob) => new Date(blob.uploadedAt) >= thisMonth).length,
      }

      return {
        totalFiles: blobs.length,
        totalStorage,
        averageFileSize,
        largestFile,
        smallestFile,
        recentUploads,
        fileTypes,
        uploadDates,
      }
    } catch (error) {
      console.error("Error calculating statistics:", error)
      return null
    }
  }

  // Invalidate cache when data changes
  invalidateCache() {
    blobCache.invalidate()
  }

  // Get cache debug info
  getCacheInfo() {
    return blobCache.getCacheInfo()
  }
}

// Export singleton instance
export const blobService = new BlobService()
