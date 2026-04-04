import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Zap, MapPin, Loader2, Star, UserSquare2, RefreshCw, Calendar, Home, Building, Factory } from "lucide-react";
import { customerAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

type AreaUnit = "sqft" | "sqm";

const RATE_PER_SQFT: Record<string, number> = {
  Standard: 18,
  "Deep Cleaning": 25,
  Emergency: 35,
};

interface EstimatorPrefill {
  category?: string;
  variant?: string;
  emergency?: boolean;
  estimateAmount?: number;
  estimateMeta?: {
    area?: string;
    areaUnit?: AreaUnit;
    bedrooms?: number;
    bathrooms?: number;
    livingRooms?: number;
    includeKitchen?: boolean;
  };
}

export default function BookService() {
  const [category, setCategory] = useState("");
  const [variant, setVariant] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqft");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [livingRooms, setLivingRooms] = useState(1);
  const [includeKitchen, setIncludeKitchen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedAgent, setSelectedAgent] = useState<{ id: string; name: string; avatar: string; rating: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cleanmate_selected_agent");
    if (saved) {
      try { setSelectedAgent(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleChangeAgent = () => {
    localStorage.removeItem("cleanmate_selected_agent");
    navigate("/customer/agents");
  };

  const hasArea = Number(area) > 0;

  const estimatePreview = useMemo(() => {
    const areaValue = Math.max(Number(area) || 0, 0);
    if (areaValue === 0) return 0;
    const areaInSqft = areaUnit === "sqm" ? areaValue * 10.7639 : areaValue;
    const rate = RATE_PER_SQFT[variant] || 18;
    const areaCharge = areaInSqft * rate;
    const roomCharge = bedrooms * 700 + bathrooms * 500 + livingRooms * 450 + (includeKitchen ? 600 : 0);
    return Math.round(areaCharge + roomCharge);
  }, [area, areaUnit, variant, bedrooms, bathrooms, livingRooms, includeKitchen]);

  useEffect(() => {
    if (user?.address && !address) setAddress(user.address);
  }, [user?.address, address]);

  useEffect(() => {
    const statePrefill = (location.state as any)?.estimatorPrefill as EstimatorPrefill | undefined;
    const storageRaw = localStorage.getItem("cleanmate_estimator_prefill");
    const storagePrefill = storageRaw ? (JSON.parse(storageRaw) as EstimatorPrefill) : undefined;
    const prefill = statePrefill || storagePrefill;
    if (!prefill) return;
    if (prefill.category) setCategory(prefill.category);
    if (prefill.variant) setVariant(prefill.variant);
    if (typeof prefill.emergency === "boolean") setEmergency(prefill.emergency);
    if (prefill.estimateMeta) {
      if (prefill.estimateMeta.area) setArea(prefill.estimateMeta.area);
      if (prefill.estimateMeta.areaUnit) setAreaUnit(prefill.estimateMeta.areaUnit);
      if (typeof prefill.estimateMeta.bedrooms === "number") setBedrooms(prefill.estimateMeta.bedrooms);
      if (typeof prefill.estimateMeta.bathrooms === "number") setBathrooms(prefill.estimateMeta.bathrooms);
      if (typeof prefill.estimateMeta.livingRooms === "number") setLivingRooms(prefill.estimateMeta.livingRooms);
      if (typeof prefill.estimateMeta.includeKitchen === "boolean") setIncludeKitchen(prefill.estimateMeta.includeKitchen);
    }
    if (prefill.estimateAmount) {
      toast({ title: "Estimate Applied", description: `Estimated total: ₹${prefill.estimateAmount.toLocaleString("en-IN")}` });
    }
    localStorage.removeItem("cleanmate_estimator_prefill");
  }, [location.state]);

  const fetchLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) toast({ title: "Error", description: "Geolocation not supported", variant: "destructive" });
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords;
          const res = await customerAPI.reverseGeocode(lat, lng);
          const formattedAddress = res.data?.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setAddress(formattedAddress);
          if (!silent) toast({ title: "📍 Location Updated", description: "Your current address has been fetched." });
        } catch (error: any) {
          if (!silent) toast({ title: "Geolocation Error", description: error.message || "Unknown error", variant: "destructive" });
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);
        if (silent) return;
        const msg =
          error.code === error.PERMISSION_DENIED ? "Location access denied." :
          error.code === error.POSITION_UNAVAILABLE ? "Location unavailable." :
          "Location request timed out.";
        toast({ title: "Error", description: msg, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!user || address || user.address) return;
    fetchLocation(true);
  }, [user, address]);

  const handleBook = async () => {
    if (!category || !variant) {
      toast({ title: "Error", description: "Please select a service and variant", variant: "destructive" });
      return;
    }
    if (!date) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }
    const bookingDraft = {
      serviceType: category,
      variant,
      date,
      isEmergency: emergency,
      address: address || user?.address,
      estimateAmount: estimatePreview,
      agentId: selectedAgent?.id,
      estimateMeta: { area, areaUnit, bedrooms, bathrooms, livingRooms, includeKitchen },
    };
    localStorage.setItem("cleanmate_pending_booking", JSON.stringify(bookingDraft));
    navigate("/customer/payment", { state: { bookingDraft } });
  };

  // Gate: no agent selected
  if (!selectedAgent) {
    return (
      <div className="page-container animate-fade-in p-8 flex flex-col items-center justify-center min-h-[75vh] text-center gap-6">
        <div className="relative">
          <div className="h-28 w-28 rounded-3xl bg-amber-50 border-2 border-amber-100 flex items-center justify-center shadow-lg">
            <UserSquare2 className="h-12 w-12 text-amber-400" />
          </div>
          <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
            <span className="text-white text-xs font-black">!</span>
          </div>
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-3xl font-display font-black text-[#1a2e1a]">Select an Agent First</h2>
          <p className="text-[#1a2e1a]/55 text-base leading-relaxed">
            For your safety and trust, you need to choose a specific cleaning professional before making a booking. Browse our verified agents to get started.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate("/customer/agents")}
            className="bg-[#1a2e1a] hover:bg-[#2C5F2D] text-white rounded-2xl h-13 px-10 font-bold shadow-xl shadow-[#1a2e1a]/10 hover:scale-105 transition-all"
          >
            <MapPin className="h-4 w-4 mr-2" /> Browse Nearby Agents
          </Button>
        </div>
        <p className="text-xs text-[#1a2e1a]/30 font-semibold">Booking is disabled until an agent is selected</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in p-6 md:p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-display font-black text-[#1a2e1a]">Book a Service</h2>
        <p className="text-sm text-[#1a2e1a]/40 mt-1 font-medium">Fill in the details below to confirm your booking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Main Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Selected Agent Card */}
          <div className="bg-white rounded-2xl border-2 border-[#2C5F2D]/20 shadow-sm p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2e1a]/40 mb-3">Your Selected Agent</p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[#1a2e1a]/5 flex items-center justify-center shrink-0 text-2xl font-black text-[#1a2e1a] overflow-hidden border border-white shadow">
                  {selectedAgent.avatar
                    ? <img src={selectedAgent.avatar} alt={selectedAgent.name} className="h-full w-full object-cover" />
                    : selectedAgent.name.charAt(0)
                  }
                </div>
                <div>
                  <p className="font-black text-[#1a2e1a] text-lg leading-none">{selectedAgent.name}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(selectedAgent.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                    ))}
                    <span className="text-xs font-bold text-[#1a2e1a]/50 ml-1">{selectedAgent.rating?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" onClick={handleChangeAgent} className="text-[#1a2e1a]/50 hover:text-[#1a2e1a] hover:bg-slate-100 rounded-xl text-xs font-bold h-9 px-3">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Change
              </Button>
            </div>
          </div>

          {/* Service Selection */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2e1a]/40">Service Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#1a2e1a] font-bold text-sm">Service Category</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: "House Cleaning", label: "House Cleaning", icon: Home },
                    { value: "Office Cleaning", label: "Office Cleaning", icon: Building },
                    { value: "Commercial Cleaning", label: "Commercial", icon: Factory },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCategory(value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all font-semibold text-sm ${
                        category === value
                          ? "border-[#1a2e1a] bg-[#1a2e1a] text-white"
                          : "border-slate-100 bg-slate-50 text-[#1a2e1a] hover:border-[#97BC62]/50"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#1a2e1a] font-bold text-sm">Service Intensity</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: "Standard", label: "Standard Clean", desc: "Regular maintenance", price: "₹18/sqft" },
                    { value: "Deep Cleaning", label: "Deep Sanitization", desc: "Thorough deep clean", price: "₹25/sqft" },
                    { value: "Emergency", label: "Swift Response", desc: "Same-day urgent", price: "₹35/sqft" },
                  ].map(({ value, label, desc, price }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setVariant(value)}
                      className={`flex items-start justify-between p-3 rounded-xl border-2 text-left transition-all ${
                        variant === value
                          ? "border-[#1a2e1a] bg-[#1a2e1a] text-white"
                          : "border-slate-100 bg-slate-50 text-[#1a2e1a] hover:border-[#97BC62]/50"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-sm">{label}</p>
                        <p className={`text-xs mt-0.5 ${variant === value ? "text-white/60" : "text-[#1a2e1a]/40"}`}>{desc}</p>
                      </div>
                      <span className={`text-xs font-black mt-0.5 ${variant === value ? "text-[#97BC62]" : "text-[#1a2e1a]/40"}`}>{price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Area & Rooms */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2e1a]/40">Property Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[#1a2e1a] font-bold text-sm">Area</Label>
                <Input type="number" min={0} placeholder="e.g. 1200" value={area} onChange={(e) => setArea(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl font-semibold text-[#1a2e1a]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#1a2e1a] font-bold text-sm">Unit</Label>
                <Select value={areaUnit} onValueChange={(v) => setAreaUnit(v as AreaUnit)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl font-semibold text-[#1a2e1a]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sqft">sq ft</SelectItem>
                    <SelectItem value="sqm">sq m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#1a2e1a] font-bold text-sm">Bedrooms</Label>
                <Input type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(Math.max(0, Number(e.target.value)))} className="bg-slate-50 border-slate-200 h-11 rounded-xl font-semibold text-[#1a2e1a]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#1a2e1a] font-bold text-sm">Bathrooms</Label>
                <Input type="number" min={0} value={bathrooms} onChange={(e) => setBathrooms(Math.max(0, Number(e.target.value)))} className="bg-slate-50 border-slate-200 h-11 rounded-xl font-semibold text-[#1a2e1a]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#1a2e1a] font-bold text-sm">Living Rooms</Label>
                <Input type="number" min={0} value={livingRooms} onChange={(e) => setLivingRooms(Math.max(0, Number(e.target.value)))} className="bg-slate-50 border-slate-200 h-11 rounded-xl font-semibold text-[#1a2e1a]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#1a2e1a] font-bold text-sm">Kitchen</Label>
                <div className="h-11 rounded-xl bg-slate-50 border border-slate-200 px-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1a2e1a]">Include</span>
                  <Switch checked={includeKitchen} onCheckedChange={setIncludeKitchen} />
                </div>
              </div>
            </div>
          </div>

          {/* Date & Address */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2e1a]/40">Schedule</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[#1a2e1a] font-bold text-sm flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Preferred Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="bg-slate-50 border-slate-200 h-11 rounded-xl font-semibold text-[#1a2e1a]" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[#1a2e1a] font-bold text-sm flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Service Address</Label>
                  <Button variant="ghost" size="sm" type="button" onClick={() => fetchLocation()} disabled={isFetchingLocation} className="h-7 text-[10px] font-black text-[#97BC62] hover:text-[#1a2e1a]">
                    {isFetchingLocation ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null} Detect
                  </Button>
                </div>
                <Input placeholder="Where should we clean?" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl font-semibold text-[#1a2e1a]" />
              </div>
            </div>

            {/* Emergency Toggle */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${emergency ? "border-amber-400 bg-amber-50" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${emergency ? "bg-amber-400 text-white" : "bg-white text-slate-300"}`}>
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className={`text-sm font-black ${emergency ? "text-amber-800" : "text-[#1a2e1a]"}`}>Emergency Priority</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Instant scheduling for urgent needs</p>
                </div>
              </div>
              <Switch checked={emergency} onCheckedChange={setEmergency} className="data-[state=checked]:bg-amber-500" />
            </div>
          </div>
        </div>

        {/* RIGHT: Summary Sidebar */}
        <div className="space-y-4">
          {/* Cost Estimate */}
          <div className="bg-[#1a2e1a] rounded-2xl p-6 text-white sticky top-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#97BC62] mb-4">Booking Summary</p>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-white/50">Agent</span>
                <span className="font-bold">{selectedAgent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Service</span>
                <span className="font-bold">{category || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Intensity</span>
                <span className="font-bold">{variant || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Date</span>
                <span className="font-bold">{date || "—"}</span>
              </div>
              {emergency && (
                <div className="flex items-center gap-2 bg-amber-500/20 rounded-lg p-2">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-300 text-xs font-bold">Emergency Priority</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 mb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#97BC62] mb-2">Estimated Cost</p>
              {hasArea ? (
                <p className="text-4xl font-display font-black">₹{estimatePreview.toLocaleString("en-IN")}</p>
              ) : (
                <p className="text-white/40 text-sm">Enter area above for an estimate</p>
              )}
            </div>

            <Button
              onClick={handleBook}
              disabled={isLoading}
              className="w-full h-13 bg-[#97BC62] hover:bg-[#8aad55] text-[#1a2e1a] font-black text-base rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
              {isLoading ? "Processing…" : "Confirm Booking"}
            </Button>
            <p className="text-center text-xs text-white/30 mt-3 font-medium">You'll be redirected to payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
