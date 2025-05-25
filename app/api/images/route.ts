import { blobService } from "../../../lib/blob-service"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    console.log(`API: Fetching images - Page: ${page}, Limit: ${limit}`)

    // Use the blob service which implements caching
    const result = await blobService.getPaginatedImages(page, limit)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch images",
      },
      { status: 500 },
    )
  }
}
