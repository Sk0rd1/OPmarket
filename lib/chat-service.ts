import type { ChatMessage } from "./types"

interface CreateChatParams {
  cardId: string
  cardName: string
  cardImage: string
  sellerId: string
  buyerId: string
  price: number
  condition: string
}

export async function createChat(params: CreateChatParams): Promise<string> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const chatId = `chat-${Date.now()}`

  // In a real app, this would create a chat in the database
  // For now, we'll just return the chat ID
  return chatId
}

export async function sendMessage(chatId: string, senderId: string, content: string): Promise<ChatMessage> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 200))

  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    senderId,
    content,
    timestamp: new Date(),
    isRead: false,
  }

  return message
}

export async function updateChatStatus(chatId: string, status: string): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))

  // In a real app, this would update the chat status in the database
  console.log(`Chat ${chatId} status updated to: ${status}`)
}
