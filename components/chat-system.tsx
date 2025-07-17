"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Send, Check, X, Clock, MessageCircle } from "lucide-react"
import { mockChats } from "@/lib/mock-chat-data"
import { sendMessage, updateChatStatus } from "@/lib/chat-service"
import RatingModal from "@/components/rating-modal"
import type { Chat } from "@/lib/types"

export default function ChatSystem() {
  const searchParams = useSearchParams()
  const initialChatId = searchParams.get("chatId")

  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingTarget, setRatingTarget] = useState<{ chatId: string; userId: string; userName: string } | null>(null)

  useEffect(() => {
    if (initialChatId) {
      const chat = chats.find((c) => c.id === initialChatId)
      if (chat) {
        setSelectedChat(chat)
      }
    }
  }, [initialChatId, chats])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    try {
      const message = await sendMessage(selectedChat.id, "current-user", newMessage)

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, messages: [...chat.messages, message], lastMessage: newMessage, lastMessageTime: new Date() }
            : chat,
        ),
      )

      setSelectedChat((prev) => (prev ? { ...prev, messages: [...prev.messages, message] } : null))
      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleStatusUpdate = async (chatId: string, newStatus: string) => {
    try {
      await updateChatStatus(chatId, newStatus)

      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, status: newStatus } : chat)))

      if (selectedChat?.id === chatId) {
        setSelectedChat((prev) => (prev ? { ...prev, status: newStatus } : null))
      }

      // If deal is completed, show rating modal
      if (newStatus === "Completed") {
        const chat = chats.find((c) => c.id === chatId)
        if (chat) {
          const otherUserId = chat.buyerId === "current-user" ? chat.sellerId : chat.buyerId
          const otherUserName = chat.buyerId === "current-user" ? chat.sellerName : chat.buyerName
          setRatingTarget({ chatId, userId: otherUserId, userName: otherUserName })
          setShowRatingModal(true)
        }
      }
    } catch (error) {
      console.error("Failed to update chat status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Negotiating":
        return "bg-blue-100 text-blue-800"
      case "Deal Agreed":
        return "bg-green-100 text-green-800"
      case "Awaiting Payment":
        return "bg-orange-100 text-orange-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4" />
      case "Negotiating":
        return <MessageCircle className="w-4 h-4" />
      case "Deal Agreed":
        return <Check className="w-4 h-4" />
      case "Awaiting Payment":
        return <Clock className="w-4 h-4" />
      case "Completed":
        return <Check className="w-4 h-4" />
      case "Cancelled":
        return <X className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chat List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Active Chats ({chats.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 p-4">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === chat.id ? "bg-blue-50 border-blue-200 border" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-start gap-3">
                    <Image
                      src={chat.cardImage || "/placeholder.svg?height=60&width=43"}
                      alt={chat.cardName}
                      width={30}
                      height={42}
                      className="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate">{chat.cardName}</p>
                        <Badge className={`text-xs ${getStatusColor(chat.status)}`}>
                          {getStatusIcon(chat.status)}
                          <span className="ml-1">{chat.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">${chat.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-2 h-2 text-gray-600" />
                        </div>
                        <span className="text-xs text-gray-500">
                          {chat.buyerId === "current-user" ? chat.sellerName : chat.buyerName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{chat.lastMessage}</p>
                      <p className="text-xs text-gray-400">{chat.lastMessageTime.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-2">
        {selectedChat ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={selectedChat.cardImage || "/placeholder.svg?height=60&width=43"}
                    alt={selectedChat.cardName}
                    width={40}
                    height={56}
                    className="rounded"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {selectedChat.cardName} - ${selectedChat.price.toFixed(2)}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Buyer: {selectedChat.buyerName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Seller: {selectedChat.sellerName}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(selectedChat.status)}>
                  {getStatusIcon(selectedChat.status)}
                  <span className="ml-1">{selectedChat.status}</span>
                </Badge>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="p-0">
              {/* Messages */}
              <ScrollArea className="h-[300px] p-4">
                <div className="space-y-4">
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === "current-user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderId === "current-user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === "current-user" ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Deal Controls */}
              {selectedChat.status !== "Completed" && selectedChat.status !== "Cancelled" && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2 mb-3">
                    {selectedChat.buyerId === "current-user" ? (
                      // Buyer controls
                      <>
                        {selectedChat.status === "Deal Agreed" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(selectedChat.id, "Completed")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirm Payment
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(selectedChat.id, "Cancelled")}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel Order
                        </Button>
                      </>
                    ) : (
                      // Seller controls
                      <>
                        {(selectedChat.status === "Pending" || selectedChat.status === "Negotiating") && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(selectedChat.id, "Deal Agreed")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirm Deal
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(selectedChat.id, "Cancelled")}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel Deal
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={selectedChat.status === "Completed" || selectedChat.status === "Cancelled"}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      !newMessage.trim() || selectedChat.status === "Completed" || selectedChat.status === "Cancelled"
                    }
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a chat to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Rating Modal */}
      {showRatingModal && ratingTarget && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false)
            setRatingTarget(null)
          }}
          chatId={ratingTarget.chatId}
          targetUserId={ratingTarget.userId}
          targetUserName={ratingTarget.userName}
          cardName={selectedChat?.cardName || ""}
          cardImage={selectedChat?.cardImage || ""}
        />
      )}
    </div>
  )
}
