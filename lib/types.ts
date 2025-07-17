export interface Card {
  id: string
  name: string
  rarity: string
  type: string
  attribute: string
  power: number
  counter: number
  color: string
  card_type: string
  effect: string
  image_url: string
  alternate_art: boolean
  series_id: string
  series_name: string
  market_price: number
  listings: Listing[]
}

export interface PriceEntry {
  quantity: number
  price: number
}

export interface UserCard {
  id: string
  name: string
  rarity: string
  type: string
  attribute: string
  power: number
  counter: number
  color: string
  card_type: string
  effect: string
  image_url: string
  alternate_art: boolean
  series_id: string
  series_name: string
  market_price: number
  sellingPrice: number
  quantity: number
  priceEntries?: PriceEntry[]
  priceIndex?: number
}

export interface Listing {
  seller: string
  condition: string
  price: number
  quantity: number
}

export interface FilterState {
  search: string
  sellerSearch: string
  rarity: string[]
  color: string[]
  type: string
  series: string
  priceRange: [number, number]
  powerRange: [number, number]
  attribute: string
  sortBy: string
}

export interface ChatMessage {
  id: string
  senderId: string
  content: string
  timestamp: Date
  isRead: boolean
}

export interface Chat {
  id: string
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  cardId: string
  cardName: string
  cardImage: string
  price: number
  condition: string
  status: string
  createdAt: Date
  updatedAt: Date
  messages: ChatMessage[]
  lastMessage: string
  lastMessageTime: Date
}

export interface Rating {
  id: string
  chatId: string
  ratedUserId: string
  raterUserId: string
  raterName: string
  cardName: string
  overallRating: number
  communication: number
  speed: number
  reliability: number
  comment: string
  createdAt: Date
}

export interface RatingSummary {
  averageRating: number
  totalRatings: number
  totalTransactions: number
  breakdown: {
    communication: number
    speed: number
    reliability: number
  }
}
