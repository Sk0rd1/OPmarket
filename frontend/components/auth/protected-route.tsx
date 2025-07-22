"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import LoginModal from "./login-modal"
import { useState } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    if (!user) {
      setShowLoginModal(true)
    }
  }, [user])

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
            <p className="text-gray-600">Please sign in to access this page.</p>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSwitchToRegister={() => {}} />
      </>
    )
  }

  return <>{children}</>
}
