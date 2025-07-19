export interface SampleUser {
  id: string
  username: string
  joinDate: string
  avatar: string
  aboutMe: string
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

export const sampleUsers: SampleUser[] = [
  {
    id: "user-1",
    username: "PirateKing_Luffy",
    joinDate: "2023-03-15",
    avatar: "/placeholder.svg?height=200&width=200&text=PK",
    aboutMe:
      "Dedicated One Piece fan and collector! Specializing in rare Straw Hat crew cards. Fast shipping, excellent communication. Contact me for bulk deals! 📧 luffy.trader@email.com",
    rating: {
      average: 4.9,
      total: 127,
      breakdown: {
        communication: 4.9,
        speed: 4.8,
        reliability: 5.0,
      },
    },
    totalSales: 450,
    specialties: ["Straw Hat Crew", "Fast Shipping", "Bulk Deals"],
  },
  {
    id: "user-2",
    username: "ZoroSwordsman",
    joinDate: "2023-06-20",
    avatar: "/placeholder.svg?height=200&width=200&text=ZS",
    aboutMe:
      "Serious trader, serious deals. Looking for Mihawk and swordsman cards. Always ship within 24 hours. No lowballers please.",
    rating: {
      average: 4.7,
      total: 89,
      breakdown: {
        communication: 4.6,
        speed: 4.9,
        reliability: 4.6,
      },
    },
    totalSales: 280,
    specialties: ["Swordsman Cards", "24hr Shipping", "Serious Trader"],
  },
  {
    id: "user-3",
    username: "CardCollectorAce",
    joinDate: "2023-01-10",
    avatar: "/placeholder.svg?height=200&width=200&text=CA",
    aboutMe:
      "Fire Fist collector since day one! 🔥 Specializing in Whitebeard Pirates and rare promotional cards. Always open to trades!",
    rating: {
      average: 4.8,
      total: 156,
      breakdown: {
        communication: 4.8,
        speed: 4.7,
        reliability: 4.9,
      },
    },
    totalSales: 520,
    specialties: ["Whitebeard Pirates", "Promotional Cards", "Trading"],
  },
  {
    id: "user-4",
    username: "NaviTrader",
    joinDate: "2023-04-05",
    avatar: "/placeholder.svg?height=200&width=200&text=NT",
    aboutMe:
      "Navigator of great deals! 🧭 Specializing in rare Navigator and weather-themed cards. Excellent packaging and fast worldwide shipping.",
    rating: {
      average: 4.6,
      total: 73,
      breakdown: {
        communication: 4.7,
        speed: 4.5,
        reliability: 4.6,
      },
    },
    totalSales: 195,
    specialties: ["Navigator Cards", "Worldwide Shipping", "Rare Cards"],
  },
  {
    id: "user-5",
    username: "ChopperMedic",
    joinDate: "2023-08-12",
    avatar: "/placeholder.svg?height=200&width=200&text=CM",
    aboutMe:
      "Doctor's orders: only the finest cards! 🩺 New to trading but passionate about the game. Specializing in Chopper and medical-themed cards.",
    rating: {
      average: 4.4,
      total: 34,
      breakdown: {
        communication: 4.5,
        speed: 4.3,
        reliability: 4.4,
      },
    },
    totalSales: 67,
    specialties: ["Chopper Cards", "New Trader", "Medical Theme"],
  },
  {
    id: "user-6",
    username: "SanjiCook",
    joinDate: "2023-05-18",
    avatar: "/placeholder.svg?height=200&width=200&text=SC",
    aboutMe:
      "Cooking up the best deals in the East Blue! 👨‍🍳 Specializing in Sanji cards and food-themed artwork. Always hungry for new trades!",
    rating: {
      average: 4.7,
      total: 98,
      breakdown: {
        communication: 4.8,
        speed: 4.6,
        reliability: 4.7,
      },
    },
    totalSales: 312,
    specialties: ["Sanji Cards", "Food Theme", "East Blue"],
  },
  {
    id: "user-7",
    username: "RobinScholar",
    joinDate: "2023-02-28",
    avatar: "/placeholder.svg?height=200&width=200&text=RS",
    aboutMe:
      "Archaeologist of rare cards! 📚 Specializing in historical and rare promotional cards. Detailed condition reports and scholarly approach to trading.",
    rating: {
      average: 4.9,
      total: 142,
      breakdown: {
        communication: 5.0,
        speed: 4.8,
        reliability: 4.9,
      },
    },
    totalSales: 387,
    specialties: ["Historical Cards", "Condition Reports", "Scholarly Trading"],
  },
  {
    id: "user-8",
    username: "FrankySuper",
    joinDate: "2023-07-03",
    avatar: "/placeholder.svg?height=200&width=200&text=FS",
    aboutMe:
      "SUPER deals for SUPER cards! 🤖 Cyborg collector specializing in Franky and technology-themed cards. Custom packaging guaranteed!",
    rating: {
      average: 4.5,
      total: 61,
      breakdown: {
        communication: 4.4,
        speed: 4.6,
        reliability: 4.5,
      },
    },
    totalSales: 142,
    specialties: ["Franky Cards", "Technology Theme", "Custom Packaging"],
  },
  {
    id: "user-9",
    username: "BrookSoulKing",
    joinDate: "2023-09-14",
    avatar: "/placeholder.svg?height=200&width=200&text=BS",
    aboutMe:
      "Yohohoho! Soul King of card trading! 🎵 Specializing in Brook and music-themed cards. May I see your rare cards? Skull joke!",
    rating: {
      average: 4.6,
      total: 45,
      breakdown: {
        communication: 4.7,
        speed: 4.5,
        reliability: 4.6,
      },
    },
    totalSales: 89,
    specialties: ["Brook Cards", "Music Theme", "Skull Jokes"],
  },
  {
    id: "user-10",
    username: "JimbeiKnight",
    joinDate: "2023-03-22",
    avatar: "/placeholder.svg?height=200&width=200&text=JK",
    aboutMe:
      "Knight of the Sea! 🌊 Honorable trader specializing in Fishman and sea-themed cards. Fair deals and honest communication always.",
    rating: {
      average: 4.8,
      total: 103,
      breakdown: {
        communication: 4.9,
        speed: 4.7,
        reliability: 4.8,
      },
    },
    totalSales: 267,
    specialties: ["Fishman Cards", "Sea Theme", "Honorable Trading"],
  },
]

export function getSampleUserByUsername(username: string): SampleUser | null {
  return sampleUsers.find((user) => user.username.toLowerCase() === username.toLowerCase()) || null
}
