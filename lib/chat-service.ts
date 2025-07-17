import type { ChatMessage } from "./types"

// Mock service functions - in a real app these would make API calls

export async function createChat(params: {
  cardId: string
  cardName: string
  cardImage: string
  sellerId: string
  buyerId: string
  price: number
  condition: string
}): Promise<string> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const chatId = `chat-${Date.now()}`

  // In a real app, this would create the chat in the database
  console.log("Creating chat:", { chatId, ...params })

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

  // In a real app, this would save the message to the database
  console.log("Sending message:", message)

  return message
}

export async function updateChatStatus(chatId: string, status: string): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))

  // In a real app, this would update the chat status in the database
  console.log("Updating chat status:", { chatId, status })
}
