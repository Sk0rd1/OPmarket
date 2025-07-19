"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { getRarityColor } from "@/lib/utils"
import type { Card as CardType } from "@/lib/types"

interface CardGridProps {
  cards: CardType[]
}

export default function CardGrid({ cards }: CardGridProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const cardsPerPage = 30

  const totalPages = Math.ceil(cards.length / cardsPerPage)
  const startIndex = (currentPage - 1) * cardsPerPage
  const displayedCards = cards.slice(startIndex, startIndex + cardsPerPage)

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Eye className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found</h3>
        <p className="text-gray-600">Try adjusting your filters to see more results.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cards ({cards.length.toLocaleString()})</h2>
        <p className="text-gray-600">
          Showing {startIndex + 1}-{Math.min(startIndex + cardsPerPage, cards.length)} of {cards.length}
        </p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {displayedCards.map((card) => (
          <Card
            key={card.id}
            className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Link href={`/card/${card.id}`}>
              <CardContent className="p-3">
                <div className="relative mb-3">
                  <Image
                    src={card.image_url || "/placeholder.svg?height=279&width=200"}
                    alt={card.name}
                    width={200}
                    height={279}
                    className="w-full h-auto rounded-md transition-transform duration-200 group-hover:scale-105"
                  />

                  {/* Rarity Badge */}
                  <Badge className={`absolute top-2 right-2 ${getRarityColor(card.rarity)}`}>{card.rarity}</Badge>

                  {/* Hover Overlay */}
                  {hoveredCard === card.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center transition-opacity duration-200">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="opacity-90">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-blue-900 transition-colors">
                    {card.name}
                  </h3>

                  <p className="text-xs text-gray-500">{card.id}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-blue-900">${card.market_price.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">
                        ({card.listings.reduce((sum, listing) => sum + listing.quantity, 0)} available)
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getColorClass(card.color)}`} />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
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
