"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface CopyUrlButtonProps {
  url: string
}

export function CopyUrlButton({ url }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("URL Copied", {
        description: "Image URL copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Copy Failed", {
        description: "Failed to copy URL to clipboard",
      })
    }
  }

  return (
    <Button variant="outline" className="w-full" onClick={copyToClipboard}>
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          Copy Image URL
        </>
      )}
    </Button>
  )
}
