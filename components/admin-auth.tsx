"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AdminAuthProps {
  onAuthSuccess: () => void
}

export function AdminAuth({ onAuthSuccess }: AdminAuthProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onAuthSuccess()
      } else {
        setAttempts(prev => prev + 1)
        setError(data.message || 'Contraseña incorrecta')
        setPassword("")
      }
    } catch (error) {
      setAttempts(prev => prev + 1)
      setError('Error de conexión. Intenta nuevamente.')
      setPassword("")
    } finally {
      setIsLoading(false)
    }
  }

  const maxAttempts = 3
  const isBlocked = attempts >= maxAttempts

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl border-border shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Panel de Administración
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Ingresa la contraseña para acceder al panel de administración
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa la contraseña"
                    disabled={isLoading || isBlocked}
                    className="pr-10 rounded-xl"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isBlocked}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {isBlocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Demasiados intentos fallidos. Intenta más tarde.</span>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={isLoading || isBlocked || !password.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Verificando...
                  </div>
                ) : (
                  'Acceder'
                )}
              </Button>

              {attempts > 0 && !isBlocked && (
                <p className="text-center text-sm text-muted-foreground">
                  Intentos fallidos: {attempts}/{maxAttempts}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
