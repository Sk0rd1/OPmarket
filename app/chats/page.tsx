"use client"

import Header from "@/components/header"
import ChatSystem from "@/components/chat-system"
import ProtectedRoute from "@/components/auth/protected-route"

export default function ChatsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <ChatSystem />
        </div>
      </div>
    </ProtectedRoute>
  )
}
