import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type AreaUnit = "sqft" | "sqm";
type CleaningType = "basic" | "deep" | "move" | "post";
type Frequency = "one-time" | "weekly" | "monthly";

const EXTRA_SERVICES: Array<{ key: string; label: string; charge: number }> = [
  { key: "sofa", label: "Sofa cleaning", charge: 700 },
  { key: "carpet", label: "Carpet cleaning", charge: 600 },
  { key: "window", label: "Window cleaning", charge: 500 },
  { key: "refrigerator", label: "Refrigerator cleaning", charge: 450 },
  { key: "balcony", label: "Balcony cleaning", charge: 400 },
];

const CLEANING_RATE_PER_SQFT: Record<CleaningType, number> = {
  basic: 18,
  deep: 25,
  move: 28,
  post: 32,
};

const FREQUENCY_MULTIPLIER: Record<Frequency, number> = {
  "one-time": 1,
  weekly: 0.9,
  monthly: 0.95,
};

const CLEANING_LABEL: Record<CleaningType, string> = {
  basic: "Basic Cleaning",
  deep: "Deep Cleaning",
  move: "Move-in / Move-out Cleaning",
  post: "Post Construction Cleaning",
};

const FREQUENCY_LABEL: Record<Frequency, string> = {
  "one-time": "One-time cleaning",
  weekly: "Weekly cleaning",
  monthly: "Monthly cleaning",
};

export default function CostEstimator() {
  const navigate = useNavigate();
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqft");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [livingRooms, setLivingRooms] = useState(1);
  const [includeKitchen, setIncludeKitchen] = useState(true);
  const [cleaningType, setCleaningType] = useState<CleaningType>("basic");
  const [frequency, setFrequency] = useState<Frequency>("one-time");
  const [extraServices, setExtraServices] = useState<string[]>([]);

  const totals = useMemo(() => {
    const areaValue = Math.max(Number(area) || 0, 0);
    const areaInSqft = areaUnit === "sqm" ? areaValue * 10.7639 : areaValue;

    const rate = CLEANING_RATE_PER_SQFT[cleaningType];
    const areaCharge = areaInSqft * rate;
    const roomCharge = bedrooms * 700 + bathrooms * 500 + livingRooms * 450 + (includeKitchen ? 600 : 0);
    const extraCharge = EXTRA_SERVICES.filter((item) => extraServices.includes(item.key)).reduce(
      (sum, item) => sum + item.charge,
      0
    );
    const baseTotal = areaCharge + roomCharge + extraCharge;
    const multiplier = FREQUENCY_MULTIPLIER[frequency];
    const finalTotal = Math.round(baseTotal * multiplier);

    return {
      areaInSqft,
      rate,
      areaCharge,
      roomCharge,
      extraCharge,
      baseTotal,
      multiplier,
      finalTotal,
    };
  }, [area, areaUnit, bedrooms, bathrooms, livingRooms, includeKitchen, cleaningType, extraServices, frequency]);

  const toggleExtraService = (serviceKey: string, checked: boolean) => {
    setExtraServices((prev) =>
      checked ? [...prev, serviceKey] : prev.filter((key) => key !== serviceKey)
    );
  };

  const mapEstimatorToBooking = () => {
    const isPostConstruction = cleaningType === "post";
    const isDeep = cleaningType === "deep" || cleaningType === "move" || cleaningType === "post";

    return {
      category: isPostConstruction ? "Commercial Cleaning" : "House Cleaning",
      variant: isDeep ? "Deep Cleaning" : "Standard",
      emergency: false,
      estimateAmount: totals.finalTotal,
      estimateMeta: {
        area,
        areaUnit,
        bedrooms,
        bathrooms,
        livingRooms,
        includeKitchen,
        cleaningType,
        frequency,
        extraServices,
      },
    };
  };

  const handleBookNow = () => {
    const payload = mapEstimatorToBooking();
    localStorage.setItem("cleanmate_estimator_prefill", JSON.stringify(payload));
    navigate("/customer/book", { state: { estimatorPrefill: payload } });
  };

  return (
    <div className="page-container animate-fade-in p-8 space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-display font-bold text-[#1a2e1a]">Cost Estimator</h2>
        <p className="text-sm text-[#1a2e1a]/40 font-medium">Instant estimate based on space, rooms, add-ons, and cleaning plan.</p>
      </div>

      <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold">Home Size / Area</Label>
              <Input
                type="number"
                min={0}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Enter total area"
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold">Area Unit</Label>
              <Select value={areaUnit} onValueChange={(v) => setAreaUnit(v as AreaUnit)}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqft">Square Feet (sq ft)</SelectItem>
                  <SelectItem value="sqm">Square Meters (sq m)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold">Number of Rooms</Label>
              <Input type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(Math.max(0, Number(e.target.value) || 0))} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold">Number of Bathrooms</Label>
              <Input type="number" min={0} value={bathrooms} onChange={(e) => setBathrooms(Math.max(0, Number(e.target.value) || 0))} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold">Living Rooms / Halls</Label>
              <Input type="number" min={0} value={livingRooms} onChange={(e) => setLivingRooms(Math.max(0, Number(e.target.value) || 0))} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
            </div>

            <div className="flex items-end">
              <label className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 h-11 cursor-pointer">
                <Checkbox checked={includeKitchen} onCheckedChange={(checked) => setIncludeKitchen(Boolean(checked))} />
                <span className="text-sm font-semibold text-[#1a2e1a]">Include Kitchen Cleaning</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold">Cleaning Type</Label>
              <Select value={cleaningType} onValueChange={(v) => setCleaningType(v as CleaningType)}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Cleaning</SelectItem>
                  <SelectItem value="deep">Deep Cleaning</SelectItem>
                  <SelectItem value="move">Move-in / Move-out Cleaning</SelectItem>
                  <SelectItem value="post">Post Construction Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold">Cleaning Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time cleaning</SelectItem>
                  <SelectItem value="weekly">Weekly cleaning</SelectItem>
                  <SelectItem value="monthly">Monthly cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[#1a2e1a] font-bold">Additional Services</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXTRA_SERVICES.map((service) => (
                <label key={service.key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={extraServices.includes(service.key)}
                      onCheckedChange={(checked) => toggleExtraService(service.key, Boolean(checked))}
                    />
                    <span className="text-sm font-semibold text-[#1a2e1a]">{service.label}</span>
                  </div>
                  <span className="text-xs font-black text-[#1a2e1a]/60">+₹{service.charge}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#1a2e1a] rounded-[2rem] border border-[#97BC62]/20 shadow-2xl p-6 space-y-5 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#97BC62]/20 flex items-center justify-center">
              <Calculator className="h-5 w-5 text-[#97BC62]" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-[#97BC62]">Estimated Cost</p>
              <p className="text-xs text-white/50">Instantly updated</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-white/80">
              <span>Area Charge ({totals.areaInSqft.toFixed(0)} sq ft × ₹{totals.rate})</span>
              <span>₹{Math.round(totals.areaCharge).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Room + Bath + Hall + Kitchen</span>
              <span>₹{totals.roomCharge.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Additional Services</span>
              <span>₹{totals.extraCharge.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Frequency Multiplier</span>
              <span>×{totals.multiplier}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex justify-between font-black text-lg">
              <span>Total Price</span>
              <span className="text-[#97BC62]">₹{totals.finalTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-white/70 leading-relaxed">
            Formula: (Area × Rate per sq ft) + Room Charges + Extra Service Charges, then frequency adjustment.
          </div>

          <div className="rounded-xl bg-[#97BC62]/10 border border-[#97BC62]/25 p-3">
            <p className="text-xs text-[#97BC62] font-black uppercase tracking-wider">Selected Plan</p>
            <p className="text-sm font-semibold mt-1">{CLEANING_LABEL[cleaningType]}</p>
            <p className="text-xs text-white/60 mt-1">{FREQUENCY_LABEL[frequency]}</p>
          </div>

          <Button
            type="button"
            onClick={handleBookNow}
            className="w-full h-12 rounded-xl bg-[#97BC62] hover:bg-[#a9cf74] text-[#1a2e1a] font-black uppercase tracking-wide"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Book Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
