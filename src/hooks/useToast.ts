import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

let toastId = 0
let listeners: ((toast: Toast) => void)[] = []

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast])
      
      // Auto remove after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, toast.duration || 4000)
    }

    listeners.push(listener)

    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, removeToast }
}

export const toast = {
  success: (message: string, duration?: number) => {
    const newToast: Toast = {
      id: (++toastId).toString(),
      message,
      type: 'success',
      duration
    }
    listeners.forEach(listener => listener(newToast))
  },
  error: (message: string, duration?: number) => {
    const newToast: Toast = {
      id: (++toastId).toString(),
      message,
      type: 'error',
      duration
    }
    listeners.forEach(listener => listener(newToast))
  },
  info: (message: string, duration?: number) => {
    const newToast: Toast = {
      id: (++toastId).toString(),
      message,
      type: 'info',
      duration
    }
    listeners.forEach(listener => listener(newToast))
  },
  warning: (message: string, duration?: number) => {
    const newToast: Toast = {
      id: (++toastId).toString(),
      message,
      type: 'warning',
      duration
    }
    listeners.forEach(listener => listener(newToast))
  }
}
