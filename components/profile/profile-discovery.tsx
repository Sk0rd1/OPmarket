"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, TrendingUp, Clock, Shuffle } from "lucide-react"
import { sampleUsers } from "@/lib/sample-users-data"

export default function ProfileDiscovery() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [showSearchResults, setShowSearchResults] = useState(false)

  const filteredUsers = useMemo(() => {
    const filtered = sampleUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.aboutMe.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.specialties.some((specialty) => specialty.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    // Sort users
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating.average - a.rating.average)
        break
      case "sales":
        filtered.sort((a, b) => b.totalSales - a.totalSales)
        break
      case "recent":
        filtered.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
        break
      default:
        break
    }

    return filtered
  }, [searchQuery, sortBy])

  const featuredUsers = useMemo(() => {
    return sampleUsers.sort((a, b) => b.rating.average - a.rating.average).slice(0, 10)
  }, [])

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username.toLowerCase()}`)
  }

  const handleRandomProfile = () => {
    const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)]
    router.push(`/profile/${randomUser.username.toLowerCase()}`)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setShowSearchResults(value.length > 0)
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Discover Traders</CardTitle>
          <p className="text-gray-600">Find and connect with One Piece TCG traders from around the world</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search user profiles, specialties, or trading preferences..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="sales">Most Sales</SelectItem>
                <SelectItem value="recent">Recently Active</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRandomProfile}>
              <Shuffle className="w-4 h-4 mr-2" />
              Random Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {showSearchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.username}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">{user.username}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{user.rating.average}</span>
                            <span className="text-sm text-gray-500">({user.rating.total})</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.aboutMe}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {user.specialties.slice(0, 2).map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{user.totalSales}+ sales</span>
                        <Button size="sm" onClick={() => handleUserClick(user.username)}>
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Featured Sellers */}
      {!showSearchResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Featured Sellers
                </CardTitle>
                <p className="text-gray-600">Top-rated traders in the community</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                Updated hourly
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredUsers.map((user) => (
                <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">{user.username}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{user.rating.average}</span>
                          <span className="text-sm text-gray-500">({user.rating.total})</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.aboutMe}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {user.specialties.slice(0, 2).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{user.totalSales}+ sales</span>
                      <Button size="sm" onClick={() => handleUserClick(user.username)}>
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Feed */}
      {!showSearchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Community Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src="/placeholder.svg?height=32&width=32&text=Z"
                    alt="ZoroSwordsman"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm">
                      <strong>ZoroSwordsman</strong> just listed a new SR Mihawk card
                    </p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <Badge variant="outline">New Listing</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src="/placeholder.svg?height=32&width=32&text=L"
                    alt="PirateKing_Luffy"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm">
                      <strong>PirateKing_Luffy</strong> completed a trade worth $85
                    </p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600">
                  Sale
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src="/placeholder.svg?height=32&width=32&text=A"
                    alt="CardCollectorAce"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm">
                      <strong>CardCollectorAce</strong> received a 5-star review
                    </p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-600">
                  ⭐ Review
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
