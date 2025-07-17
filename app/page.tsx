"use client"

import { useState, useMemo } from "react"
import Header from "@/components/header"
import FilterPanel from "@/components/filter-panel"
import CardGrid from "@/components/card-grid"
import { mockCards } from "@/lib/mock-data"
import type { FilterState } from "@/lib/types"

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    sellerSearch: "",
    rarity: [],
    color: [],
    type: "",
    series: "",
    priceRange: [0, 1000],
    powerRange: [0, 12000],
    attribute: "",
    sortBy: "name-asc",
  })

  const filteredCards = useMemo(() => {
    const filtered = mockCards.filter((card) => {
      // Search filter
      if (filters.search && !card.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Seller search filter
      if (filters.sellerSearch) {
        const hasMatchingSeller = card.listings.some((listing) =>
          listing.seller.toLowerCase().includes(filters.sellerSearch.toLowerCase()),
        )
        if (!hasMatchingSeller) {
          return false
        }
      }

      // Rarity filter
      if (filters.rarity.length > 0 && !filters.rarity.includes(card.rarity)) {
        return false
      }

      // Color filter
      if (filters.color.length > 0 && !filters.color.includes(card.color)) {
        return false
      }

      // Type filter
      if (filters.type && filters.type !== "all-types" && card.type !== filters.type) {
        return false
      }

      // Series filter
      if (filters.series && filters.series !== "all-series" && card.series_name !== filters.series) {
        return false
      }

      // Price range filter
      if (card.market_price < filters.priceRange[0] || card.market_price > filters.priceRange[1]) {
        return false
      }

      // Power range filter
      if (card.power < filters.powerRange[0] || card.power > filters.powerRange[1]) {
        return false
      }

      // Attribute filter
      if (filters.attribute && filters.attribute !== "all-attributes" && card.attribute !== filters.attribute) {
        return false
      }

      return true
    })

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "price-low":
          return a.market_price - b.market_price
        case "price-high":
          return b.market_price - a.market_price
        case "rarity":
          const rarityOrder = { C: 1, UC: 2, R: 3, SR: 4, SEC: 5, L: 6, P: 7 }
          return (
            (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) -
            (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0)
          )
        default:
          return 0
      }
    })

    return filtered
  }, [filters])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          </div>
          <div className="lg:col-span-3">
            <CardGrid cards={filteredCards} />
          </div>
        </div>
      </main>
    </div>
  )
}
