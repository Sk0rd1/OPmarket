"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/header"
import ProfileView from "@/components/profile/profile-view"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"
import { getSampleUserByUsername } from "@/lib/sample-users-data"

export default function UserProfilePage() {
  const params = useParams()
  const { user: currentUser } = useAuth()
  const [profileUser, setProfileUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const username = params.username as string

    if (username) {
      // Get sample user profile
      const user = getSampleUserByUsername(username)
      setProfileUser(user)
    }

    setLoading(false)
  }, [params.username])

  if (!currentUser) {
    return (
      <ProtectedRoute>
        <div></div>
      </ProtectedRoute>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
            <p className="text-gray-600">The user you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <ProfileView user={profileUser} isOwnProfile={false} />
      </div>
    </div>
  )
}
