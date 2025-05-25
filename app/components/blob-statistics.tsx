import { getBlobStats } from "../actions/get-blob-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, HardDrive, Activity, TrendingUp, FileImage, Clock } from "lucide-react"

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export async function BlobStatistics() {
  const stats = await getBlobStats()

  if (!stats) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Blob Store Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-center py-4">Failed to load statistics</p>
        </CardContent>
      </Card>
    )
  }

  const topFileTypes = Object.entries(stats.fileTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Blob Store Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Statistics */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Storage
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Total Storage</p>
              <p className="text-lg font-bold text-blue-900">{formatBytes(stats.totalStorage)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Avg File Size</p>
              <p className="text-lg font-bold text-green-900">{formatBytes(stats.averageFileSize)}</p>
            </div>
          </div>
        </div>

        {/* Operations Statistics */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Operations
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-purple-600 font-medium">Total Files</p>
              <p className="text-lg font-bold text-purple-900">{formatNumber(stats.totalFiles)}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-xs text-orange-600 font-medium">Recent (24h)</p>
              <p className="text-lg font-bold text-orange-900">{stats.recentUploads}</p>
            </div>
          </div>
        </div>

        {/* File Size Range */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            File Range
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 font-medium">Largest</p>
              <p className="text-sm font-bold text-gray-900">{formatBytes(stats.largestFile)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 font-medium">Smallest</p>
              <p className="text-sm font-bold text-gray-900">{formatBytes(stats.smallestFile)}</p>
            </div>
          </div>
        </div>

        {/* Upload Activity */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upload Activity
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Today</span>
              <span className="font-medium">{stats.uploadDates.today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Week</span>
              <span className="font-medium">{stats.uploadDates.thisWeek}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month</span>
              <span className="font-medium">{stats.uploadDates.thisMonth}</span>
            </div>
          </div>
        </div>

        {/* File Types */}
        {topFileTypes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              Top File Types
            </h3>
            <div className="space-y-2">
              {topFileTypes.map(([type, count]) => (
                <div key={type} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 uppercase font-mono">{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Info */}
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Statistics updated in real-time</p>
            <p className="mt-1">Based on current blob store data</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
