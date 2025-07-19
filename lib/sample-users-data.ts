export interface SampleUser {
  id: string
  username: string
  avatar: string
  aboutMe: string
  joinDate: string
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
  lastActive: string
  cardsForSale: number
}

export const sampleUsers: SampleUser[] = [
  {
    id: "1",
    username: "PirateKing_Luffy",
    avatar: "/placeholder.svg?height=60&width=60&text=Luffy",
    aboutMe:
      "Dedicated One Piece fan and collector! 🏴‍☠️ Specializing in rare Straw Hat crew cards. Fast shipping, excellent communication. Contact me for bulk deals! Always looking for Gear 5 Luffy variants.",
    joinDate: "2023-03-15",
    rating: {
      average: 4.9,
      total: 127,
      breakdown: {
        communication: 4.8,
        speed: 5.0,
        reliability: 4.9,
      },
    },
    totalSales: 450,
    specialties: ["Straw Hat Crew", "Fast Shipping", "Bulk Deals"],
    lastActive: "2024-01-19",
    cardsForSale: 18,
  },
  {
    id: "2",
    username: "ZoroSwordsman",
    avatar: "/placeholder.svg?height=60&width=60&text=Zoro",
    aboutMe:
      "Serious trader, serious deals. ⚔️ Looking for Mihawk and swordsman cards. Always ship within 24 hours. No lowballers please. Quality over quantity - every card is mint condition.",
    joinDate: "2023-06-22",
    rating: {
      average: 4.7,
      total: 89,
      breakdown: {
        communication: 4.5,
        speed: 4.9,
        reliability: 4.7,
      },
    },
    totalSales: 280,
    specialties: ["Swordsman Cards", "24h Shipping", "Mint Condition"],
    lastActive: "2024-01-19",
    cardsForSale: 12,
  },
  {
    id: "3",
    username: "CardCollectorAce",
    avatar: "/placeholder.svg?height=60&width=60&text=Ace",
    aboutMe:
      "Fire Fist collector since day one! 🔥 Specializing in Whitebeard Pirates and rare promotional cards. Always open to trades! Been collecting for 15+ years, know the market inside out.",
    joinDate: "2023-01-10",
    rating: {
      average: 4.8,
      total: 156,
      breakdown: {
        communication: 4.9,
        speed: 4.7,
        reliability: 4.8,
      },
    },
    totalSales: 520,
    specialties: ["Whitebeard Pirates", "Promotional Cards", "Trading"],
    lastActive: "2024-01-18",
    cardsForSale: 25,
  },
  {
    id: "4",
    username: "NavigatorNami",
    avatar: "/placeholder.svg?height=60&width=60&text=Nami",
    aboutMe:
      "Smart trader with the best prices! 💰 Specializing in female character cards and weather-themed abilities. Quick responses, fair negotiations. Student discount available!",
    joinDate: "2023-04-08",
    rating: {
      average: 4.6,
      total: 73,
      breakdown: {
        communication: 4.8,
        speed: 4.4,
        reliability: 4.6,
      },
    },
    totalSales: 195,
    specialties: ["Female Characters", "Best Prices", "Student Discounts"],
    lastActive: "2024-01-19",
    cardsForSale: 14,
  },
  {
    id: "5",
    username: "SniperKingUsopp",
    avatar: "/placeholder.svg?height=60&width=60&text=Usopp",
    aboutMe:
      "Brave warrior of the sea! 🎯 Collecting rare and legendary cards. Honest seller with detailed card descriptions. Every card comes with a story! Specializing in underrated gems.",
    joinDate: "2023-07-14",
    rating: {
      average: 4.5,
      total: 42,
      breakdown: {
        communication: 4.7,
        speed: 4.2,
        reliability: 4.6,
      },
    },
    totalSales: 142,
    specialties: ["Rare Cards", "Detailed Descriptions", "Underrated Gems"],
    lastActive: "2024-01-17",
    cardsForSale: 9,
  },
  {
    id: "6",
    username: "BlackLegSanji",
    avatar: "/placeholder.svg?height=60&width=60&text=Sanji",
    aboutMe:
      "Cooking up the best deals! 👨‍🍳 Specializing in Sanji variants and cook-themed cards. Premium packaging - every card treated like a fine dish. International shipping available.",
    joinDate: "2023-05-20",
    rating: {
      average: 4.8,
      total: 91,
      breakdown: {
        communication: 4.9,
        speed: 4.8,
        reliability: 4.7,
      },
    },
    totalSales: 267,
    specialties: ["Sanji Cards", "Premium Packaging", "International Shipping"],
    lastActive: "2024-01-19",
    cardsForSale: 16,
  },
  {
    id: "7",
    username: "DevilChildRobin",
    avatar: "/placeholder.svg?height=60&width=60&text=Robin",
    aboutMe:
      "Archaeologist of rare cards! 📚 Specializing in historical and lore-heavy cards. Detailed research on every card's background. Perfect for collectors who love the story behind the cards.",
    joinDate: "2023-02-28",
    rating: {
      average: 4.9,
      total: 134,
      breakdown: {
        communication: 5.0,
        speed: 4.8,
        reliability: 4.9,
      },
    },
    totalSales: 389,
    specialties: ["Historical Cards", "Lore Research", "Story Background"],
    lastActive: "2024-01-18",
    cardsForSale: 22,
  },
  {
    id: "8",
    username: "CyborgFranky",
    avatar: "/placeholder.svg?height=60&width=60&text=Franky",
    aboutMe:
      "SUPER trader with SUPER deals! 🤖 Specializing in mechanical and cyborg-themed cards. Custom protective cases for valuable cards. Building the ultimate Franky collection!",
    joinDate: "2023-08-05",
    rating: {
      average: 4.6,
      total: 67,
      breakdown: {
        communication: 4.4,
        speed: 4.7,
        reliability: 4.7,
      },
    },
    totalSales: 178,
    specialties: ["Mechanical Cards", "Custom Cases", "Franky Collection"],
    lastActive: "2024-01-19",
    cardsForSale: 11,
  },
  {
    id: "9",
    username: "SoulKingBrook",
    avatar: "/placeholder.svg?height=60&width=60&text=Brook",
    aboutMe:
      "Yohohoho! Trading cards for 50 years! 🎼 Specializing in music-themed and skeleton cards. Every transaction comes with a joke! Vintage card expert with authentication services.",
    joinDate: "2023-09-12",
    rating: {
      average: 4.7,
      total: 85,
      breakdown: {
        communication: 4.9,
        speed: 4.5,
        reliability: 4.7,
      },
    },
    totalSales: 234,
    specialties: ["Music Cards", "Vintage Expert", "Authentication"],
    lastActive: "2024-01-18",
    cardsForSale: 19,
  },
  {
    id: "10",
    username: "FirstSonJinbe",
    avatar: "/placeholder.svg?height=60&width=60&text=Jinbe",
    aboutMe:
      "Honorable trader from Fish-Man Island! 🐟 Specializing in Fish-Man and underwater-themed cards. Fair prices, honest dealings. Bulk orders welcome with special discounts.",
    joinDate: "2023-10-03",
    rating: {
      average: 4.8,
      total: 103,
      breakdown: {
        communication: 4.8,
        speed: 4.8,
        reliability: 4.8,
      },
    },
    totalSales: 312,
    specialties: ["Fish-Man Cards", "Fair Prices", "Bulk Discounts"],
    lastActive: "2024-01-19",
    cardsForSale: 17,
  },
]

export function getSampleUserByUsername(username: string): SampleUser | null {
  return sampleUsers.find((user) => user.username.toLowerCase() === username.toLowerCase()) || null
}
