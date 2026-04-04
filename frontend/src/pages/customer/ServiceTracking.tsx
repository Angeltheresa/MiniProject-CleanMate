import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Clock, Loader2, MessageSquare, Phone,
  Package, Truck, Wrench, PartyPopper, ChevronDown, RefreshCw
} from "lucide-react";
import { customerAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrackingStep } from "@/types";

const STAGE_CONFIG = [
  {
    key: "Request Sent",
    icon: Package,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    activeBg: "bg-blue-500",
    description: "Your booking request has been submitted",
  },
  {
    key: "Agent Accepted",
    icon: Truck,
    color: "text-violet-500",
    bg: "bg-violet-50",
    border: "border-violet-200",
    activeBg: "bg-violet-500",
    description: "Your agent has confirmed the appointment",
  },
  {
    key: "In Progress",
    icon: Wrench,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    activeBg: "bg-amber-500",
    description: "Cleaning service is currently underway",
  },
  {
    key: "Completed",
    icon: PartyPopper,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    activeBg: "bg-emerald-500",
    description: "Service has been completed successfully",
  },
];

function getStageIndex(steps: TrackingStep[]): number {
  const doneCount = steps.filter((s) => s.status === "done").length;
  const currentIdx = steps.findIndex((s) => s.status === "current");
  return currentIdx !== -1 ? currentIdx : doneCount - 1;
}

export default function ServiceTracking() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string>("");
  const [tracking, setTracking] = useState<{ booking: any; steps: TrackingStep[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async () => {
    try {
      const res = await customerAPI.getBookings();
      const active = res.data.filter((b: any) =>
        ["pending", "approved", "in-progress"].includes(b.status)
      );
      setBookings(active);
      if (active.length > 0 && !selectedBooking) {
        setSelectedBooking(active[0]._id);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const loadTracking = async () => {
    if (!selectedBooking) return;
    setRefreshing(true);
    try {
      const res = await customerAPI.getBookingTracking(selectedBooking);
      setTracking(res.data);
    } catch {}
    finally { setRefreshing(false); }
  };

  useEffect(() => { loadBookings(); }, []);
  useEffect(() => { loadTracking(); }, [selectedBooking]);

  if (loading) {
    return (
      <div className="page-container animate-fade-in flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-[#1a2e1a]/5 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a2e1a]" />
        </div>
        <p className="text-sm font-semibold text-[#1a2e1a]/40">Loading your active bookings…</p>
      </div>
    );
  }

  const steps = tracking?.steps || [];
  const booking = tracking?.booking;
  const activeStageIdx = getStageIndex(steps);
  const progressPct = steps.length > 1
    ? Math.round((steps.filter((s) => s.status === "done").length / (steps.length - 1)) * 100)
    : 0;

  return (
    <div className="page-container animate-fade-in p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-display font-black text-[#1a2e1a]">Service Tracking</h2>
          <p className="text-sm text-[#1a2e1a]/40 mt-1 font-medium">Real-time status of your active bookings</p>
        </div>
        {selectedBooking && (
          <Button
            variant="outline"
            onClick={loadTracking}
            disabled={refreshing}
            className="rounded-xl border-slate-200 h-10 px-4 text-sm font-bold text-[#1a2e1a]"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Package className="h-9 w-9 text-slate-300" />
          </div>
          <div>
            <p className="font-black text-[#1a2e1a] text-lg">No Active Bookings</p>
            <p className="text-sm text-[#1a2e1a]/40 mt-1">Book a cleaning service to start tracking it here</p>
          </div>
          <Button
            onClick={() => navigate("/customer/book")}
            className="bg-[#1a2e1a] hover:bg-[#2C5F2D] text-white rounded-xl h-10 px-6 font-bold mt-2"
          >
            Book a Service
          </Button>
        </div>
      ) : (
        <>
          {/* Booking Selector */}
          {bookings.length > 1 && (
            <div className="mb-6 max-w-lg">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2e1a]/40 mb-2">Select Booking</p>
              <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                <SelectTrigger className="bg-white border-slate-200 h-12 rounded-xl font-semibold text-[#1a2e1a]">
                  <SelectValue placeholder="Select a booking" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((b: any) => (
                    <SelectItem key={b._id} value={b._id} className="font-semibold">
                      {b.serviceType} · {b.variant} · {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {booking && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT: Timeline */}
              <div className="lg:col-span-2 space-y-4">
                {/* Booking Info Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-black text-[#1a2e1a] text-lg">{booking.serviceType}</p>
                    <p className="text-sm text-[#1a2e1a]/50 font-semibold">{booking.variant} · #{booking._id?.slice(-6)?.toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-black uppercase tracking-wide ${
                      booking.status === "in-progress"
                        ? "bg-amber-100 text-amber-700"
                        : booking.status === "approved"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                    }`}>
                      {booking.status === "in-progress" ? "In Progress" : booking.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2e1a]/40">Overall Progress</p>
                    <span className="text-sm font-black text-[#2C5F2D]">{progressPct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2C5F2D] to-[#97BC62] rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Step-by-Step Timeline */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2e1a]/40 mb-5">Service Timeline</p>
                  <div className="space-y-0">
                    {steps.map((step: TrackingStep, idx: number) => {
                      const config = STAGE_CONFIG[idx] || STAGE_CONFIG[0];
                      const Icon = config.icon;
                      const isDone = step.status === "done";
                      const isCurrent = step.status === "current";
                      const isUpcoming = step.status === "upcoming";
                      const isLast = idx === steps.length - 1;

                      return (
                        <div key={step.label} className="flex gap-4">
                          {/* Icon + Connector */}
                          <div className="flex flex-col items-center">
                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all ${
                              isDone
                                ? `${config.activeBg} border-transparent text-white shadow-sm`
                                : isCurrent
                                  ? `${config.bg} ${config.border} ${config.color}`
                                  : "bg-slate-50 border-slate-200 text-slate-300"
                            }`}>
                              {isDone
                                ? <CheckCircle2 className="h-5 w-5" />
                                : isCurrent
                                  ? <Loader2 className="h-5 w-5 animate-spin" />
                                  : <Icon className="h-5 w-5" />
                              }
                            </div>
                            {!isLast && (
                              <div className={`w-0.5 flex-1 my-1.5 transition-colors ${
                                isDone ? "bg-[#2C5F2D]/30" : "bg-slate-100"
                              }`} style={{ minHeight: "28px" }} />
                            )}
                          </div>

                          {/* Content */}
                          <div className={`flex-1 pb-5 ${isLast ? "pb-0" : ""}`}>
                            <div className="flex items-center justify-between">
                              <p className={`font-black text-sm ${
                                isDone ? "text-[#1a2e1a]" : isCurrent ? config.color : "text-slate-300"
                              }`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                  Current
                                </span>
                              )}
                              {isDone && (
                                <span className="text-[10px] font-bold text-slate-400">Done</span>
                              )}
                            </div>
                            <p className={`text-xs mt-0.5 font-medium ${
                              isUpcoming ? "text-slate-200" : "text-[#1a2e1a]/40"
                            }`}>
                              {config.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT: Agent Card + Actions */}
              <div className="space-y-4">
                {/* Agent Info */}
                <div className="bg-[#1a2e1a] rounded-2xl p-5 text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#97BC62] mb-4">Your Agent</p>
                  {booking.agentId ? (
                    <>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black shrink-0">
                          {booking.agentId.fullName?.charAt(0) || "A"}
                        </div>
                        <div>
                          <p className="font-black text-lg leading-tight">{booking.agentId.fullName || "Assigned Agent"}</p>
                          <p className="text-xs text-white/50 font-semibold mt-0.5">Your cleaning professional</p>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <Button
                          onClick={() => navigate(`/customer/messages/${booking._id}`)}
                          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl h-11 font-bold text-sm"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" /> Chat with Agent
                        </Button>
                        {booking.agentId.phone && (
                          <Button
                            asChild
                            className="w-full bg-[#97BC62] hover:bg-[#8aad55] text-[#1a2e1a] rounded-xl h-11 font-bold text-sm"
                          >
                            <a href={`tel:${booking.agentId.phone}`}>
                              <Phone className="h-4 w-4 mr-2" /> Call Agent
                            </a>
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center py-4 gap-2 text-center">
                      <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white/30" />
                      </div>
                      <p className="font-bold text-white/60 text-sm">Awaiting Agent Assignment</p>
                      <p className="text-xs text-white/30">We're finding the best match for you</p>
                    </div>
                  )}
                </div>

                {/* Booking Details */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2e1a]/40">Booking Details</p>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#1a2e1a]/50 font-medium">Date</span>
                      <span className="font-bold text-[#1a2e1a]">{new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#1a2e1a]/50 font-medium">Service</span>
                      <span className="font-bold text-[#1a2e1a]">{booking.serviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#1a2e1a]/50 font-medium">Variant</span>
                      <span className="font-bold text-[#1a2e1a]">{booking.variant}</span>
                    </div>
                    {booking.amount && (
                      <>
                        <div className="h-px bg-slate-100" />
                        <div className="flex justify-between">
                          <span className="font-black text-[#1a2e1a]">Amount</span>
                          <span className="font-black text-[#2C5F2D] text-base">₹{booking.amount?.toLocaleString("en-IN")}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* History Link */}
                <button
                  onClick={() => navigate("/customer/history")}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#97BC62]/40 hover:bg-[#97BC62]/5 transition-all group text-left"
                >
                  <span className="text-sm font-bold text-[#1a2e1a]">View All Bookings</span>
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-[#2C5F2D] -rotate-90 transition-colors" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
