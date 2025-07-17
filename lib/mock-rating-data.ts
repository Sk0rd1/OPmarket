import type { Rating, RatingSummary } from "./types"

export const mockUserRatings = {
  summary: {
    averageRating: 4.8,
    totalRatings: 47,
    totalTransactions: 52,
    breakdown: {
      communication: 4.9,
      speed: 4.7,
      reliability: 4.8,
    },
  } as RatingSummary,

  recentRatings: [
    {
      id: "rating-1",
      chatId: "chat-3",
      ratedUserId: "current-user",
      raterUserId: "seller-3",
      raterName: "SwordMaster",
      cardName: "Nami",
      overallRating: 5,
      communication: 5,
      speed: 5,
      reliability: 5,
      comment: "Excellent buyer! Fast payment and great communication throughout.",
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      id: "rating-2",
      chatId: "chat-4",
      ratedUserId: "current-user",
      raterUserId: "buyer-4",
      raterName: "PirateKing2024",
      cardName: "Monkey.D.Luffy",
      overallRating: 4,
      communication: 4,
      speed: 4,
      reliability: 4,
      comment: "Good seller, card was as described. Shipping was a bit slow but overall satisfied.",
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: "rating-3",
      chatId: "chat-5",
      ratedUserId: "current-user",
      raterUserId: "buyer-5",
      raterName: "GrandLineTrader",
      cardName: "Portgas.D.Ace",
      overallRating: 5,
      communication: 5,
      speed: 5,
      reliability: 5,
      comment: "Perfect transaction! Card arrived quickly and in perfect condition.",
      createdAt: new Date(Date.now() - 172800000),
    },
  ] as Rating[],
}
