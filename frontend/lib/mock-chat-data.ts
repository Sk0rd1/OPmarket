import type { Chat, ChatMessage } from "./types"

const generateMessages = (chatId: string): ChatMessage[] => [
  {
    id: `${chatId}-1`,
    senderId: "current-user",
    content: "Hi! I'm interested in buying this card for the listed price.",
    timestamp: new Date(Date.now() - 3600000),
    isRead: true,
  },
  {
    id: `${chatId}-2`,
    senderId: "other-user",
    content: "Hello! Yes, the card is still available. It's in near mint condition.",
    timestamp: new Date(Date.now() - 3000000),
    isRead: true,
  },
  {
    id: `${chatId}-3`,
    senderId: "current-user",
    content: "Perfect! I'd like to proceed with the purchase.",
    timestamp: new Date(Date.now() - 1800000),
    isRead: true,
  },
]

export const mockChats: Chat[] = [
  {
    id: "chat-1",
    buyerId: "current-user",
    buyerName: "CardMaster123",
    sellerId: "seller-1",
    sellerName: "OnePieceCollector",
    cardId: "EB01-006",
    cardName: "Tony Tony.Chopper",
    cardImage: "https://en.onepiece-cardgame.com/images/cardlist/card/EB01-006_r1.png",
    price: 25.99,
    condition: "Near Mint",
    status: "Negotiating",
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 1800000),
    messages: generateMessages("chat-1"),
    lastMessage: "Perfect! I'd like to proceed with the purchase.",
    lastMessageTime: new Date(Date.now() - 1800000),
  },
  {
    id: "chat-2",
    buyerId: "buyer-2",
    buyerName: "TCGFan99",
    sellerId: "current-user",
    sellerName: "CardMaster123",
    cardId: "OP01-025",
    cardName: "Roronoa Zoro",
    cardImage: "/placeholder.svg?height=838&width=600",
    price: 45.99,
    condition: "Near Mint",
    status: "Deal Agreed",
    createdAt: new Date(Date.now() - 14400000),
    updatedAt: new Date(Date.now() - 3600000),
    messages: generateMessages("chat-2"),
    lastMessage: "Great! I'll confirm the deal now.",
    lastMessageTime: new Date(Date.now() - 3600000),
  },
  {
    id: "chat-3",
    buyerId: "current-user",
    buyerName: "CardMaster123",
    sellerId: "seller-3",
    sellerName: "SwordMaster",
    cardId: "OP01-039",
    cardName: "Nami",
    cardImage: "/placeholder.svg?height=838&width=600",
    price: 8.99,
    condition: "Lightly Played",
    status: "Completed",
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 7200000),
    messages: generateMessages("chat-3"),
    lastMessage: "Transaction completed successfully!",
    lastMessageTime: new Date(Date.now() - 7200000),
  },
]
