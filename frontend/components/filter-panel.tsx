"use client"

import { useState, useEffect, useCallback } from "react"
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

// Функція debounce для оптимізації пошуку
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Валідація та санітізація інпутів
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Базова XSS захист
    .substring(0, 100) // Обмеження довжини
}

const validatePriceRange = (range: number[]): [number, number] => {
  const [min, max] = range
  const safeMin = Math.max(0, Math.min(min || 0, 10000))
  const safeMax = Math.max(safeMin, Math.min(max || 1000, 10000))
  return [safeMin, safeMax]
}

const validatePowerRange = (range: number[]): [number, number] => {
  const [min, max] = range
  const safeMin = Math.max(0, Math.min(min || 0, 50000))
  const safeMax = Math.max(safeMin, Math.min(max || 12000, 50000))
  return [safeMin, safeMax]
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters)
  const [searchInput, setSearchInput] = useState(filters.search)

  // Debounced search - запит відправляється тільки після паузи в 500мс
  const debouncedSearch = useDebounce(searchInput, 500)

  // Відправка debouncеd пошуку
  useEffect(() => {
    if (debouncedSearch !== localFilters.search) {
      updateFilter("search", sanitizeInput(debouncedSearch))
    }
  }, [debouncedSearch])

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    let sanitizedValue = value

    // Валідація різних типів фільтрів
    switch (key) {
      case 'search':
        sanitizedValue = sanitizeInput(value)
        break
      case 'priceRange':
        sanitizedValue = validatePriceRange(value)
        break
      case 'powerRange':
        sanitizedValue = validatePowerRange(value)
        break
      case 'rarity':
      case 'color':
        // Валідація масивів
        if (!Array.isArray(value)) sanitizedValue = []
        sanitizedValue = value.filter((item: string) => typeof item === 'string' && item.length < 20)
        break
    }

    const newFilters = { ...localFilters, [key]: sanitizedValue }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }, [localFilters, onFiltersChange])

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      sellerSearch: "", // Залишаю для сумісності, але не показую
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
    setSearchInput("")
    onFiltersChange(clearedFilters)
  }

  // Валідні опції для фільтрів
  const validRarities = ["C", "UC", "R", "SR", "SEC", "L", "P"]
  const validColors = ["Red", "Blue", "Green", "Yellow", "Purple", "Black", "Multicolor"]
  const validTypes = ["CHARACTER", "EVENT", "STAGE", "DON", "LEADER"]
  const validAttributes = ["Strike", "Slash", "Ranged", "Special"]
  const validSeries = [
    "BOOSTER PACK ROMANCE DAWN [OP-01]",
    "BOOSTER PACK PARAMOUNT WAR [OP-02]",
    "BOOSTER PACK PILLARS OF STRENGTH [OP-03]",
    "BOOSTER PACK KINGDOMS OF INTRIGUE [OP-04]",
    "EMPERORS IN THE NEW WORLD [OP-09]",
  ]

  const handleRarityChange = (rarity: string, checked: boolean) => {
    if (!validRarities.includes(rarity)) return
    
    const newRarities = checked 
      ? [...localFilters.rarity, rarity] 
      : localFilters.rarity.filter((r) => r !== rarity)
    updateFilter("rarity", newRarities)
  }

  const handleColorChange = (color: string, checked: boolean) => {
    if (!validColors.includes(color)) return
    
    const newColors = checked 
      ? [...localFilters.color, color] 
      : localFilters.color.filter((c) => c !== color)
    updateFilter("color", newColors)
  }

  return (
    <div className="space-y-4">
      {/* Search Cards & Card ID */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or card ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
              maxLength={100}
            />
            {searchInput && (
              <div className="text-xs text-gray-500 mt-1">
                Searching... (debounced)
              </div>
            )}
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
            {validRarities.map((rarity) => (
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
            {validColors.map((color) => (
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
              <SelectItem value="">All types</SelectItem>
              {validTypes.map((type) => (
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
              <SelectItem value="">All series</SelectItem>
              {validSeries.map((series) => (
                <SelectItem key={series} value={series}>
                  {series}
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
              <SelectItem value="">All attributes</SelectItem>
              {validAttributes.map((attr) => (
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
      <Button variant="outline" onClick={clearFilters} className="w-full">
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
