import { useState, useEffect } from "react";
import { Star, MapPin, Loader2, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { customerAPI, mapsAPI } from "@/lib/api";
import { Agent } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AgentProfileModal } from "@/components/AgentProfileModal";

export default function NearbyAgents() {
  const [sort, setSort] = useState("distance-rating");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [distance, setDistance] = useState("10");
  const [minRating, setMinRating] = useState("0");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAgents = async (nextCoords?: { lat: number; lng: number } | null) => {
    setLoading(true);
    try {
      const activeCoords = nextCoords === undefined ? coords : nextCoords;
      const response = await customerAPI.getNearbyAgents({
        lat: activeCoords?.lat,
        lng: activeCoords?.lng,
        distance: Number(distance) * 1000,
        minRating: Number(minRating),
      });

      const payload = Array.isArray(response.data) ? response.data : response.data?.agents || [];
      setAgents(payload);
    } catch {
      toast({ title: "Error", description: "Unable to fetch nearby agents.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fallbackToSavedAddress = async () => {
    const savedAddress = user?.address?.trim();
    if (!savedAddress) {
      toast({
        title: "Location unavailable",
        description: "Add your address in profile or allow GPS to find nearby agents.",
        variant: "destructive",
      });
      fetchAgents(null);
      return;
    }

    try {
      const response = await mapsAPI.geocode(savedAddress);
      const lat = Number(response.data?.lat);
      const lng = Number(response.data?.lng);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new Error("Invalid geocode result");
      }

      const next = { lat, lng };
      setCoords(next);
      await fetchAgents(next);
      toast({
        title: "Using saved address",
        description: "Nearby agents are shown based on your saved profile address.",
      });
    } catch {
      toast({
        title: "Location fallback failed",
        description: "Could not geocode saved address. Please update your address and retry.",
        variant: "destructive",
      });
      fetchAgents(null);
    }
  };

  const detectLocationAndSearch = () => {
    if (!navigator.geolocation) {
      fallbackToSavedAddress();
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(next);
        setLocating(false);
        fetchAgents(next);
      },
      () => {
        setLocating(false);
        fallbackToSavedAddress();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fetchAgents(null);
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [distance, minRating]);

  const sorted = [...agents].sort((a, b) => {
    if (sort === "distance-rating") {
      const aDist = typeof a.distanceKm === "number" ? a.distanceKm : Number.MAX_SAFE_INTEGER;
      const bDist = typeof b.distanceKm === "number" ? b.distanceKm : Number.MAX_SAFE_INTEGER;

      if (Math.abs(aDist - bDist) > 0.75) return aDist - bDist;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.completedJobs - a.completedJobs;
    }

    if (sort === "rating") return b.rating - a.rating;
    return b.completedJobs - a.completedJobs;
  });

  if (loading) {
    return <div className="page-container animate-fade-in flex items-center justify-center py-20">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="page-header">Nearby Agents</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={detectLocationAndSearch} disabled={locating}>
            {locating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
            Use My Location
          </Button>
          <Select value={distance} onValueChange={setDistance}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Radius" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Within 5 km</SelectItem>
              <SelectItem value="10">Within 10 km</SelectItem>
              <SelectItem value="20">Within 20 km</SelectItem>
              <SelectItem value="50">Within 50 km</SelectItem>
            </SelectContent>
          </Select>
          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Min rating" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All ratings</SelectItem>
              <SelectItem value="3">3.0+ rating</SelectItem>
              <SelectItem value="4">4.0+ rating</SelectItem>
              <SelectItem value="4.5">4.5+ rating</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="distance-rating">Nearest + Rating</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="jobs">Completed Jobs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-5">
        {coords
          ? `Searching around your location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
          : "Tip: use your location for best nearby results."}
      </p>

      {sorted.length === 0 && <p className="text-muted-foreground text-sm">No agents available at the moment.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((agent) => (
          <div
            key={agent.id}
            className="bg-card rounded-xl border border-border/60 shadow-soft p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
            onClick={() => setSelectedAgentId(agent.id)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                {agent.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.specialization}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${agent.available ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {agent.available ? "Available" : "Busy"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                <span className="font-medium">{agent.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-muted-foreground block">{agent.completedJobs} jobs</span>
                  {typeof agent.distanceKm === "number" && (
                    <span className="text-xs text-muted-foreground">{agent.distanceKm.toFixed(1)} km away</span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <AgentProfileModal
        agentId={selectedAgentId}
        open={!!selectedAgentId}
        onClose={() => setSelectedAgentId(null)}
      />
    </div>
  );
}
