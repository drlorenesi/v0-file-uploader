import { getBlobStats } from "../actions/get-blob-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, HardDrive, Activity, ExternalLink, AlertTriangle, CheckCircle, Info } from "lucide-react"
import Link from "next/link"

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getStoreIdFromToken(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return null

  try {
    // Vercel Blob tokens typically contain the store ID
    // Format is usually: vercel_blob_rw_<store_id>_<random_string>
    const parts = token.split("_")
    if (parts.length >= 4 && parts[0] === "vercel" && parts[1] === "blob") {
      return parts[3] // The store ID part
    }

    // Fallback: show first 8 characters if format is different
    return token.substring(0, 8) + "..."
  } catch {
    return "Unknown"
  }
}

export async function BlobStatisticsCompact() {
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN
  const storeId = getStoreIdFromToken()

  // If no token, show configuration error
  if (!hasToken) {
    return (
      <Card className="w-full max-w-sm h-fit border-amber-200 bg-amber-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Blob Store Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 text-amber-500">
              <AlertTriangle className="w-full h-full" />
            </div>
            <p className="text-sm font-medium text-amber-800 mb-2">Configuration Required</p>
            <p className="text-xs text-amber-700 mb-4">
              The <code className="bg-amber-100 px-1 rounded text-xs">BLOB_READ_WRITE_TOKEN</code> environment variable
              is not set.
            </p>

            <div className="bg-amber-100 border border-amber-200 rounded-lg p-3 text-left">
              <p className="text-xs font-medium text-amber-800 mb-2">To fix this:</p>
              <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                <li>Go to your Vercel Dashboard</li>
                <li>Navigate to your project settings</li>
                <li>Add the Vercel Blob integration</li>
                <li>Redeploy your application</li>
              </ol>
            </div>
          </div>

          <div className="pt-3 border-t border-amber-200">
            <div className="text-xs text-amber-600 text-center">
              <p>Blob storage unavailable</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Try to get stats
  let stats
  try {
    stats = await getBlobStats()
  } catch (error) {
    console.error("Error loading blob stats:", error)
    stats = null
  }

  // If token exists but stats failed to load
  if (!stats) {
    return (
      <Card className="w-full max-w-sm h-fit border-red-200 bg-red-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Database className="w-5 h-5" />
            Blob Store Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 text-red-500">
              <Database className="w-full h-full" />
            </div>
            <p className="text-sm font-medium text-red-800 mb-2">Connection Error</p>
            <p className="text-xs text-red-700 mb-4">Unable to load statistics from blob storage.</p>
          </div>

          {/* Store Information */}
          <div className="bg-red-100 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-3 h-3 text-red-600" />
              <p className="text-xs font-medium text-red-800">Store Information</p>
            </div>
            <div className="space-y-1 text-xs text-red-700">
              <div className="flex justify-between">
                <span>Token Status:</span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  Configured
                </span>
              </div>
              {storeId && (
                <div className="flex justify-between">
                  <span>Store ID:</span>
                  <span className="font-mono">{storeId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-red-200">
            <div className="text-xs text-red-600 text-center">
              <p>Blob storage may be initializing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Success case - show normal stats
  return (
    <Card className="w-full max-w-sm h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Blob Store Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <HardDrive className="w-3 h-3 text-blue-600" />
                <p className="text-xs text-blue-600 font-medium">Storage</p>
              </div>
              <p className="text-lg font-bold text-blue-900">{formatBytes(stats.totalStorage)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="w-3 h-3 text-green-600" />
                <p className="text-xs text-green-600 font-medium">Files</p>
              </div>
              <p className="text-lg font-bold text-green-900">{stats.totalFiles}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Avg Size</span>
            <span className="font-medium">{formatBytes(stats.averageFileSize)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Recent (24h)</span>
            <span className="font-medium">{stats.recentUploads}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">This Month</span>
            <span className="font-medium">{stats.uploadDates.thisMonth}</span>
          </div>
        </div>

        {/* Store Information */}
        <div className="bg-gray-50 border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-3 h-3 text-gray-600" />
            <p className="text-xs font-medium text-gray-700">Store Information</p>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Connection:</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Active
              </span>
            </div>
            {storeId && (
              <div className="flex justify-between">
                <span>Store ID:</span>
                <span className="font-mono text-gray-800">{storeId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="text-gray-800">
                {process.env.NODE_ENV === "production" ? "Production" : "Development"}
              </span>
            </div>
          </div>
        </div>

        {/* View More Button */}
        <div className="pt-3 border-t border-gray-200">
          <Link href="/statistics">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Detailed Stats
            </Button>
          </Link>
        </div>

        {/* Quick Info */}
        <div className="text-xs text-gray-500 text-center">
          <p>Real-time statistics</p>
        </div>
      </CardContent>
    </Card>
  )
}
