"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface CardListing {
  id: string
  name: string
  image: string
  price: number
  condition: string
  rarity: string
  listings: Array<{
    id: string
    price: number
    condition: string
    seller: string
    location: string
  }>
}

interface ProfileCardGridProps {
  userListings: CardListing[]
}

export default function ProfileCardGrid({ userListings }: ProfileCardGridProps) {
  if (userListings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No cards currently for sale</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {userListings.map((card) => {
        // Get the first listing for this card
        const listing = card.listings[0]

        return (
          <Card key={card.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Card Image */}
                <div className="aspect-[3/4] relative bg-gray-100 rounded-lg overflow-hidden">
                  <Image src={card.image || "/placeholder.svg"} alt={card.name} fill className="object-cover" />
                </div>

                {/* Card Info */}
                <div>
                  <h3 className="font-semibold text-sm line-clamp-2">{card.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {card.rarity}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {listing.condition}
                    </Badge>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-blue-900">${listing.price.toFixed(2)}</div>
                  <div className="flex gap-2">
                    <Link href={`/card/${card.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Location */}
                <p className="text-xs text-gray-500">{listing.location}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
