"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function uploadImage(prevState: any, formData: FormData) {
  try {
    // Add debugging and null checks
    console.log("FormData received:", formData)

    if (!formData) {
      return { success: false, error: "No form data received" }
    }

    const file = formData.get("image") as File

    console.log("File extracted:", file)

    if (!file || file.size === 0) {
      return { success: false, error: "No file provided or file is empty" }
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" }
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 5MB" }
    }

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    })

    revalidatePath("/")

    return {
      success: true,
      url: blob.url,
      message: "Image uploaded successfully!",
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: "Failed to upload image. Please try again.",
    }
  }
}
