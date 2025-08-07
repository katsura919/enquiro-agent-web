"use client"

import { useToast } from '@/hooks/useToast'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
      case 'warning':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 p-4 rounded-lg border shadow-lg
            animate-in slide-in-from-right-full duration-300
            ${getBgColor(toast.type)}
          `}
        >
          {getIcon(toast.type)}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => removeToast(toast.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}
