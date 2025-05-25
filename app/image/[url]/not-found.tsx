import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileImage, ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileImage className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle>Image Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">The image you're looking for doesn't exist or may have been deleted.</p>
            <div className="flex gap-2 justify-center">
              <Link href="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/gallery">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Gallery
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
