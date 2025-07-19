"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, User } from "lucide-react"

interface ProfileSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onUserSelect: (username: string) => void
  currentUser: any
}

// Mock user database for search (in real app, this would be an API call)
const mockUserDatabase = [
  { username: "CardMaster123", avatar: "/placeholder.svg?height=40&width=40" },
  { username: "OnePieceFan", avatar: "/placeholder.svg?height=40&width=40" },
  { username: "LuffyCollector", avatar: "/placeholder.svg?height=40&width=40" },
  { username: "ZoroSwordsman", avatar: "/placeholder.svg?height=40&width=40" },
  { username: "NamiNavigator", avatar: "/placeholder.svg?height=40&width=40" },
  { username: "SanjiCook", avatar: "/placeholder.svg?height=40&width=40" },
  { username: "ChopperDoctor", avatar: "/placeholder.svg?height=40&width=40" },
  { username: "RobinArchaeologist", avatar: "/placeholder.svg?height=40&width=40" },
  { username: "FrankyCyborg", avatar: "/placeholder.svg?height=40&width=40" },
  { username: "BrookMusician", avatar: "/placeholder.svg?height=40&width=40" },
]

export default function ProfileSearch({ searchQuery, onSearchChange, onUserSelect, currentUser }: ProfileSearchProps) {
  const [searchResults, setSearchResults] = useState<typeof mockUserDatabase>([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Handle search with debouncing
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)

      // Simulate API delay
      setTimeout(() => {
        const filtered = mockUserDatabase.filter((user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setSearchResults(filtered)
        setShowResults(true)
        setIsSearching(false)
      }, 300)
    }

    const timeoutId = setTimeout(searchUsers, 200)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleUserClick = (username: string) => {
    onUserSelect(username)
    setShowResults(false)
  }

  const handleMyProfileClick = () => {
    onUserSelect(currentUser.username)
    setShowResults(false)
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search user profiles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-900"></div>
            </div>
          )}
        </div>
        <Button onClick={handleMyProfileClick} variant="outline" className="flex items-center gap-2 bg-transparent">
          <User className="w-4 h-4" />
          My Profile
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="py-1">
              {searchResults.map((user) => (
                <button
                  key={user.username}
                  onClick={() => handleUserClick(user.username)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <span className="font-medium">{user.username}</span>
                </button>
              ))}
            </div>
          ) : searchQuery.length >= 2 && !isSearching ? (
            <div className="px-4 py-3 text-gray-500 text-center">No users found matching "{searchQuery}"</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
