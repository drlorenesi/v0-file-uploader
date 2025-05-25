"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle } from "lucide-react"

interface RedirectLoadingProps {
  message: string
  redirecting?: boolean
}

export function RedirectLoading({ message, redirecting = false }: RedirectLoadingProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    if (redirecting) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
      }, 500)

      return () => clearInterval(interval)
    }
  }, [redirecting])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          {redirecting ? (
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          ) : (
            <CheckCircle className="w-8 h-8 text-green-600" />
          )}
          <div className="text-center">
            <p className="text-lg font-medium">{message}</p>
            {redirecting && <p className="text-sm text-gray-500 mt-1">Redirecting to gallery{dots}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RedirectLoading
