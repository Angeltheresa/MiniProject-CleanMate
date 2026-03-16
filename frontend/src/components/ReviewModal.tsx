import { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { customerAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  bookingId: string;
  agentId: string;
  agentName?: string;
  open: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export function ReviewModal({
  bookingId,
  agentId,
  agentName,
  open,
  onClose,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await customerAPI.submitReview({
        bookingId,
        agentId,
        rating,
        comment,
      });

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setRating(0);
      setComment("");
      onReviewSubmitted();
      onClose();
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1a2e1a]">
            Leave a Review
          </DialogTitle>
          <DialogDescription>
            {agentName
              ? `Share your experience with ${agentName}`
              : "Share your experience with the cleaning service"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-medium text-[#1a2e1a] mb-3">
              How would you rate this service?
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium text-[#1a2e1a] block mb-2">
              Your feedback (optional)
            </label>
            <Textarea
              placeholder="Share details about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="bg-[#1a2e1a] hover:bg-[#1a2e1a]/90"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
