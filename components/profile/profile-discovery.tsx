"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Star, UserIcon, Shuffle, TrendingUp, Clock, Award } from "lucide-react"
import { sampleUsers, searchSampleUsers, type SampleUser } from "@/lib/sample-users-data"

export default function ProfileDiscovery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SampleUser[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [sortBy, setSortBy] = useState("highest-rated")
  const [featuredUsers, setFeaturedUsers] = useState<SampleUser[]>([])

  useEffect(() => {
    // Sort and set featured users based on sort option
    const sorted = [...sampleUsers]
    switch (sortBy) {
      case "highest-rated":
        sorted.sort((a, b) => b.rating.average - a.rating.average)
        break
      case "most-sales":
        sorted.sort((a, b) => b.totalSales - a.totalSales)
        break
      case "recently-active":
        sorted.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
        break
    }
    setFeaturedUsers(sorted)
  }, [sortBy])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchSampleUsers(searchQuery)
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
      setSearchResults([])
    }
  }, [searchQuery])

  const handleRandomProfile = () => {
    const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)]
    window.location.href = `/profile/${randomUser.username}`
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

  const recentActivity = [
    { user: "PirateKing_Luffy", action: "listed a new SR Monkey D. Luffy card", time: "2 hours ago" },
    { user: "ZoroSwordsman", action: "completed a trade for Roronoa Zoro", time: "4 hours ago" },
    { user: "CardCollectorAce", action: "received a 5-star review", time: "6 hours ago" },
    { user: "NavigatorNami", action: "updated their profile", time: "8 hours ago" },
    { user: "CookSanji", action: "listed 3 new cards", time: "12 hours ago" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Traders</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find trusted sellers, explore collections, and connect with the One Piece TCG community
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search user profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-12"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-80 overflow-y-auto">
                {searchResults.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      <Image
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{user.username}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <StarDisplay rating={Math.round(user.rating.average)} />
                        <span>{user.rating.average.toFixed(1)}</span>
                        <span>•</span>
                        <span>{user.totalSales}+ sales</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 p-4 text-center text-gray-500">
                No users found matching "{searchQuery}"
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button onClick={handleRandomProfile} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Shuffle className="w-4 h-4" />
              Random Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Featured Sellers Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Featured Sellers
          </h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highest-rated">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Highest Rated
                </div>
              </SelectItem>
              <SelectItem value="most-sales">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Most Sales
                </div>
              </SelectItem>
              <SelectItem value="recently-active">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recently Active
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden mx-auto">
                    <Image
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.username}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>

                  {/* User Info */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{user.username}</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <StarDisplay rating={Math.round(user.rating.average)} />
                      <span className="text-sm font-medium">{user.rating.average.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({user.rating.total})</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold text-blue-900">{user.totalSales}+</span> total sales
                    </p>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 justify-center">
                    {user.specialties.slice(0, 2).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  {/* View Profile Button */}
                  <Link href={`/profile/${user.username}`}>
                    <Button className="w-full">View Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <Link href={`/profile/${activity.user}`} className="font-medium text-blue-900 hover:underline">
                      {activity.user}
                    </Link>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
