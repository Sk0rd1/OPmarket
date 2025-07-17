"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, User } from "lucide-react"
import { mockUserRatings } from "@/lib/mock-rating-data"

export default function RatingDisplay() {
  const { summary, recentRatings } = mockUserRatings

  const StarDisplay = ({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-blue-900">{summary.averageRating.toFixed(1)}</div>
              <StarDisplay rating={Math.round(summary.averageRating)} size="w-6 h-6" />
              <p className="text-gray-600">Based on {summary.totalRatings} reviews</p>
              <Badge variant="secondary" className="text-sm">
                {summary.totalTransactions} total transactions
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Communication</span>
                <span>{summary.breakdown.communication.toFixed(1)}</span>
              </div>
              <Progress value={summary.breakdown.communication * 20} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Speed</span>
                <span>{summary.breakdown.speed.toFixed(1)}</span>
              </div>
              <Progress value={summary.breakdown.speed * 20} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Reliability</span>
                <span>{summary.breakdown.reliability.toFixed(1)}</span>
              </div>
              <Progress value={summary.breakdown.reliability * 20} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRatings.map((rating) => (
              <div key={rating.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{rating.raterName}</p>
                      <p className="text-xs text-gray-500">{rating.cardName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StarDisplay rating={rating.overallRating} />
                    <p className="text-xs text-gray-500 mt-1">{rating.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
                {rating.comment && <p className="text-sm text-gray-700 mt-2 pl-11">{rating.comment}</p>}
                <div className="flex gap-4 text-xs text-gray-500 mt-2 pl-11">
                  <span>Communication: {rating.communication}/5</span>
                  <span>Speed: {rating.speed}/5</span>
                  <span>Reliability: {rating.reliability}/5</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
