import type { Rating } from "./types"

interface SubmitRatingParams {
  chatId: string
  ratedUserId: string
  raterUserId: string
  raterName: string
  cardName: string
  overallRating: number
  communication: number
  speed: number
  reliability: number
  comment: string
}

export async function submitRating(params: SubmitRatingParams): Promise<Rating> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const rating: Rating = {
    id: `rating-${Date.now()}`,
    ...params,
    createdAt: new Date(),
  }

  // In a real app, this would save the rating to the database
  console.log("Rating submitted:", rating)

  return rating
}
