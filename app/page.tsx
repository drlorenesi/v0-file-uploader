import { ImageUploadForm } from "./components/image-upload-form"
import { ImageGallery } from "./components/image-gallery"
import { BlobStatisticsCompact } from "./components/blob-statistics-compact"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Images } from "lucide-react"
import { Button } from "@/components/ui/button"

function GalleryLoading() {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading images...</span>
        </div>
      </CardContent>
    </Card>
  )
}

function StatsLoading() {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading stats...</span>
        </div>
      </CardContent>
    </Card>
  )
}

function GalleryError() {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
          <p className="text-gray-600 mb-2">Unable to load image gallery</p>
          <p className="text-sm text-gray-500">Blob storage may still be initializing</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StatsError() {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="w-6 h-6 text-amber-500 mb-2" />
          <p className="text-sm text-gray-600">Stats unavailable</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Upload App</h1>
          <p className="text-gray-600 mb-4">Upload and manage your images with Vercel Blob storage</p>
          <Link href="/gallery">
            <Button variant="outline">
              <Images className="w-4 h-4 mr-2" />
              View Gallery
            </Button>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Upload Form and Statistics - Side by side */}
            <div className="grid gap-6 md:grid-cols-2 lg:gap-8 max-w-4xl mx-auto">
              <div className="flex justify-center">
                <ImageUploadForm />
              </div>
              <div className="flex justify-center">
                <Suspense fallback={<StatsLoading />}>
                  <BlobStatisticsCompact />
                </Suspense>
              </div>
            </div>

            {/* Gallery - Full width below */}
            <div className="w-full">
              <Suspense fallback={<GalleryLoading />}>
                <ImageGallery />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
