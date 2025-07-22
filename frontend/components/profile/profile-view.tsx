"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Calendar, Star, MessageCircle, Edit, Package, DollarSign, TrendingUp } from "lucide-react"
import EditProfileModal from "@/components/profile/edit-profile-modal"
import ProfileCardGrid from "@/components/profile/profile-card-grid"
import { useAuth } from "@/lib/auth-context"

interface ProfileViewProps {
  user: {
    id: string
    username: string
    avatar: string
    aboutMe: string
    joinDate: string
    rating: {
      average: number
      total: number
      breakdown: {
        communication: number
        speed: number
        reliability: number
      }
    }
    totalSales: number
    specialties: string[]
  }
  isOwnProfile: boolean
}

export default function ProfileView({ user, isOwnProfile }: ProfileViewProps) {
  const { user: currentUser } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const formatJoinDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    } catch {
      return dateString
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  <Badge variant="secondary">Verified Seller</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {formatJoinDate(user.joinDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarDisplay rating={Math.round(user.rating.average)} />
                    <span>
                      {user.rating.average.toFixed(1)}/5.0 ({user.rating.total} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {user.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">15</p>
                    <p className="text-sm text-gray-600">Cards Listed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold">{user.totalSales}+</p>
                    <p className="text-sm text-gray-600">Total Sales</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold">{user.rating.total}</p>
                    <p className="text-sm text-gray-600">Reviews</p>
                  </div>
                </div>
              </div>

              {!isOwnProfile && currentUser && (
                <Button className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Me */}
      <Card>
        <CardHeader>
          <CardTitle>About Me</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{user.aboutMe || "No description provided."}</p>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cards">Cards for Sale</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Rating Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Communication</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <StarDisplay rating={Math.round(user.rating.breakdown.communication)} />
                  </div>
                  <p className="text-sm text-gray-600">{user.rating.breakdown.communication.toFixed(1)}/5.0</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">Shipping Speed</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <StarDisplay rating={Math.round(user.rating.breakdown.speed)} />
                  </div>
                  <p className="text-sm text-gray-600">{user.rating.breakdown.speed.toFixed(1)}/5.0</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold">Reliability</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <StarDisplay rating={Math.round(user.rating.breakdown.reliability)} />
                  </div>
                  <p className="text-sm text-gray-600">{user.rating.breakdown.reliability.toFixed(1)}/5.0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Listed new Monkey D. Luffy card</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                  <Badge variant="outline">Listed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Completed trade with ZoroSwordsman</p>
                    <p className="text-sm text-gray-600">1 day ago</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    Completed
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Received 5-star review</p>
                    <p className="text-sm text-gray-600">3 days ago</p>
                  </div>
                  <Badge variant="outline" className="text-yellow-600">
                    ⭐ Review
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards">
          <ProfileCardGrid userId={user.id} />
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">JohnDoe123</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarDisplay rating={5} />
                      <span className="text-sm text-gray-600">2 days ago</span>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Excellent seller! Card arrived quickly and in perfect condition. Great communication throughout.
                  </p>
                </div>
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>SM</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">SarahM</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarDisplay rating={4} />
                      <span className="text-sm text-gray-600">1 week ago</span>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Good transaction overall. Card was as described and shipping was fast.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isOwnProfile && <EditProfileModal open={showEditModal} onOpenChange={setShowEditModal} user={user} />}
    </div>
  )
}
