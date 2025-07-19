"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Calendar, Package, DollarSign, TrendingUp, Edit, Star } from "lucide-react"
import RatingDisplay from "@/components/rating-display"
import ProtectedRoute from "@/components/auth/protected-route"
import EditProfileModal from "@/components/profile/edit-profile-modal"
import { useAuth } from "@/lib/auth-context"

export default function MyProfilePage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "overview"
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { user } = useAuth()

  // Mock user data - in real app this would come from your auth context/API
  const currentUser = {
    id: "current-user",
    username: user?.username || "CardMaster123",
    avatar: user?.avatar || "/placeholder.svg?height=100&width=100&text=User",
    aboutMe:
      user?.aboutMe ||
      "Passionate One Piece TCG collector and trader! I specialize in rare Straw Hat crew cards and always ensure fast, secure shipping. Feel free to message me about bulk deals or trades. Happy collecting! 🏴‍☠️",
    joinDate: "January 2024",
    rating: {
      average: 4.8,
      total: 23,
      breakdown: {
        communication: 4.9,
        speed: 4.7,
        reliability: 4.8,
      },
    },
    stats: {
      cardsListed: 47,
      totalSales: 1234,
      completedTrades: 89,
    },
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your account and view your trading statistics</p>
            </div>
            <Button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ratings" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Ratings & Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-center mb-4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.username} />
                          <AvatarFallback>
                            <User className="w-10 h-10" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold">{currentUser.username}</h3>
                        <Badge variant="secondary" className="mt-1">
                          Verified Seller
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm">Member since {currentUser.joinDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <span className="text-sm">
                            {currentUser.rating.average.toFixed(1)}/5.0 ({currentUser.rating.total} reviews)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* About Me Section */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 leading-relaxed">{currentUser.aboutMe}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Statistics */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Package className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="text-2xl font-bold">{currentUser.stats.cardsListed}</p>
                            <p className="text-sm text-gray-600">Cards Listed</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-8 h-8 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold">${currentUser.stats.totalSales}</p>
                            <p className="text-sm text-gray-600">Total Sales</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-8 h-8 text-purple-600" />
                          <div>
                            <p className="text-2xl font-bold">{currentUser.stats.completedTrades}</p>
                            <p className="text-sm text-gray-600">Completed Trades</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Rating Breakdown */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Rating Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Communication</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= currentUser.rating.breakdown.communication
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {currentUser.rating.breakdown.communication.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Shipping Speed</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= currentUser.rating.breakdown.speed
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {currentUser.rating.breakdown.speed.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Reliability</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= currentUser.rating.breakdown.reliability
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {currentUser.rating.breakdown.reliability.toFixed(1)}
                            </span>
                          </div>
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
                            <p className="font-medium">Sold Tony Tony.Chopper</p>
                            <p className="text-sm text-gray-600">2 hours ago</p>
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            +$28.00
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Listed Roronoa Zoro</p>
                            <p className="text-sm text-gray-600">1 day ago</p>
                          </div>
                          <Badge variant="outline">Listed</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Updated Nami price</p>
                            <p className="text-sm text-gray-600">3 days ago</p>
                          </div>
                          <Badge variant="outline">Updated</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Received 5-star review</p>
                            <p className="text-sm text-gray-600">5 days ago</p>
                          </div>
                          <Badge variant="outline" className="text-yellow-600">
                            ⭐ Review
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ratings">
              <RatingDisplay />
            </TabsContent>
          </Tabs>

          <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={currentUser} />
        </main>
      </div>
    </ProtectedRoute>
  )
}
