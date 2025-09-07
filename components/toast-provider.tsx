"use client"

import { Toaster } from "react-hot-toast"

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Configuración por defecto para todos los toasts
        duration: 4000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        // Configuración específica para diferentes tipos
        success: {
          duration: 3000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(142, 76%, 36%)',
          },
          iconTheme: {
            primary: 'hsl(142, 76%, 36%)',
            secondary: 'hsl(var(--background))',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(0, 84%, 60%)',
          },
          iconTheme: {
            primary: 'hsl(0, 84%, 60%)',
            secondary: 'hsl(var(--background))',
          },
        },
        loading: {
          duration: Infinity,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--primary))',
          },
        },
      }}
    />
  )
}
