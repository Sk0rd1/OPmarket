"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ShoppingCart, User } from "lucide-react"
import Header from "@/components/header"
import { mockCards } from "@/lib/mock-data"
import { getRarityColor } from "@/lib/utils"
import { createChat } from "@/lib/chat-service"

export default function CardDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [listingsPage, setListingsPage] = useState(1)
  const listingsPerPage = 20

  const card = mockCards.find((c) => c.id === params.id)
  const totalListingsPages = Math.ceil((card?.listings.length || 0) / listingsPerPage)
  const startListingIndex = (listingsPage - 1) * listingsPerPage
  const displayedListings = card?.listings.slice(startListingIndex, startListingIndex + listingsPerPage) || []

  const handleBuyNow = async (listing: any) => {
    try {
      const chatId = await createChat({
        cardId: card!.id,
        cardName: card!.name,
        cardImage: card!.image_url,
        sellerId: listing.seller,
        buyerId: "current-user", // This would come from auth context
        price: listing.price,
        condition: listing.condition,
      })

      // Redirect to chat
      router.push(`/profile?tab=chats&chatId=${chatId}`)
    } catch (error) {
      console.error("Failed to create chat:", error)
      alert("Failed to start chat. Please try again.")
    }
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Card not found</h1>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:text-blue-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cards
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Image */}
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src={card.image_url || "/placeholder.svg?height=838&width=600"}
                alt={card.name}
                width={400}
                height={558}
                className="rounded-lg shadow-lg"
              />
              {card.alternate_art && <Badge className="absolute top-2 right-2 bg-yellow-500">Alt Art</Badge>}
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{card.name}</h1>
              <p className="text-lg text-gray-600">{card.id}</p>
            </div>

            {/* Card Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Card Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Rarity</p>
                    <Badge className={getRarityColor(card.rarity)}>{card.rarity}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">{card.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${getColorClass(card.color)}`} />
                      <span className="font-medium">{card.color}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Attribute</p>
                    <p className="font-medium">{card.attribute}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Power</p>
                    <p className="font-medium">{card.power.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Counter</p>
                    <p className="font-medium">{card.counter.toLocaleString()}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-600 mb-2">Card Type</p>
                  <p className="font-medium">{card.card_type}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Series</p>
                  <p className="font-medium">{card.series_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Effect</p>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm leading-relaxed">{card.effect}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Price */}
            <Card>
              <CardHeader>
                <CardTitle>Market Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 mb-2">${card.market_price.toFixed(2)}</div>
                <p className="text-sm text-gray-600">Current market average</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available Listings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Available Listings ({card.listings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedListings.map((listing, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{listing.seller}</p>
                          <p className="text-sm text-gray-600">Condition: {listing.condition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-900">${listing.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Qty: {listing.quantity}</p>
                      </div>
                    </div>
                  </div>
                  <Button className="ml-4 flex items-center gap-2" onClick={() => handleBuyNow(listing)}>
                    <ShoppingCart className="w-4 h-4" />
                    Buy Now
                  </Button>
                </div>
              ))}
            </div>

            {/* Listings Pagination */}
            {totalListingsPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setListingsPage(Math.max(1, listingsPage - 1))}
                  disabled={listingsPage === 1}
                  size="sm"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalListingsPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalListingsPages - 4, listingsPage - 2)) + i
                    return (
                      <Button
                        key={pageNum}
                        variant={listingsPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setListingsPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setListingsPage(Math.min(totalListingsPages, listingsPage + 1))}
                  disabled={listingsPage === totalListingsPages}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function getColorClass(color: string) {
  const colorMap: Record<string, string> = {
    Red: "bg-red-500",
    Blue: "bg-blue-500",
    Green: "bg-green-500",
    Yellow: "bg-yellow-500",
    Purple: "bg-purple-500",
    Black: "bg-gray-800",
    Multicolor: "bg-gradient-to-r from-red-500 via-blue-500 to-green-500",
  }
  return colorMap[color] || "bg-gray-400"
}
