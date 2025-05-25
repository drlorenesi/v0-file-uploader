import { list, type ListBlobResult } from "@vercel/blob"

// Simple in-memory cache for blob data
class BlobCache {
  private cache: ListBlobResult | null = null
  private lastFetch = 0
  private readonly CACHE_DURATION = 30000 // 30 seconds

  async getBlobs(forceRefresh = false): Promise<ListBlobResult> {
    const now = Date.now()

    // Return cached data if it's still fresh and not forcing refresh
    if (!forceRefresh && this.cache && now - this.lastFetch < this.CACHE_DURATION) {
      console.log("🎯 Using cached blob data")
      return this.cache
    }

    console.log("🔄 Fetching fresh blob data from API")

    try {
      // The @vercel/blob package will automatically use BLOB_READ_WRITE_TOKEN
      // if it's available in the environment
      this.cache = await list()
      this.lastFetch = now
      console.log(`📊 Fetched ${this.cache.blobs.length} blobs from API`)
      return this.cache
    } catch (error) {
      console.error("Error fetching blobs:", error)

      // Return cached data if available, even if stale
      if (this.cache) {
        console.log("⚠️ Using stale cached data due to error")
        return this.cache
      }

      // If no cache and error, return empty result
      console.log("🚫 No cached data available, returning empty result")
      return {
        blobs: [],
        hasMore: false,
        cursor: undefined,
      }
    }
  }

  // Invalidate cache when we know data has changed
  invalidate() {
    console.log("🗑️ Invalidating blob cache")
    this.cache = null
    this.lastFetch = 0
  }

  // Get cache info for debugging
  getCacheInfo() {
    return {
      hasCachedData: !!this.cache,
      lastFetch: this.lastFetch,
      age: this.lastFetch ? Date.now() - this.lastFetch : 0,
      isStale: this.lastFetch ? Date.now() - this.lastFetch > this.CACHE_DURATION : true,
      blobCount: this.cache?.blobs.length || 0,
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    }
  }
}

// Export singleton instance
export const blobCache = new BlobCache()
