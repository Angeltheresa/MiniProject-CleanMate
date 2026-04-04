import { useState, useEffect } from "react";
import { Star, MapPin, Loader2, ChevronRight, Search, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [bookedAgentId, setBookedAgentId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load booked agent from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cleanmate_selected_agent');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBookedAgentId(parsed.id);
      } catch (e) {}
    }
  }, []);

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
      toast({ title: "Location unavailable", description: "Add your address in profile or allow GPS.", variant: "destructive" });
      fetchAgents(null);
      return;
    }
    try {
      const response = await mapsAPI.geocode(savedAddress);
      const lat = Number(response.data?.lat);
      const lng = Number(response.data?.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) throw new Error("Invalid geocode");
      const next = { lat, lng };
      setCoords(next);
      await fetchAgents(next);
      toast({ title: "Using saved address", description: "Agents shown based on your saved address." });
    } catch {
      toast({ title: "Fallback failed", description: "Could not geocode saved address.", variant: "destructive" });
      fetchAgents(null);
    }
  };

  const detectLocationAndSearch = () => {
    if (!navigator.geolocation) { fallbackToSavedAddress(); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(next);
        setLocating(false);
        fetchAgents(next);
      },
      () => { setLocating(false); fallbackToSavedAddress(); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => { fetchAgents(null); }, []);
  useEffect(() => { fetchAgents(); }, [distance, minRating]);

  const sorted = [...agents]
    .filter(a => !searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.specialization?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
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

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
    ));

  if (loading) {
    return (
      <div className="page-container animate-fade-in flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-[#1a2e1a]/5 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a2e1a]" />
        </div>
        <p className="text-sm font-semibold text-[#1a2e1a]/50">Finding agents near you…</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-display font-black text-[#1a2e1a]">Nearby Agents</h2>
            <p className="text-sm text-[#1a2e1a]/50 mt-1 font-medium">
              {coords
                ? `📍 Showing results near (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`
                : "Browse available cleaning professionals in your area"}
            </p>
          </div>
          <Button
            onClick={detectLocationAndSearch}
            disabled={locating}
            className="bg-[#1a2e1a] hover:bg-[#2C5F2D] text-white rounded-xl h-10 px-5 font-bold shadow-lg"
          >
            {locating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
            {locating ? "Locating…" : "Use My Location"}
          </Button>
        </div>

        {/* Booked Agent Banner */}
        {bookedAgentId && (
          <div className="mt-4 flex items-center gap-3 p-4 rounded-2xl bg-[#97BC62]/10 border border-[#97BC62]/30">
            <CheckCircle2 className="h-5 w-5 text-[#2C5F2D] shrink-0" />
            <p className="text-sm font-bold text-[#1a2e1a]">
              You have a selected agent — shown with a green glow below. Click any other agent to change your selection.
            </p>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-xl px-3 h-10">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search agents or skills…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0 font-medium"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <Select value={distance} onValueChange={setDistance}>
            <SelectTrigger className="w-36 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm font-semibold">
              <SelectValue placeholder="Radius" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Within 5 km</SelectItem>
              <SelectItem value="10">Within 10 km</SelectItem>
              <SelectItem value="20">Within 20 km</SelectItem>
              <SelectItem value="50">Within 50 km</SelectItem>
            </SelectContent>
          </Select>
          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger className="w-36 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm font-semibold">
              <SelectValue placeholder="Min rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All ratings</SelectItem>
              <SelectItem value="3">3.0+ ★</SelectItem>
              <SelectItem value="4">4.0+ ★</SelectItem>
              <SelectItem value="4.5">4.5+ ★</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance-rating">Nearest + Rating</SelectItem>
              <SelectItem value="rating">Best Rated</SelectItem>
              <SelectItem value="jobs">Most Jobs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Agent Count */}
      <p className="text-xs font-black uppercase tracking-widest text-[#1a2e1a]/40 mb-4">
        {sorted.length} Agent{sorted.length !== 1 ? "s" : ""} Found
      </p>

      {/* Agent Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
            <MapPin className="h-7 w-7 text-slate-300" />
          </div>
          <p className="font-bold text-[#1a2e1a]/50">No agents match your search</p>
          <p className="text-sm text-[#1a2e1a]/30">Try adjusting filters or expanding the radius</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((agent) => {
            const isBooked = bookedAgentId === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-200 group ${
                  isBooked
                    ? "bg-[#97BC62]/8 border-2 border-[#2C5F2D] shadow-[0_0_20px_rgba(44,95,45,0.15)]"
                    : "bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-[#97BC62]/40"
                }`}
              >
                {/* Selected Badge */}
                {isBooked && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#2C5F2D] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    Selected
                  </div>
                )}

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl shrink-0 ${
                    isBooked ? "bg-[#2C5F2D]/10 text-[#2C5F2D]" : "bg-[#1a2e1a]/5 text-[#1a2e1a]"
                  }`}>
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base leading-tight truncate transition-colors ${
                      isBooked ? "text-[#2C5F2D]" : "text-[#1a2e1a] group-hover:text-[#2C5F2D]"
                    }`}>{agent.name}</p>
                    <p className="text-xs text-[#1a2e1a]/50 font-medium truncate mt-0.5">{agent.specialization || "Cleaning Specialist"}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {renderStars(agent.rating)}
                      <span className="text-xs font-bold text-[#1a2e1a]/60 ml-1">{agent.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-[#1a2e1a]/50 font-semibold">
                    <span>{agent.completedJobs} jobs</span>
                    {typeof agent.distanceKm === "number" && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-200 inline-block" />
                        <span>{agent.distanceKm.toFixed(1)} km</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      agent.available ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                    }`}>
                      {agent.available ? "Available" : "Busy"}
                    </span>
                    <ChevronRight className={`h-4 w-4 transition-colors ${isBooked ? "text-[#2C5F2D]" : "text-slate-300 group-hover:text-[#2C5F2D]"}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AgentProfileModal
        agentId={selectedAgentId}
        open={!!selectedAgentId}
        onClose={() => {
          setSelectedAgentId(null);
          // Refresh booked agent state
          const saved = localStorage.getItem('cleanmate_selected_agent');
          if (saved) {
            try { setBookedAgentId(JSON.parse(saved).id); } catch (e) {}
          }
        }}
      />
    </div>
  );
}
