import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Zap, MapPin, Loader2 } from "lucide-react";
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

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

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
    if (user?.address && !address) {
      setAddress(user.address);
    }
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
      toast({
        title: "Estimate Applied",
        description: `Estimated total: ₹${prefill.estimateAmount.toLocaleString("en-IN")}`,
      });
    }

    localStorage.removeItem("cleanmate_estimator_prefill");
  }, [location.state]);

  const fetchLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) {
        toast({ title: "Error", description: "Geolocation is not supported by your browser", variant: "destructive" });
      }
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
          if (!silent) {
            toast({ title: "📍 Location Updated", description: "Your current address has been fetched." });
          }
        } catch (error: any) {
          console.error("Reverse geocoding error:", error);
          const message = error.response?.data?.message || error.message || "Unknown error";
          if (!silent) {
            toast({
              title: "Geolocation Error",
              description: `${message}. Please enter your address manually if this persists.`,
              variant: "destructive"
            });
          }
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);
        if (silent) return;

        const errorMessage =
          error.code === error.PERMISSION_DENIED
            ? "Location access was denied. Please allow location permission."
            : error.code === error.POSITION_UNAVAILABLE
              ? "Your location is currently unavailable. Try again in a moment."
              : error.code === error.TIMEOUT
                ? "Location request timed out. Please retry."
                : "Please enable location permissions";

        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (!user) return;
    if (address) return;
    if (user.address) return;
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
      estimateMeta: {
        area,
        areaUnit,
        bedrooms,
        bathrooms,
        livingRooms,
        includeKitchen,
      },
    };

    localStorage.setItem("cleanmate_pending_booking", JSON.stringify(bookingDraft));
    navigate("/customer/payment", { state: { bookingDraft } });
  };

  return (
    <div className="page-container animate-fade-in p-8 space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-display font-bold text-[#1a2e1a]">Book a Professional Service</h2>
        <p className="text-sm text-[#1a2e1a]/40 font-medium">Customized cleaning solutions for every space</p>
      </div>

      <div className="max-w-3xl">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 md:p-12 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#97BC62]/10 rounded-bl-[4rem]" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold ml-1">Service Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-12 rounded-xl focus:ring-[#1a2e1a] capitalize font-semibold text-[#1a2e1a]">
                  <SelectValue placeholder="What needs cleaning?" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-xl">
                  <SelectItem value="House Cleaning" className="focus:bg-[#97BC62]/10 focus:text-[#1a2e1a]">🏠 House Cleaning</SelectItem>
                  <SelectItem value="Office Cleaning" className="focus:bg-[#97BC62]/10 focus:text-[#1a2e1a]">🏢 Office Cleaning</SelectItem>
                  <SelectItem value="Commercial Cleaning" className="focus:bg-[#97BC62]/10 focus:text-[#1a2e1a]">🏭 Commercial Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold ml-1">Service Intensity</Label>
              <Select value={variant} onValueChange={setVariant}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-12 rounded-xl focus:ring-[#1a2e1a] font-semibold text-[#1a2e1a]">
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-xl">
                  <SelectItem value="Standard" className="focus:bg-[#97BC62]/10">Standard Clean</SelectItem>
                  <SelectItem value="Deep Cleaning" className="focus:bg-[#1a2e1a] focus:text-white">Deep Sanitization</SelectItem>
                  <SelectItem value="Emergency" className="focus:bg-amber-100 focus:text-amber-800">Swift Response</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold ml-1">Home Size / Area</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 1200"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="bg-slate-50 border-slate-200 h-12 rounded-xl focus:ring-[#1a2e1a] font-semibold text-[#1a2e1a]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold ml-1">Area Unit</Label>
              <Select value={areaUnit} onValueChange={(v) => setAreaUnit(v as AreaUnit)}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-12 rounded-xl focus:ring-[#1a2e1a] font-semibold text-[#1a2e1a]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-xl">
                  <SelectItem value="sqft">Square Feet (sq ft)</SelectItem>
                  <SelectItem value="sqm">Square Meters (sq m)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold ml-1">Number of Rooms</Label>
              <Input
                type="number"
                min={0}
                value={bedrooms}
                onChange={(e) => setBedrooms(Math.max(0, Number(e.target.value) || 0))}
                className="bg-slate-50 border-slate-200 h-12 rounded-xl focus:ring-[#1a2e1a] font-semibold text-[#1a2e1a]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold ml-1">Number of Bathrooms</Label>
              <Input
                type="number"
                min={0}
                value={bathrooms}
                onChange={(e) => setBathrooms(Math.max(0, Number(e.target.value) || 0))}
                className="bg-slate-50 border-slate-200 h-12 rounded-xl focus:ring-[#1a2e1a] font-semibold text-[#1a2e1a]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold ml-1">Living Rooms / Halls</Label>
              <Input
                type="number"
                min={0}
                value={livingRooms}
                onChange={(e) => setLivingRooms(Math.max(0, Number(e.target.value) || 0))}
                className="bg-slate-50 border-slate-200 h-12 rounded-xl focus:ring-[#1a2e1a] font-semibold text-[#1a2e1a]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold ml-1">Include Kitchen</Label>
              <div className="h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1a2e1a]">Kitchen Cleaning</span>
                <Switch checked={includeKitchen} onCheckedChange={setIncludeKitchen} />
              </div>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <Label className="text-[#1a2e1a] font-bold ml-1">Preferred Date</Label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              min={new Date().toISOString().split('T')[0]} 
              className="bg-slate-50 border-slate-200 h-12 rounded-xl focus:ring-[#1a2e1a] font-semibold text-[#1a2e1a]"
            />
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between mb-1">
                <Label className="text-[#1a2e1a] font-bold ml-1">Service Address</Label>
                <Button 
                    variant="ghost" 
                    size="sm" 
                  type="button"
                    className="h-8 text-[11px] font-black uppercase tracking-wider text-[#97BC62] hover:text-[#1a2e1a] hover:bg-[#97BC62]/10 rounded-full"
                    onClick={() => fetchLocation()}
                    disabled={isFetchingLocation}
                >
                    {isFetchingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                    Detect Location
                </Button>
            </div>
            <Input 
              placeholder="Where should we clean?" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              className="bg-slate-50 border-slate-200 h-12 rounded-xl focus:ring-[#1a2e1a] font-semibold text-[#1a2e1a]"
            />
          </div>

          <div className={`group relative flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300 ${emergency ? "border-amber-400 bg-amber-50" : "border-slate-100 bg-slate-50/50 hover:border-[#97BC62]/30"}`}>
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${emergency ? "bg-amber-400 text-white" : "bg-white text-slate-300 group-hover:text-[#97BC62]"}`}>
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className={`text-sm font-black uppercase tracking-tight ${emergency ? "text-amber-800" : "text-[#1a2e1a]"}`}>Emergency Priority</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Instant scheduling for urgent needs</p>
              </div>
            </div>
            <Switch 
              checked={emergency} 
              onCheckedChange={setEmergency} 
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          <div className="relative z-10 rounded-2xl bg-[#1a2e1a] text-white p-5 border border-[#97BC62]/20">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#97BC62]">Estimated Cost Preview</p>
            {hasArea ? (
              <>
                <p className="mt-2 text-3xl font-display font-bold">₹{estimatePreview.toLocaleString("en-IN")}</p>
                <p className="mt-1 text-xs text-white/60">Based on area, selected variant, and room configuration.</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-white/50">Enter your area above to see an instant price estimate.</p>
            )}
          </div>

          <Button 
            onClick={handleBook} 
            className="w-full h-14 gap-3 bg-[#1a2e1a] hover:bg-[#2C5F2D] text-white font-black text-lg rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5 text-[#97BC62]" />}
            {isLoading ? "PROCESSING..." : "PROCEED TO PAYMENT"}
          </Button>
        </div>
      </div>
    </div>
  );
}
