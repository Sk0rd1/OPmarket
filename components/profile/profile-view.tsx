"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Star, UserIcon, MessageCircle, Calendar, Edit, ArrowLeft } from "lucide-react"
import { mockCards } from "@/lib/mock-data"
import { mockUserRatings } from "@/lib/mock-rating-data"
import EditProfileModal from "./edit-profile-modal"
import ProfileCardGrid from "./profile-card-grid"
import type { SampleUser } from "@/lib/sample-users-data"

interface ProfileViewProps {
  user: SampleUser
  isOwnProfile: boolean
}

export default function ProfileView({ user, isOwnProfile }: ProfileViewProps) {
  const [showEditModal, setShowEditModal] = useState(false)

  // Mock user's listings (filter cards by seller)
  const userListings = mockCards.filter((card) =>
    card.listings.some((listing) => listing.seller.toLowerCase() === user.username.toLowerCase()),
  )

  const StarDisplay = ({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )

  const handleMessageUser = () => {
    // Redirect to chats page with this user
    window.location.href = "/chats"
  }

  // Helper function to format date safely
  const formatJoinDate = (date: string): string => {
    try {
      return new Date(date).toLocaleDateString()
    } catch (error) {
      return "Unknown"
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/profile" className="hover:text-blue-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Profile Search
          </Link>
          <span>›</span>
          <span>{user.username}</span>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <Image
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.username}
                      width={200}
                      height={200}
                      className="object-cover"
                    />
                  ) : (
                    <UserIcon className="w-20 h-20 text-gray-600" />
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {formatJoinDate(user.joinDate)}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-4">
                      <StarDisplay rating={Math.round(user.rating.average)} size="w-5 h-5" />
                      <span className="text-lg font-semibold">{user.rating.average.toFixed(1)}</span>
                      <span className="text-gray-600">({user.rating.total} reviews)</span>
                    </div>

                    {/* Total Sales */}
                    {user.totalSales && (
                      <div className="text-gray-600 mb-4">
                        <span className="font-semibold text-blue-900">{user.totalSales}+</span> total sales
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <Button onClick={() => setShowEditModal(true)} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <Button onClick={handleMessageUser} className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Message {user.username}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Me Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent>
            {user.aboutMe ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{user.aboutMe}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No information provided</p>
            )}
          </CardContent>
        </Card>

        {/* Rating & Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Rating & Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900 mb-2">{user.rating.average.toFixed(1)}</div>
                <StarDisplay rating={Math.round(user.rating.average)} size="w-5 h-5" />
                <p className="text-sm text-gray-600 mt-1">Overall Rating</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Communication</span>
                  <span>{user.rating.breakdown.communication.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Speed</span>
                  <span>{user.rating.breakdown.speed.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reliability</span>
                  <span>{user.rating.breakdown.reliability.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{user.rating.total}</div>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Recent Reviews */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Recent Reviews</h3>
              {mockUserRatings.recentRatings.slice(0, 3).map((rating) => (
                <div key={rating.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <button
                          onClick={() => (window.location.href = `/profile/${rating.raterName.toLowerCase()}`)}
                          className="font-medium text-sm hover:text-blue-900 text-left"
                        >
                          {rating.raterName}
                        </button>
                        <p className="text-xs text-gray-500">{rating.cardName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StarDisplay rating={rating.overallRating} />
                      <p className="text-xs text-gray-500 mt-1">{rating.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  {rating.comment && <p className="text-sm text-gray-700 mt-2 pl-11">{rating.comment}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User's Cards for Sale Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {user.username}'s Cards for Sale ({userListings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileCardGrid userListings={userListings} />
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} user={user} />}
    </>
  )
}
