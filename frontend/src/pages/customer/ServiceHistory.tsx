import { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle2, Clock, XCircle, Loader2, AlertCircle, Calendar, Banknote, User } from "lucide-react";
import { customerAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface BookingWithReview {
  _id: string;
  serviceType: string;
  variant: string;
  date: string;
  status: string;
  amount: number;
  agentId?: { _id: string; fullName: string };
  hasReview?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; bg: string; text: string }> = {
  completed:    { label: "Completed",   icon: CheckCircle2, bg: "bg-emerald-50",  text: "text-emerald-700" },
  "in-progress":{ label: "In Progress", icon: Loader2,      bg: "bg-amber-50",    text: "text-amber-700"   },
  pending:      { label: "Pending",     icon: Clock,         bg: "bg-blue-50",     text: "text-blue-700"    },
  approved:     { label: "Approved",    icon: CheckCircle2, bg: "bg-violet-50",   text: "text-violet-700"  },
  rejected:     { label: "Rejected",    icon: XCircle,      bg: "bg-red-50",      text: "text-red-700"     },
};

const RATING_LABELS: Record<number, string> = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };

export default function ServiceHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const { toast } = useToast();

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithReview | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      const res = await customerAPI.getBookings();
      setBookings(res.data);
      const completed = res.data.filter((b: BookingWithReview) => b.status === "completed" && b.agentId);
      const statuses = await Promise.all(
        completed.map((b: BookingWithReview) =>
          customerAPI.getBookingReviewStatus(b._id).catch(() => ({ data: { hasReview: false } }))
        )
      );
      const reviewed = new Set<string>();
      completed.forEach((b: BookingWithReview, i: number) => {
        if (statuses[i]?.data?.hasReview) reviewed.add(b._id);
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
    if (!comment.trim()) {
      toast({ title: "Validation Error", description: "Please write your feedback before submitting.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await customerAPI.submitReview({
        bookingId: selectedBooking._id,
        agentId: selectedBooking.agentId._id,
        rating,
        comment,
      });
      toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
      setReviewedBookings((prev) => new Set(prev).add(selectedBooking._id));
      setReviewModalOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const filters = ["all", "completed", "in-progress", "pending", "rejected"];
  const filtered = activeFilter === "all" ? bookings : bookings.filter(b => b.status === activeFilter);

  if (loading) {
    return (
      <div className="page-container animate-fade-in flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-[#1a2e1a]/5 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a2e1a]" />
        </div>
        <p className="text-sm font-semibold text-[#1a2e1a]/40">Loading your service history…</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-display font-black text-[#1a2e1a]">Service History</h2>
        <p className="text-sm text-[#1a2e1a]/40 mt-1 font-medium">All your past and active bookings in one place</p>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
              activeFilter === f
                ? "bg-[#1a2e1a] text-white border-[#1a2e1a] shadow-sm"
                : "bg-white text-[#1a2e1a]/50 border-slate-200 hover:border-[#97BC62]/50 hover:text-[#1a2e1a]"
            }`}
          >
            {f === "all" ? `All (${bookings.length})` : STATUS_CONFIG[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <AlertCircle className="h-9 w-9 text-slate-300" />
          </div>
          <div>
            <p className="font-black text-[#1a2e1a] text-lg">No bookings found</p>
            <p className="text-sm text-[#1a2e1a]/40 mt-1">
              {activeFilter === "all" ? "You haven't booked any services yet" : `No ${STATUS_CONFIG[activeFilter]?.label || activeFilter} bookings`}
            </p>
          </div>
          {activeFilter === "all" && (
            <Button
              onClick={() => navigate("/customer/agents")}
              className="bg-[#1a2e1a] hover:bg-[#2C5F2D] text-white rounded-xl h-10 px-6 font-bold mt-2"
            >
              Book Your First Service
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG["pending"];
            const StatusIcon = cfg.icon;
            const canReview = b.status === "completed" && b.agentId && !reviewedBookings.has(b._id);
            const hasReviewed = b.status === "completed" && reviewedBookings.has(b._id);

            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-[#97BC62]/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left: Service Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <StatusIcon className={`h-5 w-5 ${cfg.text} ${b.status === "in-progress" ? "animate-spin" : ""}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-black text-[#1a2e1a] text-base leading-tight">{b.serviceType}</p>
                          <p className="text-xs text-[#1a2e1a]/50 font-semibold mt-0.5">{b.variant}</p>
                        </div>
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-black uppercase tracking-wide shrink-0 ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Meta Row */}
                      <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-[#1a2e1a]/40 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {b.agentId?.fullName || "Not assigned"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Banknote className="h-3 w-3" />
                          ₹{b.amount?.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[#1a2e1a]/20">#{b._id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 sm:ml-auto shrink-0 flex-wrap">
                    {b.agentId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/customer/agents/${b.agentId?._id}`)}
                        className="rounded-xl h-9 px-3 text-xs font-bold text-[#1a2e1a]/60 hover:text-[#1a2e1a] hover:bg-slate-100"
                      >
                        View Profile
                      </Button>
                    )}
                    {canReview && (
                      <Button
                        size="sm"
                        onClick={() => openReviewModal(b)}
                        className="rounded-xl h-9 px-4 text-xs font-black bg-[#1a2e1a] hover:bg-[#2C5F2D] text-white"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Leave Review
                      </Button>
                    )}
                    {hasReviewed && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
                        <Star className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
                        <span className="text-xs font-black text-emerald-700">Reviewed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
          {/* Modal Header */}
          <div className="bg-[#1a2e1a] px-7 pt-7 pb-5">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-black">Rate Your Experience</DialogTitle>
              <DialogDescription className="text-white/50 text-sm font-medium mt-1">
                Share feedback for{" "}
                <span className="text-[#97BC62] font-bold">{selectedBooking?.agentId?.fullName || "the agent"}</span>
              </DialogDescription>
            </DialogHeader>

            {/* Service summary in header */}
            {selectedBooking && (
              <div className="mt-4 flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-[#97BC62]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{selectedBooking.serviceType}</p>
                  <p className="text-white/40 text-xs font-medium">{selectedBooking.variant} · {new Date(selectedBooking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-7 space-y-5">
            {/* Star Rating */}
            <div>
              <label className="text-sm font-black text-[#1a2e1a] block mb-3">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="hover:scale-110 transition-transform active:scale-95"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star className={`h-9 w-9 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200 fill-slate-100"
                    }`} />
                  </button>
                ))}
                <span className="ml-2 text-sm font-black text-[#1a2e1a]/50">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-black text-[#1a2e1a] block mb-2">
                Written Feedback <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Describe your experience — what went well, what could be improved…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none rounded-xl border-slate-200 bg-slate-50 focus:ring-[#1a2e1a] font-medium text-sm"
              />
              <p className="text-xs text-[#1a2e1a]/30 mt-1.5 font-medium">Required · min. a few words</p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold border-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={submitReview}
                disabled={submitting || !comment.trim()}
                className="flex-1 h-12 rounded-xl font-black bg-[#1a2e1a] hover:bg-[#2C5F2D] text-white shadow-lg disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting…</>
                ) : (
                  <><Star className="h-4 w-4 mr-2 fill-[#97BC62] text-[#97BC62]" /> Submit Review</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
