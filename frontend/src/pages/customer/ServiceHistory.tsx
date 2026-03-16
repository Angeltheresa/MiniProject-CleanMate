import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { customerAPI } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface BookingWithReview {
  _id: string;
  serviceType: string;
  variant: string;
  date: string;
  status: string;
  amount: number;
  agentId?: {
    _id: string;
    fullName: string;
  };
  hasReview?: boolean;
}

export default function ServiceHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithReview | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await customerAPI.getBookings();
      setBookings(res.data);

      // Check review status for completed bookings
      const completedBookings = res.data.filter((b: BookingWithReview) => b.status === "completed" && b.agentId);
      const reviewStatuses = await Promise.all(
        completedBookings.map((b: BookingWithReview) =>
          customerAPI.getBookingReviewStatus(b._id).catch(() => ({ data: { hasReview: false } }))
        )
      );

      const reviewed = new Set<string>();
      completedBookings.forEach((b: BookingWithReview, index: number) => {
        if (reviewStatuses[index]?.data?.hasReview) {
          reviewed.add(b._id);
        }
      });
      setReviewedBookings(reviewed);
    } catch {
      toast({ title: "Error", description: "Unable to load bookings.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (booking: BookingWithReview) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment("");
    setReviewModalOpen(true);
  };

  const submitReview = async () => {
    if (!selectedBooking || !selectedBooking.agentId) return;

    setSubmitting(true);
    try {
      await customerAPI.submitReview({
        bookingId: selectedBooking._id,
        agentId: selectedBooking.agentId._id,
        rating,
        comment,
      });

      toast({ title: "Success", description: "Review submitted successfully!" });
      setReviewedBookings((prev) => new Set(prev).add(selectedBooking._id));
      setReviewModalOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container animate-fade-in flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <h2 className="page-header">Service History</h2>

      <div className="bg-card rounded-xl border border-border/60 shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
            {bookings.map((b) => (
              <TableRow key={b._id}>
                <TableCell>
                  <p className="font-medium text-sm">{b.serviceType}</p>
                  <p className="text-xs text-muted-foreground">{b.variant}</p>
                </TableCell>
                <TableCell className="text-sm">
                  {b.agentId?.fullName || <span className="text-muted-foreground">Not assigned</span>}
                </TableCell>
                <TableCell className="text-sm">{new Date(b.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      b.status === "completed"
                        ? "bg-success/10 text-success"
                        : b.status === "in-progress"
                        ? "bg-info/10 text-info"
                        : b.status === "pending"
                        ? "bg-warning/10 text-warning"
                        : b.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {b.status}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{b.amount.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {b.agentId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/customer/agents/${b.agentId?._id}`)}
                        className="text-xs"
                      >
                        View Profile
                      </Button>
                    )}

                    {b.status === "completed" && b.agentId && !reviewedBookings.has(b._id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewModal(b)}
                        className="text-xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        Review
                      </Button>
                    ) : b.status === "completed" && reviewedBookings.has(b._id) ? (
                      <span className="text-xs text-success flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-success" />
                        Reviewed
                      </span>
                    ) : null}

                    {!b.agentId && <span className="text-xs text-muted-foreground">-</span>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              Share your feedback for {selectedBooking?.agentId?.fullName || "the agent"}'s service.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Service Info */}
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm font-medium">{selectedBooking?.serviceType}</p>
              <p className="text-xs text-muted-foreground">{selectedBooking?.variant}</p>
            </div>

            {/* Star Rating */}
            <div>
              <label className="text-sm font-medium block mb-2">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 hover:scale-110 transition-transform"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "text-accent fill-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium block mb-2">Comment (optional)</label>
              <Textarea
                placeholder="Tell us about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReview} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
