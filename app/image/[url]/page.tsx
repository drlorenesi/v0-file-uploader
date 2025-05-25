import { blobService } from "../../../lib/blob-service"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Calendar, FileImage, Eye } from "lucide-react"
import { ImageActions } from "../../components/image-actions"
import { CopyUrlButton } from "../../components/copy-url-button"
import { DynamicImageDisplay } from "../../components/dynamic-image-display"
import { notFound } from "next/navigation"

interface ImagePageProps {
  params: Promise<{ url: string }>
}

async function getImageByUrl(encodedUrl: string) {
  try {
    const decodedUrl = decodeURIComponent(encodedUrl)
    return await blobService.findImageByUrl(decodedUrl)
  } catch (error) {
    console.error("Error fetching image:", error)
    return null
  }
}

export default async function ImagePage({ params }: ImagePageProps) {
  const { url: encodedUrl } = await params
  const image = await getImageByUrl(encodedUrl)

  if (!image) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" size="sm">
                <FileImage className="w-4 h-4 mr-2" />
                View Gallery
              </Button>
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            {/* Image Display - Dynamic sizing */}
            <div className="flex justify-center lg:justify-start">
              <DynamicImageDisplay src={image.url} alt={image.pathname} className="shadow-lg" />
            </div>

            {/* Image Details and Actions */}
            <div className="lg:max-w-md">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Image Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Information */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Filename</h3>
                      <p className="text-lg font-medium break-all">{image.pathname}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-1">Upload Date</h3>
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(image.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-1">File Size</h3>
                        <p className="text-sm">{(image.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">URL</h3>
                      <p className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">{image.url}</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-500">Quick Actions</h3>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <a href={image.downloadUrl} download target="_blank" rel="noopener noreferrer">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <a href={image.url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-3 h-3 mr-1" />
                          View Full Size
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* CRUD Operations */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-500">Manage Image</h3>
                    <ImageActions imageUrl={image.url} currentName={image.pathname} />
                  </div>

                  {/* Copy URL */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-500">Share</h3>
                    <CopyUrlButton url={image.url} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
