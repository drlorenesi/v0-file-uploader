import { getBlobStats } from "../actions/get-blob-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Database,
  HardDrive,
  Activity,
  TrendingUp,
  FileImage,
  Clock,
  ArrowLeft,
  BarChart3,
  PieChart,
  Calendar,
} from "lucide-react"
import Link from "next/link"

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

async function StatisticsContent() {
  const stats = await getBlobStats()

  if (!stats) {
    return (
      <div className="text-center py-16">
        <Database className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Statistics</h3>
        <p className="text-gray-600 mb-6">Unable to fetch blob store statistics</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    )
  }

  const topFileTypes = Object.entries(stats.fileTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Storage</p>
                <p className="text-2xl font-bold text-blue-600">{formatBytes(stats.totalStorage)}</p>
              </div>
              <HardDrive className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(stats.totalFiles)}</p>
              </div>
              <FileImage className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Size</p>
                <p className="text-2xl font-bold text-purple-600">{formatBytes(stats.averageFileSize)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent (24h)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.recentUploads}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Storage Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Storage</p>
                <p className="text-xl font-bold text-blue-900">{formatBytes(stats.totalStorage)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Average File</p>
                <p className="text-xl font-bold text-green-900">{formatBytes(stats.averageFileSize)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium">Largest File</span>
                <span className="font-bold">{formatBytes(stats.largestFile)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium">Smallest File</span>
                <span className="font-bold">{formatBytes(stats.smallestFile)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upload Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Today</span>
                </div>
                <span className="font-bold text-blue-900">{stats.uploadDates.today}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">This Week</span>
                </div>
                <span className="font-bold text-green-900">{stats.uploadDates.thisWeek}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">This Month</span>
                </div>
                <span className="font-bold text-purple-900">{stats.uploadDates.thisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              File Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topFileTypes.map(([type, count], index) => {
                const percentage = ((count / stats.totalFiles) * 100).toFixed(1)
                const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500"]
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium uppercase">{type}</span>
                      <span className="text-sm text-gray-600">
                        {count} files ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Operations Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Operations Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">{formatNumber(stats.totalFiles)}</p>
                <p className="text-sm text-blue-600">Total Operations</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-900">{stats.recentUploads}</p>
                <p className="text-sm text-green-600">Recent Activity</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Statistics are calculated in real-time based on your current blob store data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function StatisticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Blob Store Statistics</h1>
              <p className="text-gray-600">Detailed analytics and insights for your Vercel Blob storage</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Statistics Content */}
          <StatisticsContent />
        </div>
      </div>
    </div>
  )
}
