"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, X } from "lucide-react"
import type { FilterState } from "@/lib/types"

interface FilterPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
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
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const rarities = ["C", "UC", "R", "SR", "SEC", "L", "P"]
  const colors = ["Red", "Blue", "Green", "Yellow", "Purple", "Black", "Multicolor"]
  const types = ["CHARACTER", "EVENT", "STAGE", "LEADER"]
  const attributes = ["Strike", "Slash", "Ranged", "Special"]
  const series = [
    "BOOSTER PACK ROMANCE DAWN [OP-01]",
    "BOOSTER PACK PARAMOUNT WAR [OP-02]",
    "BOOSTER PACK PILLARS OF STRENGTH [OP-03]",
    "ONE PIECE CARD THE BEST- [PRB-01]",
  ]

  const handleRarityChange = (rarity: string, checked: boolean) => {
    const newRarities = checked ? [...localFilters.rarity, rarity] : localFilters.rarity.filter((r) => r !== rarity)
    updateFilter("rarity", newRarities)
  }

  const handleColorChange = (color: string, checked: boolean) => {
    const newColors = checked ? [...localFilters.color, color] : localFilters.color.filter((c) => c !== color)
    updateFilter("color", newColors)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search cards..."
              value={localFilters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by seller..."
              value={localFilters.sellerSearch}
              onChange={(e) => updateFilter("sellerSearch", e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rarity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rarity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rarities.map((rarity) => (
              <div key={rarity} className="flex items-center space-x-2">
                <Checkbox
                  id={`rarity-${rarity}`}
                  checked={localFilters.rarity.includes(rarity)}
                  onCheckedChange={(checked) => handleRarityChange(rarity, checked as boolean)}
                />
                <Label htmlFor={`rarity-${rarity}`} className="text-sm">
                  {rarity}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Color</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {colors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={localFilters.color.includes(color)}
                  onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                />
                <Label htmlFor={`color-${color}`} className="text-sm flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getColorClass(color)}`} />
                  {color}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={localFilters.type} onValueChange={(value) => updateFilter("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Series */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Series</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={localFilters.series} onValueChange={(value) => updateFilter("series", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All series" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-series">All series</SelectItem>
              {series.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Attribute */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attribute</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={localFilters.attribute} onValueChange={(value) => updateFilter("attribute", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All attributes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-attributes">All attributes</SelectItem>
              {attributes.map((attr) => (
                <SelectItem key={attr} value={attr}>
                  {attr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={localFilters.priceRange}
              onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
              max={1000}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${localFilters.priceRange[0]}</span>
              <span>${localFilters.priceRange[1]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Power Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Power Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={localFilters.powerRange}
              onValueChange={(value) => updateFilter("powerRange", value as [number, number])}
              max={12000}
              min={0}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{localFilters.powerRange[0].toLocaleString()}</span>
              <span>{localFilters.powerRange[1].toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort By */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={localFilters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-low">Price (Low to High)</SelectItem>
              <SelectItem value="price-high">Price (High to Low)</SelectItem>
              <SelectItem value="rarity">Rarity</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
        <X className="w-4 h-4 mr-2" />
        Clear All Filters
      </Button>
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
    Multicolor: "bg-gradient-to-r from-red-500 via-blue-500 to-green-500",
  }
  return colorMap[color] || "bg-gray-400"
}
