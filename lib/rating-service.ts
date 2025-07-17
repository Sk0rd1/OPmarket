export async function submitRating(params: {
  chatId: string
  ratedUserId: string
  raterUserId: string
  overallRating: number
  communication: number
  speed: number
  reliability: number
  comment: string
}): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, this would save the rating to the database
  console.log("Submitting rating:", params)
}
