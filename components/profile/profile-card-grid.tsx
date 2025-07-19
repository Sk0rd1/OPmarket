"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ProfileCardGridProps {
  userId: string
}

// Mock card data - in real app this would come from API
const mockCards = [
  {
    id: "1",
    name: "Monkey D. Luffy",
    rarity: "SR",
    price: 45.99,
    condition: "Near Mint",
    image: "/placeholder.svg?height=200&width=150&text=Luffy",
  },
  {
    id: "2",
    name: "Roronoa Zoro",
    rarity: "R",
    price: 28.5,
    condition: "Mint",
    image: "/placeholder.svg?height=200&width=150&text=Zoro",
  },
  {
    id: "3",
    name: "Nami",
    rarity: "UC",
    price: 12.99,
    condition: "Near Mint",
    image: "/placeholder.svg?height=200&width=150&text=Nami",
  },
  {
    id: "4",
    name: "Portgas D. Ace",
    rarity: "SR",
    price: 52.0,
    condition: "Mint",
    image: "/placeholder.svg?height=200&width=150&text=Ace",
  },
]

export default function ProfileCardGrid({ userId }: ProfileCardGridProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "SR":
        return "bg-yellow-500"
      case "R":
        return "bg-purple-500"
      case "UC":
        return "bg-blue-500"
      case "C":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cards for Sale ({mockCards.length})</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Sort by Price
          </Button>
          <Button variant="outline" size="sm">
            Filter by Rarity
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockCards.map((card) => (
          <Card key={card.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="relative mb-3">
                <Image
                  src={card.image || "/placeholder.svg"}
                  alt={card.name}
                  width={150}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Badge className={`absolute top-2 right-2 text-white ${getRarityColor(card.rarity)}`}>
                  {card.rarity}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{card.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">${card.price}</span>
                  <Badge variant="outline" className="text-xs">
                    {card.condition}
                  </Badge>
                </div>
                <Button className="w-full" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No cards listed for sale yet.</p>
        </div>
      )}
    </div>
  )
}
