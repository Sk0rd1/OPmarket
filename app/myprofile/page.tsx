"use client"

import { useState } from "react"
import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Calendar, Package, DollarSign, TrendingUp, Edit, Star, MessageSquare, Clock, Zap } from "lucide-react"
import RatingDisplay from "@/components/rating-display"
import EditProfileModal from "@/components/profile/edit-profile-modal"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"

export default function MyProfilePage() {
  const { user } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  if (!user) {
    return (
      <ProtectedRoute>
        <div></div>
      </ProtectedRoute>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your trading statistics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ratings">Ratings & Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile Information
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">{user.username}</h3>
                      <Badge variant="secondary" className="mt-1">
                        Verified Seller
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Member since Jan 2024</span>
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
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {user.aboutMe ||
                        "No description provided yet. Click Edit to add information about yourself and your trading preferences."}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Statistics and Activity */}
              <div className="lg:col-span-2 space-y-6">
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold">47</p>
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
                          <p className="text-2xl font-bold">$1,234</p>
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
                          <p className="text-2xl font-bold">89</p>
                          <p className="text-sm text-gray-600">Completed Trades</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Rating Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Rating Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold">Communication</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">4.0/5.0</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Zap className="w-5 h-5 text-green-600" />
                          <span className="font-semibold">Shipping Speed</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= 5 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">5.0/5.0</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold">Reliability</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">4.5/5.0</p>
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
                          <p className="font-medium">Received 5-star review</p>
                          <p className="text-sm text-gray-600">5 hours ago</p>
                        </div>
                        <Badge variant="outline" className="text-yellow-600">
                          ⭐ Review
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

        <EditProfileModal open={showEditModal} onOpenChange={setShowEditModal} user={user} />
      </main>
    </div>
  )
}
