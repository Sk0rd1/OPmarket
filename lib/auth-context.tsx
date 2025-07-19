"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  joinDate: Date
  avatar?: string
  aboutMe?: string
  rating: {
    average: number
    total: number
    breakdown: {
      communication: number
      speed: number
      reliability: number
    }
  }
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  checkUsernameAvailability: (username: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user database
const mockUsers: Record<string, { password: string; user: User }> = {
  cardmaster123: {
    password: "password123",
    user: {
      id: "user-1",
      username: "CardMaster123",
      joinDate: new Date("2024-01-15"),
      avatar: "/placeholder.svg?height=200&width=200",
      aboutMe: "Passionate One Piece TCG collector and trader. Looking for rare cards and fair deals!",
      rating: {
        average: 4.8,
        total: 47,
        breakdown: {
          communication: 4.9,
          speed: 4.7,
          reliability: 4.8,
        },
      },
    },
  },
  onepiecefan: {
    password: "luffy123",
    user: {
      id: "user-2",
      username: "OnePieceFan",
      joinDate: new Date("2024-02-20"),
      avatar: "/placeholder.svg?height=200&width=200",
      aboutMe: "New to trading but love the game! Always happy to help new players.",
      rating: {
        average: 4.5,
        total: 23,
        breakdown: {
          communication: 4.6,
          speed: 4.4,
          reliability: 4.5,
        },
      },
    },
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem("tcg-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    const userKey = username.toLowerCase()
    const userData = mockUsers[userKey]

    if (userData && userData.password === password) {
      setUser(userData.user)
      localStorage.setItem("tcg-user", JSON.stringify(userData.user))
      return true
    }
    return false
  }

  const register = async (username: string, password: string): Promise<boolean> => {
    const userKey = username.toLowerCase()

    if (mockUsers[userKey]) {
      return false // User already exists
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      joinDate: new Date(),
      avatar: "/placeholder.svg?height=200&width=200",
      aboutMe: "",
      rating: {
        average: 0,
        total: 0,
        breakdown: {
          communication: 0,
          speed: 0,
          reliability: 0,
        },
      },
    }

    mockUsers[userKey] = { password, user: newUser }
    setUser(newUser)
    localStorage.setItem("tcg-user", JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("tcg-user")
  }

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("tcg-user", JSON.stringify(updatedUser))

      // Update in mock database
      const userKey = user.username.toLowerCase()
      if (mockUsers[userKey]) {
        mockUsers[userKey].user = updatedUser
      }
    }
  }

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const userKey = username.toLowerCase()
    return !mockUsers[userKey]
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        checkUsernameAvailability,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper function to get user by username
export function getUserByUsername(username: string): User | null {
  const userKey = username.toLowerCase()
  return mockUsers[userKey]?.user || null
}
