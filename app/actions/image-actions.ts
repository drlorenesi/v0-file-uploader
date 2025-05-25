"use server"

import { del, copy } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { blobService } from "../../lib/blob-service"

export async function deleteImage(url: string) {
  try {
    await del(url)

    // Invalidate cache since data has changed
    blobService.invalidateCache()

    // Revalidate all pages that might show images
    revalidatePath("/")
    revalidatePath("/gallery")
    revalidatePath("/image/[url]", "page")

    return {
      success: true,
      message: "Image deleted successfully!",
    }
  } catch (error) {
    console.error("Delete error:", error)
    return {
      success: false,
      error: "Failed to delete image. Please try again.",
    }
  }
}

export async function renameImage(oldUrl: string, newName: string) {
  try {
    // Validate the new name
    if (!newName.trim()) {
      return {
        success: false,
        error: "Please provide a valid name",
      }
    }

    // Add file extension if not provided
    const oldPathname = new URL(oldUrl).pathname
    const oldExtension = oldPathname.split(".").pop()
    const newNameWithExtension = newName.includes(".") ? newName : `${newName}.${oldExtension}`

    // Copy the blob with the new name
    const newBlob = await copy(oldUrl, newNameWithExtension, {
      access: "public",
    })

    // Delete the old blob
    await del(oldUrl)

    // Invalidate cache since data has changed
    blobService.invalidateCache()

    // Revalidate all pages that might show images
    revalidatePath("/")
    revalidatePath("/gallery")
    revalidatePath("/image/[url]", "page")

    return {
      success: true,
      message: "Image renamed successfully!",
      newUrl: newBlob.url,
    }
  } catch (error) {
    console.error("Rename error:", error)
    return {
      success: false,
      error: "Failed to rename image. Please try again.",
    }
  }
}
