import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { customerAPI } from "@/lib/api";

interface BookingDraft {
  serviceType: string;
  variant: string;
  date: string;
  isEmergency?: boolean;
  address?: string;
  estimateAmount?: number;
}

export default function PaymentGateway() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const stateDraft = (location.state as any)?.bookingDraft as BookingDraft | undefined;
    const storageRaw = localStorage.getItem("cleanmate_pending_booking");
    const storageDraft = storageRaw ? (JSON.parse(storageRaw) as BookingDraft) : undefined;
    const draft = stateDraft || storageDraft || null;

    if (!draft) {
      toast({
        title: "No pending booking",
        description: "Please complete booking details first.",
        variant: "destructive",
      });
      navigate("/customer/book");
      return;
    }

    setBookingDraft(draft);
  }, [location.state, navigate, toast]);

  const payableAmount = useMemo(() => {
    if (!bookingDraft) return 0;
    if (typeof bookingDraft.estimateAmount === "number" && bookingDraft.estimateAmount > 0) {
      return bookingDraft.estimateAmount;
    }

    const base = bookingDraft.variant === "Deep Cleaning" ? 250 : bookingDraft.variant === "Emergency" ? 450 : 150;
    return Math.round(base * (bookingDraft.isEmergency ? 1.5 : 1));
  }, [bookingDraft]);

  const validatePaymentDetails = () => {
    if (paymentMethod === "card") {
      if (!nameOnCard.trim() || cardNumber.replace(/\s/g, "").length < 12 || !expiry.trim() || cvv.length < 3) {
        toast({ title: "Invalid card details", description: "Please enter valid card information.", variant: "destructive" });
        return false;
      }
    }

    if (paymentMethod === "upi" && !upiId.includes("@")) {
      toast({ title: "Invalid UPI", description: "Please enter a valid UPI ID.", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handlePayAndConfirm = async () => {
    if (!bookingDraft) return;
    if (!validatePaymentDetails()) return;

    setIsPaying(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      await customerAPI.createBooking({
        serviceType: bookingDraft.serviceType,
        variant: bookingDraft.variant,
        date: bookingDraft.date,
        isEmergency: bookingDraft.isEmergency,
        address: bookingDraft.address,
        estimateAmount: payableAmount,
      });

      localStorage.removeItem("cleanmate_pending_booking");

      toast({
        title: "Payment successful",
        description: "Booking has been confirmed successfully.",
      });

      navigate("/customer/history");
    } catch (error: any) {
      toast({
        title: "Payment or booking failed",
        description: error.response?.data?.message || "Please retry payment.",
        variant: "destructive",
      });
    } finally {
      setIsPaying(false);
    }
  };

  if (!bookingDraft) {
    return (
      <div className="page-container animate-fade-in p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#1a2e1a]" />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in p-8 space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-display font-bold text-[#1a2e1a]">Secure Payment</h2>
        <p className="text-sm text-[#1a2e1a]/40 font-medium">Complete payment to confirm your booking.</p>
      </div>

      <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[#1a2e1a] font-bold">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-slate-50 border-slate-200 h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Card (Credit/Debit)</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="netbanking">Net Banking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[#1a2e1a] font-bold">Name on Card</Label>
                <Input
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  placeholder="Card holder name"
                  className="bg-slate-50 border-slate-200 h-12 rounded-xl"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[#1a2e1a] font-bold">Card Number</Label>
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="bg-slate-50 border-slate-200 h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1a2e1a] font-bold">Expiry</Label>
                <Input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="bg-slate-50 border-slate-200 h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1a2e1a] font-bold">CVV</Label>
                <Input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  className="bg-slate-50 border-slate-200 h-12 rounded-xl"
                />
              </div>
            </div>
          )}

          {paymentMethod === "upi" && (
            <div className="space-y-2">
              <Label className="text-[#1a2e1a] font-bold">UPI ID</Label>
              <Input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@bank"
                className="bg-slate-50 border-slate-200 h-12 rounded-xl"
              />
            </div>
          )}

          {paymentMethod === "netbanking" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Net banking selected. You will be redirected to your bank for authorization after clicking Pay Now.
            </div>
          )}

          <Button
            type="button"
            onClick={handlePayAndConfirm}
            disabled={isPaying}
            className="w-full h-14 gap-3 bg-[#1a2e1a] hover:bg-[#2C5F2D] text-white font-black text-lg rounded-2xl shadow-xl transition-all disabled:opacity-50"
          >
            {isPaying ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5 text-[#97BC62]" />}
            {isPaying ? "PROCESSING PAYMENT..." : `PAY ₹${payableAmount.toLocaleString("en-IN")} & CONFIRM BOOKING`}
          </Button>
        </div>

        <div className="bg-[#1a2e1a] rounded-[2rem] border border-[#97BC62]/20 shadow-2xl p-6 space-y-5 text-white">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#97BC62]">Booking Summary</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Service</span>
              <span className="font-bold">{bookingDraft.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Variant</span>
              <span className="font-bold">{bookingDraft.variant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Date</span>
              <span className="font-bold">{bookingDraft.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Address</span>
              <span className="font-bold text-right max-w-[65%]">{bookingDraft.address || "Not provided"}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex justify-between text-lg">
              <span className="font-black">Total</span>
              <span className="font-black text-[#97BC62]">₹{payableAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-white/70 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 mt-0.5 text-[#97BC62]" />
            Your booking is created only after successful payment.
          </div>
        </div>
      </div>
    </div>
  );
}
