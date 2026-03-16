import { useState, useEffect } from "react";
import { Star, MapPin, Briefcase, Phone, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { customerAPI } from "@/lib/api";
import { AgentProfileDetails, AgentReview } from "@/types";

interface AgentProfileModalProps {
  agentId: string | null;
  open: boolean;
  onClose: () => void;
}

export function AgentProfileModal({ agentId, open, onClose }: AgentProfileModalProps) {
  const [profile, setProfile] = useState<AgentProfileDetails | null>(null);
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (agentId && open) {
      setLoading(true);
      customerAPI.getAgentProfile(agentId)
        .then((res) => {
          setProfile(res.data.profile);
          setReviews(res.data.reviews || []);
        })
        .catch(() => {
          setProfile(null);
          setReviews([]);
        })
        .finally(() => setLoading(false));
    }
  }, [agentId, open]);

  const handlePrevImage = () => {
    if (selectedImageIndex !== null && profile?.portfolioImages) {
      setSelectedImageIndex(
        selectedImageIndex === 0
          ? profile.portfolioImages.length - 1
          : selectedImageIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null && profile?.portfolioImages) {
      setSelectedImageIndex(
        selectedImageIndex === profile.portfolioImages.length - 1
          ? 0
          : selectedImageIndex + 1
      );
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : !profile ? (
            <div className="text-center py-12 text-muted-foreground">
              Agent profile not found.
            </div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-[#97BC62]/10 flex items-center justify-center font-display font-bold text-2xl text-[#1a2e1a]">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      profile.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-bold text-[#1a2e1a]">
                      {profile.name}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      {profile.specialization}
                    </DialogDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        {renderStars(profile.rating)}
                        <span className="text-sm font-medium ml-1">{profile.rating.toFixed(1)}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        profile.available
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {profile.available ? "Available" : "Busy"}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Agent Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#97BC62]/5 border border-[#97BC62]/10">
                    <Briefcase className="h-5 w-5 text-[#1a2e1a]" />
                    <div>
                      <p className="text-xs text-muted-foreground">Completed Jobs</p>
                      <p className="font-bold text-[#1a2e1a]">{profile.completedJobs}</p>
                    </div>
                  </div>
                  {profile.address && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#97BC62]/5 border border-[#97BC62]/10">
                      <MapPin className="h-5 w-5 text-[#1a2e1a]" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-medium text-[#1a2e1a] text-sm truncate max-w-[120px]">{profile.address}</p>
                      </div>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#97BC62]/5 border border-[#97BC62]/10">
                      <Phone className="h-5 w-5 text-[#1a2e1a]" />
                      <div>
                        <p className="text-xs text-muted-foreground">Contact</p>
                        <p className="font-medium text-[#1a2e1a] text-sm">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Portfolio Section */}
                <div>
                  <h3 className="text-sm font-bold text-[#1a2e1a] mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Portfolio
                  </h3>
                  {profile.portfolioImages && profile.portfolioImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {profile.portfolioImages.map((img, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-border"
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={img}
                            alt={`Portfolio ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No portfolio images uploaded yet.
                    </p>
                  )}
                </div>

                {/* Reviews Section */}
                <div>
                  <h3 className="text-sm font-bold text-[#1a2e1a] mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Customer Reviews ({reviews.length})
                  </h3>
                  {reviews.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-4 rounded-lg bg-white border border-border/60 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-[#1a2e1a]/10 flex items-center justify-center text-sm font-bold text-[#1a2e1a]">
                                {review.customerAvatar ? (
                                  <img src={review.customerAvatar} alt={review.customerName} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                  review.customerName.charAt(0)
                                )}
                              </div>
                              <span className="text-sm font-medium">{review.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No reviews yet. Be the first to review!
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {selectedImageIndex !== null && profile?.portfolioImages && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={handlePrevImage}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>

          <img
            src={profile.portfolioImages[selectedImageIndex]}
            alt={`Portfolio ${selectedImageIndex + 1}`}
            className="max-h-[80vh] max-w-[80vw] object-contain"
          />

          <button
            onClick={handleNextImage}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="h-12 w-12" />
          </button>

          <div className="absolute bottom-4 text-white text-sm">
            {selectedImageIndex + 1} / {profile.portfolioImages.length}
          </div>
        </div>
      )}
    </>
  );
}
