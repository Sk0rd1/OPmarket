"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const { register, checkUsernameAvailability } = useAuth()

  // Real-time username availability check
  useEffect(() => {
    const checkUsername = async () => {
      if (username.length >= 3) {
        setCheckingUsername(true)
        const available = await checkUsernameAvailability(username)
        setUsernameAvailable(available)
        setCheckingUsername(false)
      } else {
        setUsernameAvailable(null)
      }
    }

    const timeoutId = setTimeout(checkUsername, 300)
    return () => clearTimeout(timeoutId)
  }, [username, checkUsernameAvailability])

  const validateUsername = (username: string) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/
    return regex.test(username)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!validateUsername(username)) {
      setError("Username must be 3-20 characters, alphanumeric and underscore only")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!usernameAvailable) {
      setError("Username is not available")
      return
    }

    setIsLoading(true)

    try {
      const success = await register(username, password)
      if (success) {
        onClose()
        setUsername("")
        setPassword("")
        setConfirmPassword("")
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setUsername("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setUsernameAvailable(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-blue-900">Sign Up</DialogTitle>
          <DialogDescription className="text-center">Join the One Piece TCG Market community</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose your username"
                required
                className={`pr-10 ${
                  username.length >= 3
                    ? usernameAvailable
                      ? "border-green-500"
                      : usernameAvailable === false
                        ? "border-red-500"
                        : ""
                    : ""
                }`}
              />
              {username.length >= 3 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {checkingUsername ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-900"></div>
                  ) : usernameAvailable ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Username will be your display name on the site. 3-20 characters, alphanumeric + underscore only.
            </p>
            {username.length >= 3 && usernameAvailable !== null && (
              <p className={`text-xs ${usernameAvailable ? "text-green-600" : "text-red-600"}`}>
                {usernameAvailable ? "Username is available!" : "Username is already taken"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
            <p className="text-xs text-gray-500">Minimum 6 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className={
                confirmPassword.length > 0 ? (password === confirmPassword ? "border-green-500" : "border-red-500") : ""
              }
            />
          </div>

          <DialogFooter className="flex-col space-y-2">
            <Button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-800"
              disabled={isLoading || !usernameAvailable}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button type="button" onClick={onSwitchToLogin} className="text-blue-900 hover:underline font-medium">
                Sign in
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
