"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import ProfileDiscovery from "@/components/profile/profile-discovery"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Calendar, Package, DollarSign, TrendingUp, MessageCircle } from "lucide-react"
import ChatSystem from "@/components/chat-system"
import RatingDisplay from "@/components/rating-display"

export default function ProfilePage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "overview"
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <ProfileDiscovery />
          {user && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="chats" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chats
                </TabsTrigger>
                <TabsTrigger value="ratings">Ratings</TabsTrigger>
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
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>Member since Jan 2024</span>
                          </div>
                        </div>
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
                              <p className="text-2xl font-bold">4.8</p>
                              <p className="text-sm text-gray-600">Seller Rating</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

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
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chats">
                <ChatSystem />
              </TabsContent>

              <TabsContent value="ratings">
                <RatingDisplay />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
