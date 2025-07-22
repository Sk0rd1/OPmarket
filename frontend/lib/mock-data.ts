import type { Card } from "./types"

// Generate expanded mock data with 50+ cards
export const mockCards: Card[] = [
  {
    id: "EB01-006",
    name: "Tony Tony.Chopper",
    rarity: "SR",
    type: "CHARACTER",
    attribute: "Strike",
    power: 4000,
    counter: 1000,
    color: "Red",
    card_type: "Animal/Straw Hat Crew",
    effect:
      "[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[DON!! x2] [When Attacking] Give up to 1 of your opponent's Characters −3000 power during this turn.",
    image_url: "https://en.onepiece-cardgame.com/images/cardlist/card/EB01-006_r1.png",
    alternate_art: false,
    series_id: "569301",
    series_name: "ONE PIECE CARD THE BEST- [PRB-01]",
    market_price: 25.99,
    listings: Array.from({ length: 27 }, (_, i) => ({
      seller: `Seller${i + 1}`,
      condition: ["Near Mint", "Lightly Played", "Moderately Played"][i % 3],
      price: 25.99 + (Math.random() - 0.5) * 10,
      quantity: Math.floor(Math.random() * 3) + 1,
    })),
  },
  {
    id: "OP01-025",
    name: "Roronoa Zoro",
    rarity: "SR",
    type: "CHARACTER",
    attribute: "Slash",
    power: 5000,
    counter: 1000,
    color: "Green",
    card_type: "Swordsman/Straw Hat Crew",
    effect: "[DON!! x1] [When Attacking] K.O. up to 1 of your opponent's Characters with 3000 power or less.",
    image_url: "/placeholder.svg?height=838&width=600",
    alternate_art: false,
    series_id: "569302",
    series_name: "BOOSTER PACK ROMANCE DAWN [OP-01]",
    market_price: 45.99,
    listings: [
      { seller: "OnePieceCollector", condition: "Near Mint", price: 45.99, quantity: 1 },
      { seller: "SwordMaster", condition: "Near Mint", price: 47.5, quantity: 2 },
      { seller: "CardMaster123", condition: "Lightly Played", price: 42.0, quantity: 1 },
    ],
  },
  // Generate additional cards
  ...Array.from({ length: 48 }, (_, i) => ({
    id: `OP01-${String(i + 100).padStart(3, "0")}`,
    name: `One Piece Card ${i + 1}`,
    rarity: ["C", "UC", "R", "SR", "SEC"][Math.floor(Math.random() * 5)],
    type: ["CHARACTER", "EVENT", "STAGE"][Math.floor(Math.random() * 3)],
    attribute: ["Strike", "Slash", "Ranged", "Special"][Math.floor(Math.random() * 4)],
    power: Math.floor(Math.random() * 10000) + 1000,
    counter: Math.floor(Math.random() * 2000) + 500,
    color: ["Red", "Blue", "Green", "Yellow", "Purple", "Black"][Math.floor(Math.random() * 6)],
    card_type: "Character/Crew",
    effect: `[Effect ${i + 1}] This card has a special effect that activates under certain conditions.`,
    image_url: "/placeholder.svg?height=838&width=600",
    alternate_art: Math.random() > 0.8,
    series_id: "569302",
    series_name: ["BOOSTER PACK ROMANCE DAWN [OP-01]", "BOOSTER PACK PARAMOUNT WAR [OP-02]"][
      Math.floor(Math.random() * 2)
    ],
    market_price: Math.floor(Math.random() * 100) + 5,
    listings: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
      seller: [`CardTrader${j + 1}`, "OnePieceCollector", "SwordMaster", "CardMaster123"][j % 4],
      condition: ["Near Mint", "Lightly Played", "Moderately Played"][j % 3],
      price: Math.floor(Math.random() * 100) + 5 + (Math.random() - 0.5) * 10,
      quantity: Math.floor(Math.random() * 3) + 1,
    })),
  })),
]
