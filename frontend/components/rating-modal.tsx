"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star } from "lucide-react"
import { submitRating } from "@/lib/rating-service"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  chatId: string
  targetUserId: string
  targetUserName: string
  cardName: string
  cardImage: string
}

export default function RatingModal({
  isOpen,
  onClose,
  chatId,
  targetUserId,
  targetUserName,
  cardName,
  cardImage,
}: RatingModalProps) {
  const [ratings, setRatings] = useState({
    overall: 0,
    communication: 0,
    speed: 0,
    reliability: 0,
  })
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStarClick = (category: keyof typeof ratings, rating: number) => {
    setRatings((prev) => ({ ...prev, [category]: rating }))
  }

  const handleSubmit = async () => {
    if (ratings.overall === 0) {
      alert("Please provide an overall rating")
      return
    }

    setIsSubmitting(true)
    try {
      await submitRating({
        chatId,
        ratedUserId: targetUserId,
        raterUserId: "current-user",
        overallRating: ratings.overall,
        communication: ratings.communication,
        speed: ratings.speed,
        reliability: ratings.reliability,
        comment: comment.trim(),
      })

      onClose()
    } catch (error) {
      console.error("Failed to submit rating:", error)
      alert("Failed to submit rating. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({
    rating,
    onRate,
    label,
  }: { rating: number; onRate: (rating: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}:</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onRate(star)} className="focus:outline-none">
            <Star
              className={`w-6 h-6 ${
                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience with {targetUserName}</DialogTitle>
          <DialogDescription>Help other users by sharing your experience with this transaction</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Image
              src={cardImage || "/placeholder.svg?height=60&width=43"}
              alt={cardName}
              width={40}
              height={56}
              className="rounded"
            />
            <div>
              <p className="font-medium text-sm">{cardName}</p>
              <p className="text-xs text-gray-600">Transaction with {targetUserName}</p>
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            <StarRating
              rating={ratings.overall}
              onRate={(rating) => handleStarClick("overall", rating)}
              label="Overall Rating"
            />
            <StarRating
              rating={ratings.communication}
              onRate={(rating) => handleStarClick("communication", rating)}
              label="Communication"
            />
            <StarRating rating={ratings.speed} onRate={(rating) => handleStarClick("speed", rating)} label="Speed" />
            <StarRating
              rating={ratings.reliability}
              onRate={(rating) => handleStarClick("reliability", rating)}
              label="Reliability"
            />
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              Comment (optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Share additional feedback about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Skip Rating
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
