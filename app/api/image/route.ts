import { list } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ success: false, error: "URL parameter is required" }, { status: 400 })
    }

    const decodedUrl = decodeURIComponent(url)
    const { blobs } = await list()
    const image = blobs.find((blob) => blob.url === decodedUrl)

    if (!image) {
      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      image: {
        url: image.url,
        pathname: image.pathname,
        size: image.size,
        uploadedAt: image.uploadedAt,
        downloadUrl: image.downloadUrl,
      },
    })
  } catch (error) {
    console.error("Error fetching image:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch image" }, { status: 500 })
  }
}
