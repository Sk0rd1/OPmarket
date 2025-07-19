"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, TrendingUp, Clock, Shuffle } from "lucide-react"
import { sampleUsers } from "@/lib/sample-users-data"
import Link from "next/link"

export default function ProfileDiscovery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [filteredUsers, setFilteredUsers] = useState(sampleUsers)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredUsers(sampleUsers)
    } else {
      const filtered = sampleUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.specialties?.some((specialty) => specialty.toLowerCase().includes(query.toLowerCase())) ||
          user.aboutMe?.toLowerCase().includes(query.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }

  const handleSort = (value: string) => {
    setSortBy(value)
    const sorted = [...filteredUsers]

    switch (value) {
      case "rating":
        sorted.sort((a, b) => b.rating.average - a.rating.average)
        break
      case "sales":
        sorted.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
        break
      case "recent":
        sorted.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
        break
      default:
        break
    }

    setFilteredUsers(sorted)
  }

  const handleRandomProfile = () => {
    const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)]
    window.location.href = `/profile/${randomUser.username.toLowerCase()}`
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Traders</h1>
        <p className="text-gray-600">Find and connect with One Piece TCG collectors and sellers</p>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search user profiles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Highest Rated
                  </div>
                </SelectItem>
                <SelectItem value="sales">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Most Sales
                  </div>
                </SelectItem>
                <SelectItem value="recent">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recently Active
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Random Profile Button */}
            <Button onClick={handleRandomProfile} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Shuffle className="w-4 h-4" />
              Random Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredUsers.length} {filteredUsers.length === 1 ? "trader" : "traders"} found
        </p>
      </div>

      {/* Featured Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {/* Avatar */}
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{user.username}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <StarDisplay rating={Math.round(user.rating.average)} />
                    <span className="text-sm text-gray-600">
                      {user.rating.average.toFixed(1)} ({user.rating.total})
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-4 text-sm text-gray-600">
                  <div className="text-center">
                    <div className="font-semibold text-blue-900">{user.totalSales}+</div>
                    <div>Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{user.rating.total}</div>
                    <div>Reviews</div>
                  </div>
                </div>

                {/* Specialties */}
                {user.specialties && user.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {user.specialties.slice(0, 2).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* View Profile Button */}
                <Link href={`/profile/${user.username.toLowerCase()}`}>
                  <Button className="w-full">View Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No traders found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32&text=PK" />
                <AvatarFallback>PK</AvatarFallback>
              </Avatar>
              <span>
                <strong>PirateKing_Luffy</strong> just listed a new SR Monkey D. Luffy card
              </span>
              <span className="text-gray-500 ml-auto">2 min ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32&text=ZS" />
                <AvatarFallback>ZS</AvatarFallback>
              </Avatar>
              <span>
                <strong>ZoroSwordsman</strong> completed a trade with CardCollectorAce
              </span>
              <span className="text-gray-500 ml-auto">15 min ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32&text=NT" />
                <AvatarFallback>NT</AvatarFallback>
              </Avatar>
              <span>
                <strong>NaviTrader</strong> received a 5-star review from StrawHatFan
              </span>
              <span className="text-gray-500 ml-auto">1 hour ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
