import { blobService } from "../../lib/blob-service"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Images, ExternalLink, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export async function ImageGallery() {
  try {
    const recentImages = await blobService.getRecentImages(6)

    if (recentImages.length === 0) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Images className="w-5 h-5" />
              Your Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <Images className="w-full h-full" />
              </div>
              <p className="text-muted-foreground mb-2">No images uploaded yet</p>
              <p className="text-sm text-gray-500">Upload your first image above to get started!</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Get total count for "View All" button
    const allImages = await blobService.getAllBlobs()

    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Images className="w-5 h-5" />
              Recent Images ({recentImages.length})
            </CardTitle>
            <Link href="/gallery">
              <Button variant="outline" size="sm">
                View All ({allImages.length})
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentImages.map((blob, index) => (
              <Link
                key={blob.url}
                href={`/image/${encodeURIComponent(blob.url)}`}
                className="group block space-y-2 transition-transform hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="relative overflow-hidden rounded-md border">
                  <Image
                    src={blob.url || "/placeholder.svg"}
                    alt={blob.pathname}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover transition-transform group-hover:scale-110"
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-white rounded-full p-2 shadow-lg">
                        <ExternalLink className="w-4 h-4 text-gray-700" />
                      </div>
                    </div>
                  </div>
                  {/* New badge for recently uploaded images */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">Latest</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground truncate group-hover:text-blue-600 transition-colors">
                    {blob.pathname}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(blob.uploadedAt).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>

          {allImages.length > 6 && (
            <div className="mt-4 text-center">
              <Link href="/gallery">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View {allImages.length - 6} more images →
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error("Error loading image gallery:", error)
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="w-5 h-5" />
            Your Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <AlertCircle className="w-full h-full" />
            </div>
            <p className="text-red-600 mb-2">Unable to load images</p>
            <p className="text-sm text-gray-500 mb-4">
              Blob storage is not properly configured. Please check your environment variables.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Expected: BLOB_READ_WRITE_TOKEN environment variable</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
}
