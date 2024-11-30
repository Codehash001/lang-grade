import * as React from "react"
import { type ToastProps as RadixToastProps, ToastProvider, ToastViewport } from "@radix-ui/react-toast"

import { cn } from "@/lib/utils"
import { Toast, ToastClose, ToastDescription, ToastTitle } from "./toast"

interface ToastProps extends RadixToastProps {
  description?: string;
  title?: string;
  variant?: 'default' | 'destructive';
}

const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void
  dismiss: (id?: string) => void
}>({
  toast: () => {},
  dismiss: () => {},
})

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    const id = props.id || Math.random().toString()
    setToasts((toasts) => [...toasts, { ...props, id }])
    return id
  }, [])

  const dismiss = React.useCallback((id?: string) => {
    setToasts((toasts) => toasts.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onOpenChange={(open: any) => {
            if (!open) {
              dismiss(toast.id)
            }
          }}
        >
          <ToastTitle>{toast.title}</ToastTitle>
          {toast.description && (
            <ToastDescription>{toast.description}</ToastDescription>
          )}
          <ToastClose />
        </Toast>
      ))}
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
