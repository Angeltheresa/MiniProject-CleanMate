import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { customerAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ReviewModal } from "@/components/ReviewModal";
import { useNavigate } from "react-router-dom";

interface BookingForReview {
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
}

export default function Reviews() {
  const [bookings, setBookings] = useState<BookingForReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());
  const [selectedBooking, setSelectedBooking] = useState<BookingForReview | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadEligibleBookings = async () => {
    try {
      setLoading(true);
      const res = await customerAPI.getBookings();
      const completed = (res.data as BookingForReview[]).filter((b) => b.status === "completed" && b.agentId);
      setBookings(completed);

      const reviewStatuses = await Promise.all(
        completed.map((b) =>
          customerAPI.getBookingReviewStatus(b._id).catch(() => ({ data: { hasReview: false } }))
        )
      );

      const reviewed = new Set<string>();
      completed.forEach((b, index) => {
        if (reviewStatuses[index]?.data?.hasReview) {
          reviewed.add(b._id);
        }
      });

      setReviewedBookings(reviewed);
    } catch {
      toast({
        title: "Error",
        description: "Unable to load completed bookings for review.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEligibleBookings();
  }, []);

  if (loading) {
    return (
      <div className="page-container animate-fade-in flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const pendingReviews = bookings.filter((b) => !reviewedBookings.has(b._id));

  return (
    <div className="page-container animate-fade-in space-y-6">
      <div>
        <h2 className="page-header">Reviews</h2>
        <p className="text-sm text-muted-foreground">
          You can review an agent only after the service is completed.
        </p>
      </div>

      {pendingReviews.length === 0 ? (
        <div className="bg-card rounded-xl border border-border/60 shadow-soft p-6 text-sm text-muted-foreground">
          You have no pending reviews right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingReviews.map((booking) => (
            <div key={booking._id} className="bg-card rounded-xl border border-border/60 shadow-soft p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{booking.serviceType}</p>
                  <p className="text-xs text-muted-foreground">{booking.variant}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed on {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">
                  Completed
                </span>
              </div>

              <p className="text-sm mt-3">
                Agent: <span className="font-medium">{booking.agentId?.fullName || "Unknown"}</span>
              </p>

              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/customer/agents/${booking.agentId?._id}`)}
                >
                  View Profile
                </Button>
                <Button size="sm" onClick={() => setSelectedBooking(booking)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Leave Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookings.length > 0 && (
        <div className="bg-card rounded-xl border border-border/60 shadow-soft p-6">
          <h3 className="font-semibold text-sm mb-3">Already Reviewed</h3>
          <div className="space-y-2">
            {bookings
              .filter((b) => reviewedBookings.has(b._id))
              .map((booking) => (
                <div key={booking._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{booking.serviceType}</p>
                    <p className="text-xs text-muted-foreground">{booking.agentId?.fullName || "Unknown"}</p>
                  </div>
                  <span className="text-xs text-success flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-success" />
                    Reviewed
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {selectedBooking?.agentId && (
        <ReviewModal
          bookingId={selectedBooking._id}
          agentId={selectedBooking.agentId._id}
          agentName={selectedBooking.agentId.fullName}
          open={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onReviewSubmitted={loadEligibleBookings}
        />
      )}
    </div>
  );
}
