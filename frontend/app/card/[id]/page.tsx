"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ShoppingCart, User } from "lucide-react"
import Header from "@/components/header"
import { getRarityColor } from "@/lib/utils"
import { createChat } from "@/lib/chat-service"

// 🆕 Типи для API відповіді
interface ApiCard {
  ProductId: string
  BaseCardId: string  
  ShortCode: string
  Name: string
  CardTypeDetail: string
  Effect: string
  Power: number
  Counter: number
  Attribute: string
  Rarity: string
  SetCode: string
  ImageUrl: string
  Language: string
  IsAlternateArt: boolean
  SeriesName: string
  Colors: Array<{
    Code: string
    Name: string
    HexColor: string
    IsPrimary: boolean
  }>
  Listings: Array<{
    Id: string
    ConditionCode: string
    ConditionName: string
    Price: number
    Quantity: number
    Description: string
    SellerUsername: string
    SellerRating: number
    IsVerifiedSeller: boolean
    CreatedAt: string
  }>
  MinPrice: number
  ListingCount: number
}

export default function CardDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [listingsPage, setListingsPage] = useState(1)
  const [card, setCard] = useState<ApiCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const listingsPerPage = 20

  // 🆕 Завантаження картки з API
  useEffect(() => {
    const fetchCard = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://192.168.31.78:5000/api/cards/buy/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Card not found")
          } else {
            setError("Failed to load card")
          }
          return
        }
        
        const cardData = await response.json()
        setCard(cardData)
      } catch (err) {
        console.error("Error fetching card:", err)
        setError("Failed to load card")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCard()
    }
  }, [params.id])

  const totalListingsPages = Math.ceil((card?.Listings.length || 0) / listingsPerPage)
  const startListingIndex = (listingsPage - 1) * listingsPerPage
  const displayedListings = card?.Listings.slice(startListingIndex, startListingIndex + listingsPerPage) || []

  const handleBuyNow = async (listing: any) => {
    try {
      const chatId = await createChat({
        cardId: card!.ProductId,
        cardName: card!.Name,
        cardImage: card!.ImageUrl,
        sellerId: listing.SellerUsername,
        buyerId: "current-user", // This would come from auth context
        price: listing.Price,
        condition: listing.ConditionName,
      })

      // Redirect to chat
      router.push(`/profile?tab=chats&chatId=${chatId}`)
    } catch (error) {
      console.error("Failed to create chat:", error)
      alert("Failed to start chat. Please try again.")
    }
  }

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading card details...</p>
        </div>
      </div>
    )
  }

  // ⚠️ Error state
  if (error || !card) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Card not found"}
          </h1>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Отримуємо основний колір
  const primaryColor = card.Colors.find(color => color.IsPrimary)?.Code || card.Colors[0]?.Code || "Gray"

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
                src={card.ImageUrl || "/placeholder.svg?height=838&width=600"}
                alt={card.Name}
                width={400}
                height={558}
                className="rounded-lg shadow-lg"
              />
              {card.IsAlternateArt && (
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Alt Art
                </Badge>
              )}
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{card.Name}</h1>
              <p className="text-lg text-gray-600">{card.BaseCardId}</p>
              {card.ShortCode !== card.BaseCardId && (
                <p className="text-sm text-gray-500">Code: {card.ShortCode}</p>
              )}
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
                    <Badge className={getRarityColor(card.Rarity)}>{card.Rarity}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">{card.CardTypeDetail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${getColorClass(primaryColor)}`} />
                      <span className="font-medium">{primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Attribute</p>
                    <p className="font-medium">{card.Attribute}</p>
                  </div>
                  {card.Power && (
                    <div>
                      <p className="text-sm text-gray-600">Power</p>
                      <p className="font-medium">{card.Power.toLocaleString()}</p>
                    </div>
                  )}
                  {card.Counter && (
                    <div>
                      <p className="text-sm text-gray-600">Counter</p>
                      <p className="font-medium">{card.Counter.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-600 mb-2">Series</p>
                  <p className="font-medium">{card.SeriesName}</p>
                </div>

                {card.Effect && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Effect</p>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm leading-relaxed">{card.Effect}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Market Price */}
            <Card>
              <CardHeader>
                <CardTitle>Market Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 mb-2">
                  ₴{card.MinPrice.toFixed(2)} {/* 🔧 Замінено $ на ₴ */}
                </div>
                <p className="text-sm text-gray-600">Lowest available price</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available Listings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Available Listings ({card.Listings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedListings.map((listing) => (
                <div key={listing.Id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{listing.SellerUsername}</p>
                            {listing.IsVerifiedSeller && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Condition: {listing.ConditionName} • Rating: {listing.SellerRating.toFixed(1)}⭐
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-900">
                          ₴{listing.Price.toFixed(2)} {/* 🔧 Замінено $ на ₴ */}
                        </p>
                        <p className="text-sm text-gray-600">Qty: {listing.Quantity}</p>
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
    White: "bg-gray-100",
    Multicolor: "bg-gradient-to-r from-red-500 via-blue-500 to-green-500",
  }
  return colorMap[color] || "bg-gray-400"
}
