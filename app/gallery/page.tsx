import { blobService } from "../../lib/blob-service"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Images, ArrowLeft, Clock } from "lucide-react"
import { InfiniteGallery } from "../components/infinite-gallery"

async function getInitialImages() {
  try {
    return await blobService.getPaginatedImages(1, 20)
  } catch (error) {
    console.error("Error fetching initial images:", error)
    return {
      images: [],
      pagination: {
        page: 1,
        limit: 20,
        totalCount: 0,
        hasMore: false,
        totalPages: 0,
      },
    }
  }
}

export default async function GalleryPage() {
  const { images, pagination } = await getInitialImages()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Images className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Image Gallery</h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {pagination.totalCount} image{pagination.totalCount !== 1 ? "s" : ""} • Newest first
                    {pagination.hasMore && " • Scroll to load more"}
                  </p>
                </div>
              </div>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Upload
                </Button>
              </Link>
            </div>

            {/* Stats */}
            {pagination.totalCount > 0 && (
              <div className="flex gap-4 text-sm text-gray-600 bg-white rounded-lg p-4 border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Total: {pagination.totalCount} images</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Loaded: {Math.min(20, pagination.totalCount)} images</span>
                </div>
                {pagination.hasMore && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>More available: {pagination.totalCount - 20} images</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Infinite Gallery */}
          <InfiniteGallery initialImages={images} initialPagination={pagination} />
        </div>
      </div>
    </div>
  )
}
