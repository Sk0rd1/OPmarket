"use client"

import { useState } from "react"
import Header from "@/components/header"
import SellCardGrid from "@/components/sell-card-grid"
import BulkImportPanel from "@/components/bulk-import-panel"
import EditCardModal from "@/components/edit-card-modal"
import { mockUserCards } from "@/lib/mock-user-data"
import type { UserCard } from "@/lib/types"

export default function SellCardsPage() {
  const [userCards, setUserCards] = useState<UserCard[]>(mockUserCards)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const filteredCards = userCards.filter((card) => card.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCardClick = (card: UserCard) => {
    setSelectedCard(card)
    setIsEditModalOpen(true)
  }

  const handleCardUpdate = (updatedCard: UserCard) => {
    setUserCards((prev) => prev.map((card) => (card.id === updatedCard.id ? updatedCard : card)))
    setIsEditModalOpen(false)
    setSelectedCard(null)
  }

  const handleBulkImport = (importedCards: UserCard[]) => {
    setUserCards((prev) => {
      const updated = [...prev]
      importedCards.forEach((importCard) => {
        const existingIndex = updated.findIndex((card) => card.id === importCard.id)
        if (existingIndex >= 0) {
          updated[existingIndex] = importCard
        } else {
          updated.push(importCard)
        }
      })
      return updated
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell Your Cards</h1>
          <p className="text-gray-600">Manage your card listings and add new cards for sale</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <BulkImportPanel
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onBulkImport={handleBulkImport}
            />
          </div>
          <div className="lg:col-span-3">
            <SellCardGrid cards={filteredCards} onCardClick={handleCardClick} />
          </div>
        </div>
      </main>

      {selectedCard && (
        <EditCardModal
          card={selectedCard}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedCard(null)
          }}
          onSave={handleCardUpdate}
        />
      )}
    </div>
  )
}
