"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import { getRarityColor } from "@/lib/utils"
import type { UserCard, PriceEntry } from "@/lib/types"

interface EditCardModalProps {
  card: UserCard
  isOpen: boolean
  onClose: () => void
  onSave: (card: UserCard) => void
}

export default function EditCardModal({ card, isOpen, onClose, onSave }: EditCardModalProps) {
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([])

  useEffect(() => {
    if (card.priceEntries && card.priceEntries.length > 0) {
      setPriceEntries([...card.priceEntries])
    } else {
      setPriceEntries([{ quantity: card.quantity || 1, price: card.sellingPrice || 0 }])
    }
  }, [card])

  const handleSave = () => {
    // Validate entries
    const validEntries = priceEntries.filter((entry) => entry.quantity > 0 && entry.price > 0)

    if (validEntries.length === 0) {
      alert("Please add at least one valid price entry")
      return
    }

    const totalQuantity = validEntries.reduce((sum, entry) => sum + entry.quantity, 0)
    const averagePrice = validEntries.reduce((sum, entry) => sum + entry.price * entry.quantity, 0) / totalQuantity

    const updatedCard: UserCard = {
      ...card,
      priceEntries: validEntries,
      quantity: totalQuantity,
      sellingPrice: averagePrice,
    }

    onSave(updatedCard)
  }

  const addPriceEntry = () => {
    setPriceEntries([...priceEntries, { quantity: 1, price: card.market_price || 0 }])
  }

  const removePriceEntry = (index: number) => {
    if (priceEntries.length > 1) {
      setPriceEntries(priceEntries.filter((_, i) => i !== index))
    }
  }

  const updatePriceEntry = (index: number, field: "quantity" | "price", value: number) => {
    const newEntries = [...priceEntries]
    newEntries[index] = { ...newEntries[index], [field]: Math.max(0, value) }
    setPriceEntries(newEntries)
  }

  const totalQuantity = priceEntries.reduce((sum, entry) => sum + entry.quantity, 0)
  const totalValue = priceEntries.reduce((sum, entry) => sum + entry.price * entry.quantity, 0)
  const averagePrice = totalQuantity > 0 ? totalValue / totalQuantity : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Card Listing</DialogTitle>
          <DialogDescription>Update the price and quantity for your card listing</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Image */}
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src={card.image_url || "/placeholder.svg?height=279&width=200"}
                alt={card.name}
                width={200}
                height={279}
                className="rounded-lg shadow-md"
              />
              <Badge className={`absolute top-2 right-2 ${getRarityColor(card.rarity)}`}>{card.rarity}</Badge>
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{card.name}</h3>
              <p className="text-sm text-gray-600">{card.id}</p>
            </div>

            <Separator />

            {/* Price Entries */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Pricing</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPriceEntry}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add New Price Entry
                </Button>
              </div>

              <div className="space-y-3">
                {priceEntries.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-600">Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={entry.quantity}
                          onChange={(e) => updatePriceEntry(index, "quantity", Number.parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.price}
                          onChange={(e) => updatePriceEntry(index, "price", Number.parseFloat(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                    </div>
                    {priceEntries.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePriceEntry(index)}
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Each price entry represents a separate listing. You can sell identical cards at different prices.
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Quantity:</p>
                  <p className="font-medium">{totalQuantity}</p>
                </div>
                <div>
                  <p className="text-gray-600">Average Price:</p>
                  <p className="font-medium">${averagePrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Value:</p>
                  <p className="font-medium">${totalValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Market Price:</p>
                  <p className="font-medium">${card.market_price?.toFixed(2) || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
