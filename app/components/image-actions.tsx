"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit2, Trash2, Loader2, AlertTriangle } from "lucide-react"
import { deleteImage, renameImage } from "../actions/image-actions"
import { toast } from "sonner"
import Image from "next/image"

interface ImageActionsProps {
  imageUrl: string
  currentName: string
}

export function ImageActions({ imageUrl, currentName }: ImageActionsProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newName, setNewName] = useState(currentName.replace(/\.[^/.]+$/, "")) // Remove extension
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check if we're on an individual image page
  const isOnImageDetailPage = pathname.startsWith("/image/")
  // Check if we're on the gallery page for compact styling
  const isOnGalleryPage = pathname === "/gallery"

  const handleRename = async () => {
    setIsRenaming(true)
    try {
      const result = await renameImage(imageUrl, newName)

      if (result.success) {
        toast.success("Rename Successful", {
          description: result.message,
        })
        setRenameDialogOpen(false)

        // If on image detail page and rename was successful, redirect to the new URL
        if (isOnImageDetailPage && result.newUrl) {
          router.push(`/image/${encodeURIComponent(result.newUrl)}`)
        }
      } else {
        toast.error("Rename Failed", {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error("Rename Error", {
        description: "An unexpected error occurred",
      })
    } finally {
      setIsRenaming(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteImage(imageUrl)

      if (result.success) {
        toast.success("Delete Successful", {
          description: result.message,
        })

        // If on image detail page, redirect to gallery after successful delete
        if (isOnImageDetailPage) {
          setTimeout(() => {
            router.push("/gallery")
          }, 1000) // Small delay to show the success message
        }
      } else {
        toast.error("Delete Failed", {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error("Delete Error", {
        description: "An unexpected error occurred",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Compact version for gallery - inline with other buttons
  if (isOnGalleryPage) {
    return (
      <>
        {/* Rename Dialog */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="flex-1 h-6 text-xs px-0.5" title="Rename image">
              <Edit2 className="w-3 h-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rename Image</DialogTitle>
              <DialogDescription>
                Enter a new name for your image. The file extension will be preserved.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter new name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleRename} disabled={isRenaming || !newName.trim()}>
                {isRenaming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Alert Dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-6 text-xs px-0.5 text-red-600 hover:text-red-700"
              title="Delete image"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-[500px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Delete Image
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>This action cannot be undone. This will permanently delete the following image:</p>

                  {/* Image Preview */}
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <Image
                          src={imageUrl || "/placeholder.svg"}
                          alt={currentName}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 break-all">{currentName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          This image will be permanently removed from your storage.
                        </p>
                      </div>
                    </div>
                  </div>

                  {isOnImageDetailPage && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800 font-medium">
                        📍 You will be redirected to the gallery after deletion.
                      </p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete Image"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // Full version for other pages
  return (
    <div className="flex gap-1">
      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="flex-1">
            <Edit2 className="w-3 h-3 mr-1" />
            Rename
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Image</DialogTitle>
            <DialogDescription>
              Enter a new name for your image. The file extension will be preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                placeholder="Enter new name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleRename} disabled={isRenaming || !newName.trim()}>
              {isRenaming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog with Image Preview */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:text-red-700">
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Image
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>This action cannot be undone. This will permanently delete the following image:</p>

                {/* Image Preview */}
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt={currentName}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 break-all">{currentName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        This image will be permanently removed from your storage.
                      </p>
                    </div>
                  </div>
                </div>

                {isOnImageDetailPage && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800 font-medium">
                      📍 You will be redirected to the gallery after deletion.
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete Image"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
