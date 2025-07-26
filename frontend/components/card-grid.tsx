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

// Skeleton Loader компонент
const CardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-3">
      <div className="relative mb-3">
        <div className="w-full h-[279px] bg-gray-200 rounded-md"></div>
        <div className="absolute top-2 right-2 w-8 h-5 bg-gray-300 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </CardContent>
  </Card>
)

// Компонент окремої картки
const CardItem = ({ card, index, hoveredCard, setHoveredCard }: {
  card: CardType,
  index: number,
  hoveredCard: string | null,
  setHoveredCard: (id: string | null) => void
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Priority loading для перших 10 карт
  const priority = index < 10

  // 🔧 ФІКС: Створюємо унікальний ідентифікатор з індексом
  const uniqueId = `card-${index}-${card.ProductId || card.id || card.BaseCardId || card.name}`;

  // 🔍 ДІАГНОСТИКА (видаліть після тестування)
  const handleMouseEnter = () => {
    console.log("Hover на:", uniqueId, "| Картка:", card.Name || card.name);
    setHoveredCard(uniqueId);
  };

  const handleMouseLeave = () => {
    console.log("Залишаємо:", uniqueId);
    setHoveredCard(null);
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/card/${card.ShortCode || card.BaseCardId || card.id}`}>
        <CardContent className="p-3">
          <div className="relative mb-3">
            {/* Skeleton під час завантаження */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 rounded-md animate-pulse flex items-center justify-center">
                <div className="text-gray-400 text-xs">Loading...</div>
              </div>
            )}

            {/* Основне зображення */}
            <Image
              src={card.ImageUrl || card.image_url || "/placeholder.svg?height=279&width=200"}
              alt={card.Name || card.name}
              width={200}
              height={279}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              className={`w-full h-auto rounded-md transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true)
                setImageLoaded(true)
              }}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI3OSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIHN0b3AtY29sb3I9IiNmM2Y0ZjYiIG9mZnNldD0iMCUiPjwvc3RvcD48c3RvcCBzdG9wLWNvbG9yPSIjZTVlN2ViIiBvZmZzZXQ9IjEwMCUiPjwvc3RvcD48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI3OSIgZmlsbD0idXJsKCNnKSI+PC9yZWN0Pjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+"
            />

            {/* Fallback для помилок завантаження */}
            {imageError && (
              <div className="w-full h-[279px] bg-gray-100 rounded-md flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-sm">Image</div>
                  <div className="text-sm">Not Available</div>
                </div>
              </div>
            )}

            {/* Rarity Badge */}
            <Badge className={`absolute top-2 right-2 ${getRarityColor(card.Rarity || card.rarity)}`}>
              {card.Rarity || card.rarity}
            </Badge>

            {/* Hover Overlay - 🔧 Використовуємо унікальний ID */}
            {hoveredCard === uniqueId && imageLoaded && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center transition-opacity duration-200">
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="opacity-90">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                {/* 🔍 ДІАГНОСТИКА - покаж ID (видаліть після тестування) */}
                <div className="absolute bottom-1 left-1 text-white text-xs bg-black bg-opacity-75 p-1 rounded max-w-[100px] truncate">
                  {uniqueId}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-blue-900 transition-colors">
              {card.Name || card.name}
            </h3>

            <p className="text-xs text-gray-500">{card.BaseCardId || card.id}</p>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-blue-900">
                  {/* 🔧 Замінено $ на ₴ */}
                  ₴{(card.MinPrice || card.market_price || 0).toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">
                  {/* Підтримка обох форматів API */}
                  ({
                    card.Listings 
                      ? card.Listings.reduce((sum: number, listing: any) => sum + listing.Quantity, 0)
                      : card.listings?.reduce((sum: number, listing: any) => sum + listing.quantity, 0) || 0
                  } available)
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${getColorClass(card.Colors?.[0]?.Code || card.color || 'Gray')}`} />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

export default function CardGrid({ cards }: CardGridProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // 🔍 ДІАГНОСТИКА (видаліть після тестування)
  console.log("CardGrid keys:", cards.map((card, index) => 
    `card-${index}-${card.ProductId || card.id || card.BaseCardId || card.name}`
  ));

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
      {/* Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cards.map((card, index) => {
          // 🔧 ГАРАНТОВАНО унікальний ключ з індексом
          const uniqueKey = `card-${index}-${card.ProductId || card.id || card.BaseCardId || card.name}`;
          
          return (
            <CardItem
              key={uniqueKey}
              card={card}
              index={index}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
            />
          )
        })}
      </div>
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
