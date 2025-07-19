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
  const [overallRating, setOverallRating] = useState(0)
  const [communication, setCommunication] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [reliability, setReliability] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const StarRating = ({
    rating,
    onRatingChange,
    label,
  }: {
    rating: number
    onRatingChange: (rating: number) => void
    label: string
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  const handleSubmit = async () => {
    if (overallRating === 0) {
      alert("Please provide an overall rating")
      return
    }

    setIsSubmitting(true)

    try {
      await submitRating({
        chatId,
        ratedUserId: targetUserId,
        raterUserId: "current-user", // This would come from auth context
        raterName: "CardMaster123", // This would come from auth context
        cardName,
        overallRating,
        communication: communication || overallRating,
        speed: speed || overallRating,
        reliability: reliability || overallRating,
        comment,
      })

      onClose()
    } catch (error) {
      console.error("Failed to submit rating:", error)
      alert("Failed to submit rating. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>Rate your experience with {targetUserName}</DialogDescription>
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
              <p className="text-xs text-gray-500">Transaction with {targetUserName}</p>
            </div>
          </div>

          {/* Overall Rating */}
          <StarRating rating={overallRating} onRatingChange={setOverallRating} label="Overall Rating" />

          {/* Category Ratings */}
          <div className="grid grid-cols-1 gap-4">
            <StarRating rating={communication} onRatingChange={setCommunication} label="Communication" />
            <StarRating rating={speed} onRatingChange={setSpeed} label="Speed" />
            <StarRating rating={reliability} onRatingChange={setReliability} label="Reliability" />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Comment (Optional)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with other traders..."
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{500 - comment.length} characters remaining</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleSkip} disabled={isSubmitting}>
            Skip Rating
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || overallRating === 0}>
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
