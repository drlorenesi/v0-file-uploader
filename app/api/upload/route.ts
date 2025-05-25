import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { blobService } from "../../../lib/blob-service"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API route called")

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("image") as File

    console.log("File received:", file?.name, file?.size)

    // Validate file
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Invalid file format" }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: "File is empty" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Check for duplicates - compare exact filenames (pathname)
    try {
      console.log("Checking for existing files with exact filename...")
      // Force refresh to get the most current file list for duplicate checking
      const blobs = await blobService.getAllBlobs(true)
      const existingFile = blobs.find((blob) => blob.pathname === file.name)

      if (existingFile) {
        console.log(`Duplicate found: ${file.name} already exists`)
        return NextResponse.json(
          {
            success: false,
            error: "duplicate_skipped",
            message: `File already exists with name ${file.name}. Duplicate upload skipped.`,
            existingUrl: existingFile.url,
          },
          { status: 409 },
        )
      }
      console.log(`No duplicate found for: ${file.name}`)
    } catch (listError) {
      console.error("Error checking for duplicates:", listError)
      // If we can't check for duplicates, we'll proceed with upload
      // The blob store will handle any conflicts
    }

    // Upload the file with exact filename (no random suffix)
    console.log("Uploading to blob storage with exact filename...")
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: false, // Use exact filename
    })

    console.log("Upload successful:", blob.url)
    console.log("Final pathname:", blob.pathname)

    // Invalidate cache since new data was added
    blobService.invalidateCache()

    // Revalidate the pages that show images
    revalidatePath("/")
    revalidatePath("/gallery")

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      message: "Image uploaded successfully!",
    })
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

// Add GET method for testing
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Upload API is ready",
  })
}
