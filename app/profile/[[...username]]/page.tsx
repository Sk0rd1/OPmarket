"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import ProfileSearch from "@/components/profile/profile-search"
import ProfileView from "@/components/profile/profile-view"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuth, getUserByUsername } from "@/lib/auth-context"

interface User {
  id: string
  username: string
  joinDate: Date
  avatar?: string
  aboutMe?: string
  rating: {
    average: number
    total: number
    breakdown: {
      communication: number
      speed: number
      reliability: number
    }
  }
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const username = params.username?.[0]

    if (!username && currentUser) {
      // No username in URL, show current user's own profile
      setProfileUser(currentUser)
      setIsOwnProfile(true)
    } else if (username) {
      // Username in URL, show that user's profile
      const user = getUserByUsername(username)
      setProfileUser(user)
      setIsOwnProfile(currentUser?.username.toLowerCase() === username.toLowerCase())
    } else if (!currentUser) {
      // No user logged in and no username specified
      setProfileUser(null)
      setIsOwnProfile(false)
    }

    setLoading(false)
  }, [params.username, currentUser])

  const handleUserSelect = (username: string) => {
    if (currentUser && username.toLowerCase() === currentUser.username.toLowerCase()) {
      router.push("/profile")
    } else {
      router.push(`/profile/${username.toLowerCase()}`)
    }
    setSearchQuery("")
  }

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Profile Search */}
          <ProfileSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onUserSelect={handleUserSelect}
            currentUser={currentUser}
          />

          {/* Profile Display */}
          {profileUser ? (
            <ProfileView user={profileUser} isOwnProfile={isOwnProfile} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Search for a user profile</h2>
              <p className="text-gray-600">Use the search bar above to find and view user profiles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
