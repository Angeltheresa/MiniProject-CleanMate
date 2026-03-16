import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, MapPin, Phone, Briefcase, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { customerAPI } from "@/lib/api";
import { AgentProfileDetails, AgentReview } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function AgentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AgentProfileDetails | null>(null);
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    customerAPI.getAgentProfile(id)
      .then((res) => {
        setProfile(res.data.profile);
        setReviews(res.data.reviews);
      })
      .catch(() => {
        toast({ title: "Error", description: "Unable to load agent profile.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container animate-fade-in flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container animate-fade-in text-center py-20">
        <p className="text-muted-foreground">Agent profile not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.round(rating) ? "text-accent fill-accent" : "text-muted-foreground"}`}
      />
    ));
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Agents
      </Button>

      {/* Profile Header */}
      <div className="bg-card rounded-xl border border-border/60 shadow-soft p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary text-3xl shrink-0">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              profile.name.charAt(0)
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-display font-bold text-foreground">{profile.name}</h1>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${profile.available ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {profile.available ? "Available" : "Busy"}
              </span>
            </div>

            <p className="text-primary font-medium mb-3">{profile.specialization}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                {renderStars(profile.rating)}
                <span className="ml-1 font-medium text-foreground">{profile.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>{profile.completedJobs} jobs completed</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              {profile.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.address}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Book Button */}
          <div className="w-full sm:w-auto">
            <Button
              onClick={() => navigate("/customer/book")}
              className="w-full sm:w-auto"
              disabled={!profile.available}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Book Service
            </Button>
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="bg-card rounded-xl border border-border/60 shadow-soft p-6 mb-6">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Portfolio</h2>

        {profile.portfolioImages.length === 0 ? (
          <p className="text-muted-foreground text-sm">No portfolio images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {profile.portfolioImages.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-border/40"
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={img}
                  alt={`Portfolio ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-card rounded-xl border border-border/60 shadow-soft p-6">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">
          Customer Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary text-sm shrink-0">
                    {review.customerAvatar ? (
                      <img src={review.customerAvatar} alt={review.customerName} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      review.customerName.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{review.customerName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(review.rating)}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={selectedImage}
            alt="Portfolio"
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
