import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  progress: number
  className?: string
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Uploading...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  )
}
