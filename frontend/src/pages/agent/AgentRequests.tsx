import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, MessageSquare, MapPin, Clock, Briefcase, AlertCircle, CheckCircle2, Calendar as CalendarIcon } from "lucide-react";
import { agentAPI } from "@/lib/api";
import { ServiceRequest } from "@/types";

const O = {
  dark: "#7A3410", mid: "#C0622D", bright: "#E07A45", soft: "#FFF0E8", accent: "#D95F27",
};

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string; icon: any }> = {
  pending:     { bg: "#fffbeb", text: "#92400e", border: "#fde68a", label: "Pending",   icon: Clock },
  approved:    { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7", label: "Approved",  icon: CheckCircle2 },
  rejected:    { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5", label: "Rejected",  icon: X },
  "in-progress": { bg: O.soft, text: O.dark, border: "#f5d0b8", label: "In Progress", icon: Briefcase },
  completed:   { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7", label: "Completed", icon: CheckCircle2 },
};

export default function AgentRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const { toast } = useToast();

  useEffect(() => {
    agentAPI.getRequests().then((res) => setRequests(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      await agentAPI.updateRequest(id, action);
      setRequests(requests.map((r) => (r.id || r._id) === id ? { ...r, status: action } : r));
      toast({ title: action === "approved" ? "✅ Request Approved" : "❌ Request Rejected" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="h-12 w-12 rounded-full border-4 animate-spin" style={{ borderColor: `${O.soft}`, borderTopColor: O.mid }} />
    </div>
  );

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="min-h-full animate-fade-in" style={{ background: "linear-gradient(135deg, #fff9f5 0%, #ffffff 60%, #fff5ee 100%)" }}>
      {/* Header Banner */}
      <div className="relative overflow-hidden px-8 py-8 mb-8" style={{ background: `linear-gradient(135deg, ${O.dark}, ${O.mid})` }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-4 w-4" style={{ color: O.bright }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: O.bright }}>Field Operations</span>
          </div>
          <h1 className="text-3xl font-black text-white">Service Requests</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{requests.length} total requests received</p>
        </div>

        {/* Filter tabs inside banner */}
        <div className="relative mt-6 flex flex-wrap gap-3">
          {(["all", "pending", "approved", "rejected"] as const).map((key) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border"
              style={filter === key
                ? { background: "white", color: O.dark, borderColor: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", transform: "scale(1.05)" }
                : { background: "rgba(255,255,255,0.1)", color: "white", borderColor: "rgba(255,255,255,0.2)" }}>
              {key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1)} ({counts[key as keyof typeof counts]})
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 pb-10">
        {/* Stat Strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { key: "pending",  label: "Pending",  color: `linear-gradient(135deg, #B45309, #D97706)` },
            { key: "approved", label: "Approved", color: `linear-gradient(135deg, #065F46, #10B981)` },
            { key: "rejected", label: "Rejected", color: `linear-gradient(135deg, #991B1B, #EF4444)` },
          ].map(({ key, label, color }) => (
            <div key={key} className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg" style={{ background: color }}>
              <div className="absolute right-3 -top-2 opacity-10 text-6xl font-black select-none">{counts[key as keyof typeof counts]}</div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
              <p className="text-3xl font-black">{counts[key as keyof typeof counts]}</p>
            </div>
          ))}
        </div>

        {/* Request Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3" style={{ color: "#f5d0b8" }} />
            <p className="font-semibold text-slate-400">No requests in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((r, idx) => {
              const cfg = statusConfig[r.status] || statusConfig["pending"];
              const Ic = cfg.icon;
              return (
                <div key={r.id || r._id}
                  className="bg-white rounded-2xl border shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  style={{ borderColor: "#f5e0d0" }}>
                  {/* Top stripe */}
                  <div className="h-1 w-full" style={{ background: idx === 0 ? O.mid : "#e5e7eb" }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                          style={{ background: r.status === "pending" ? O.mid : r.status === "approved" ? "#10B981" : "#9CA3AF" }}>
                          <Ic className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm" style={{ color: O.dark }}>{r.customerName}</p>
                          <p className="text-slate-500 text-xs mt-0.5 font-semibold">{r.serviceType} · {r.variant}</p>
                          <div className="flex items-center flex-wrap gap-3 mt-2">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                              <MapPin className="h-3 w-3" />{r.address}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                              <CalendarIcon className="h-3 w-3" />{new Date(r.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {r.status === "pending" ? (
                          <>
                            <button onClick={() => handleAction(r.id || r._id!, "approved")}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white transition-all hover:scale-105 shadow-md"
                              style={{ background: O.mid }}>
                              <Check className="h-3 w-3" /> Approve
                            </button>
                            <button onClick={() => handleAction(r.id || r._id!, "rejected")}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border transition-all hover:bg-red-50"
                              style={{ color: "#991b1b", borderColor: "#fca5a5" }}>
                              <X className="h-3 w-3" /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] px-3 py-1.5 rounded-full font-black border" style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
                            {cfg.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {r.status === "approved" && (
                      <div className="mt-4 pt-4 border-t flex flex-wrap gap-2" style={{ borderColor: "#f5e0d0" }}>
                        <button onClick={() => navigate(`/agent/messages/${r.id || r._id}`)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white shadow transition-all hover:scale-105"
                          style={{ background: O.mid }}>
                          <MessageSquare className="h-3.5 w-3.5" /> Chat with Customer
                        </button>
                        <button onClick={() => { const q = encodeURIComponent(r.address); window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank"); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition-all hover:-translate-y-0.5"
                          style={{ color: O.dark, borderColor: "#f5d0b8", background: O.soft }}>
                          <MapPin className="h-3.5 w-3.5" /> View on Map
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
