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
            <Button onClick={() => setShowEditModal(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ratings">Ratings & Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info */}
                <div className="lg:col-span-1 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold">{user?.username}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {user?.is_verified_seller ? "Verified Seller" : "Member"}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                        </div>
                        {user?.is_verified_seller && (
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span>Seller since {user?.seller_since ? new Date(user.seller_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Seller Statistics */}
                  {user?.is_verified_seller && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Seller Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Seller Rating</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{user?.seller_rating?.toFixed(1) || '0.0'}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Sales</span>
                            <span className="font-medium">{user?.total_sales || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Statistics and Activity */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Statistics Cards */}
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
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold">Communication</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">4.0</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-green-600" />
                            <span className="font-semibold">Shipping Speed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= 5 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">5.0</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold">Reliability</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">4.5</span>
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
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="space-y-1">
                              <p className="font-medium">
                                {i === 1 && "Sold Tony Tony.Chopper"}
                                {i === 2 && "Received 5-star review"}
                                {i === 3 && "Listed Roronoa Zoro"}
                                {i === 4 && "Updated Nami price"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {i === 1 && "2 hours ago"}
                                {i === 2 && "5 hours ago"}
                                {i === 3 && "1 day ago"}
                                {i === 4 && "3 days ago"}
                              </p>
                            </div>
                            <Badge variant="outline" className={
                              i === 1 ? "text-green-600" :
                              i === 2 ? "text-yellow-600" : ""
                            }>
                              {i === 1 && "+$28.00"}
                              {i === 2 && "⭐ Review"}
                              {i === 3 && "Listed"}
                              {i === 4 && "Updated"}
                            </Badge>
                          </div>
                        ))}
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

          {/* Edit Profile Modal */}
          {user && (
            <EditProfileModal 
              open={showEditModal} 
              onOpenChange={setShowEditModal} 
              user={user} 
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
