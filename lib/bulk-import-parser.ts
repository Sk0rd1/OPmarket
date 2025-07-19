import { mockCards } from "./mock-data"
import type { UserCard } from "./types"

export function parseBulkImport(importText: string): UserCard[] {
  const lines = importText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const results: UserCard[] = []

  for (const line of lines) {
    try {
      const parsed = parseLine(line)
      if (parsed) {
        results.push(...parsed)
      }
    } catch (error) {
      throw new Error(`Error parsing line "${line}": ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return results
}

function parseLine(line: string): UserCard[] | null {
  // Remove spaces around = and {}
  const cleanLine = line
    .replace(/\s*=\s*/g, "=")
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")

  // Parse quantity prefix (e.g., "4x")
  let quantity = 1
  let cardPart = cleanLine

  const quantityMatch = cleanLine.match(/^(\d+)x(.+)/)
  if (quantityMatch) {
    quantity = Number.parseInt(quantityMatch[1])
    cardPart = quantityMatch[2]
  }

  // Split card ID and price part
  const [cardId, pricePart] = cardPart.split("=")
  if (!cardId || !pricePart) {
    throw new Error("Invalid format. Expected: CardID=Price")
  }

  // Find the base card data
  const baseCard = mockCards.find((card) => card.id === cardId)
  if (!baseCard) {
    throw new Error(`Card ${cardId} not found in database`)
  }

  // Parse prices
  const prices = parsePrices(pricePart, baseCard.market_price)

  // Create user cards
  const userCards: UserCard[] = []

  if (prices.length === 1) {
    // Single price for all quantity
    userCards.push(createUserCard(baseCard, prices[0], quantity))
  } else {
    // Multiple prices - create separate entries
    prices.forEach((price, index) => {
      userCards.push(createUserCard(baseCard, price, 1, index))
    })
  }

  return userCards
}

function parsePrices(pricePart: string, marketPrice: number): number[] {
  // Handle multiple prices: {12,13} or {m,23}
  if (pricePart.startsWith("{") && pricePart.endsWith("}")) {
    const pricesStr = pricePart.slice(1, -1)
    return pricesStr.split(",").map((p) => parsePrice(p.trim(), marketPrice))
  }

  // Single price
  return [parsePrice(pricePart, marketPrice)]
}

function parsePrice(priceStr: string, marketPrice: number): number {
  // Market price with fallback: m$15
  if (priceStr.startsWith("m$")) {
    const fallback = Number.parseFloat(priceStr.substring(2))
    return marketPrice || fallback
  }

  // Market price: m
  if (priceStr === "m") {
    return marketPrice
  }

  // Regular price
  const price = Number.parseFloat(priceStr)
  if (isNaN(price)) {
    throw new Error(`Invalid price: ${priceStr}`)
  }

  return price
}

function createUserCard(baseCard: any, price: number, quantity: number, priceIndex?: number): UserCard {
  return {
    id: baseCard.id,
    name: baseCard.name,
    rarity: baseCard.rarity,
    type: baseCard.type,
    attribute: baseCard.attribute,
    power: baseCard.power,
    counter: baseCard.counter,
    color: baseCard.color,
    card_type: baseCard.card_type,
    effect: baseCard.effect,
    image_url: baseCard.image_url,
    alternate_art: baseCard.alternate_art,
    series_id: baseCard.series_id,
    series_name: baseCard.series_name,
    market_price: baseCard.market_price,
    sellingPrice: price,
    quantity: quantity,
    priceIndex: priceIndex,
  }
}
