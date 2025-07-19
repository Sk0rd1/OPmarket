"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RotateCcw } from "lucide-react"
import type { FilterState } from "@/lib/types"

interface FilterPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const rarities = ["C", "UC", "R", "SR", "SEC", "L", "P"]
  const colors = ["Red", "Blue", "Green", "Yellow", "Purple", "Black", "Multicolor"]
  const types = ["CHARACTER", "EVENT", "STAGE", "LEADER"]
  const attributes = ["Strike", "Slash", "Ranged", "Special", "Wisdom"]
  const series = [
    "BOOSTER PACK ROMANCE DAWN [OP-01]",
    "BOOSTER PACK PARAMOUNT WAR [OP-02]",
    "BOOSTER PACK PILLARS OF STRENGTH [OP-03]",
    "ONE PIECE CARD THE BEST- [PRB-01]",
  ]

  const handleRarityChange = (rarity: string, checked: boolean) => {
    const newRarities = checked ? [...filters.rarity, rarity] : filters.rarity.filter((r) => r !== rarity)
    onFiltersChange({ ...filters, rarity: newRarities })
  }

  const handleColorChange = (color: string, checked: boolean) => {
    const newColors = checked ? [...filters.color, color] : filters.color.filter((c) => c !== color)
    onFiltersChange({ ...filters, color: newColors })
  }

  const resetFilters = () => {
    onFiltersChange({
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
  }

  return (
    <Card className="sticky top-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Filters</CardTitle>
        <Button variant="outline" size="sm" onClick={resetFilters} className="flex items-center gap-2 bg-transparent">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium">
            Search by Name
          </Label>
          <Input
            id="search"
            placeholder="Search cards by name..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Seller Search */}
        <div>
          <Label htmlFor="sellerSearch" className="text-sm font-medium">
            Search by Seller
          </Label>
          <Input
            id="sellerSearch"
            placeholder="Search by seller nickname..."
            value={filters.sellerSearch}
            onChange={(e) => onFiltersChange({ ...filters, sellerSearch: e.target.value })}
            className="mt-1"
          />
        </div>

        <Separator />

        {/* Rarity */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Rarity</Label>
          <div className="grid grid-cols-2 gap-2">
            {rarities.map((rarity) => (
              <div key={rarity} className="flex items-center space-x-2">
                <Checkbox
                  id={`rarity-${rarity}`}
                  checked={filters.rarity.includes(rarity)}
                  onCheckedChange={(checked) => handleRarityChange(rarity, checked as boolean)}
                />
                <Label htmlFor={`rarity-${rarity}`} className="text-sm">
                  {rarity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Color */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Color</Label>
          <div className="space-y-2">
            {colors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={filters.color.includes(color)}
                  onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                />
                <div className={`w-4 h-4 rounded-full ${getColorClass(color)}`} />
                <Label htmlFor={`color-${color}`} className="text-sm">
                  {color}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Type */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Type</Label>
          <Select value={filters.type} onValueChange={(value) => onFiltersChange({ ...filters, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Series */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Series</Label>
          <Select value={filters.series} onValueChange={(value) => onFiltersChange({ ...filters, series: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select series" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-series">All Series</SelectItem>
              {series.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.split("[")[0].trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
            max={1000}
            min={0}
            step={5}
            className="mt-2"
          />
        </div>

        {/* Power Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Power Range: {filters.powerRange[0]} - {filters.powerRange[1]}
          </Label>
          <Slider
            value={filters.powerRange}
            onValueChange={(value) => onFiltersChange({ ...filters, powerRange: value as [number, number] })}
            max={12000}
            min={0}
            step={500}
            className="mt-2"
          />
        </div>

        <Separator />

        {/* Attribute */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Attribute</Label>
          <Select
            value={filters.attribute}
            onValueChange={(value) => onFiltersChange({ ...filters, attribute: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select attribute" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-attributes">All Attributes</SelectItem>
              {attributes.map((attr) => (
                <SelectItem key={attr} value={attr}>
                  {attr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-low">Price Low-High</SelectItem>
              <SelectItem value="price-high">Price High-Low</SelectItem>
              <SelectItem value="rarity">Rarity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
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
