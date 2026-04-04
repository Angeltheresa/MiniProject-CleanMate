import { useState, useEffect } from "react";
import { Clock, Briefcase, CheckCircle, Star, TrendingUp, Zap, Activity, MapPin, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { agentAPI } from "@/lib/api";
import { AgentDashboardStats } from "@/types";

// Rusted Orange palette
const O = {
  dark:   "#7A3410",  // deep rust
  mid:    "#C0622D",  // rusted orange
  bright: "#E07A45",  // warm orange
  soft:   "#FFF0E8",  // cream blush
  accent: "#D95F27",  // vibrant rust
};

function MetricRing({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#f5e0d0" strokeWidth="8" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            transform="rotate(-90 44 44)" style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-black" style={{ color: O.dark }}>{value}</span>
        </div>
      </div>
      <span className="text-[11px] font-bold text-center" style={{ color: `${O.dark}80` }}>{label}</span>
    </div>
  );
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<AgentDashboardStats>({ pendingRequests: 0, activeJobs: 0, completedJobs: 0, rating: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agentAPI.getDashboard().then((res) => {
      setStats(res.data.stats);
      setRecentRequests(res.data.recentRequests || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 animate-spin" style={{ borderColor: "#FFF0E8", borderTopColor: O.mid }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-5 w-5" style={{ color: O.mid }} />
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: "Pending Requests", value: stats.pendingRequests, icon: Clock,        grad: `linear-gradient(135deg, ${O.dark}, ${O.mid})` },
    { label: "Active Jobs",      value: stats.activeJobs,      icon: Briefcase,    grad: `linear-gradient(135deg, ${O.mid}, ${O.bright})` },
    { label: "Completed Jobs",   value: stats.completedJobs,   icon: CheckCircle,  grad: `linear-gradient(135deg, #6B7280, #9CA3AF)` },
    { label: "Avg Rating",       value: stats.rating || "5.0", icon: Star,         grad: `linear-gradient(135deg, #B45309, #D97706)` },
  ];

  return (
    <div className="min-h-full animate-fade-in" style={{ background: "linear-gradient(135deg, #fff9f5 0%, #ffffff 50%, #fff5ee 100%)" }}>
      {/* Hero Banner */}
      <div className="relative overflow-hidden px-8 py-10 mb-8" style={{ background: `linear-gradient(135deg, ${O.dark}, ${O.mid})` }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5"
          style={{ background: `repeating-linear-gradient(45deg, ${O.bright}, ${O.bright} 2px, transparent 2px, transparent 12px)` }} />

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: O.bright }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: O.bright }}>Field Operations</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-1">Agent Hub</h1>
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Manage your schedule and service requests</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl px-5 py-3 border" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
            <Activity className="h-5 w-5" style={{ color: O.bright }} />
            <div>
              <p className="text-white text-sm font-bold">Agent Status</p>
              <p className="text-xs font-semibold" style={{ color: O.bright }}>Ready for assignments</p>
            </div>
          </div>
        </div>

        {/* Quick stats row in hero */}
        <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpiCards.map(({ label, value, icon: Ic }) => (
            <div key={label} className="rounded-xl px-4 py-3 border flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)" }}>
              <Ic className="h-4 w-4 shrink-0" style={{ color: O.bright }} />
              <div>
                <p className="text-white text-base font-black">{value}</p>
                <p className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 pb-10 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiCards.map(({ label, value, icon: Ic, grad }) => (
            <div key={label} className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg group hover:-translate-y-1 transition-all duration-300"
              style={{ background: grad }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
              <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Ic className="h-5 w-5 text-white" />
              </div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
              <p className="text-3xl font-black tracking-tight">{value}</p>
            </div>
          ))}
        </div>

        {/* Dual Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metric Rings */}
          <div className="bg-white rounded-3xl border p-8 shadow-lg" style={{ borderColor: "#f5e0d0", boxShadow: "0 8px 30px rgba(192,98,45,0.08)" }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: O.soft }}>
                <TrendingUp className="h-4 w-4" style={{ color: O.mid }} />
              </div>
              <div>
                <h3 className="font-black text-sm" style={{ color: O.dark }}>Performance Rings</h3>
                <p className="text-slate-400 text-xs">Visual job breakdown</p>
              </div>
            </div>
            <div className="flex items-center justify-around flex-wrap gap-4">
              <MetricRing value={stats.pendingRequests} max={Math.max(stats.pendingRequests + 5, 10)} color={O.mid}   label="Pending" />
              <MetricRing value={stats.activeJobs}      max={Math.max(stats.activeJobs + 3, 10)}     color={O.bright} label="Active" />
              <MetricRing value={stats.completedJobs}   max={Math.max(stats.completedJobs, 20)}       color="#6B7280"  label="Done" />
              <MetricRing value={stats.rating || 5}     max={5}                                        color="#D97706"  label="Rating" />
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-3xl border p-8 shadow-lg" style={{ borderColor: "#f5e0d0", boxShadow: "0 8px 30px rgba(192,98,45,0.08)" }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: O.soft }}>
                <Star className="h-4 w-4" style={{ color: O.mid }} />
              </div>
              <div>
                <h3 className="font-black text-sm" style={{ color: O.dark }}>My Performance</h3>
                <p className="text-slate-400 text-xs">At-a-glance summary</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Completion Rate", pct: stats.completedJobs > 0 ? Math.min(Math.round((stats.completedJobs / (stats.completedJobs + stats.activeJobs + stats.pendingRequests || 1)) * 100), 100) : 0, color: O.mid },
                { label: "Active Workload", pct: stats.activeJobs > 0 ? Math.min(stats.activeJobs * 20, 100) : 0, color: O.bright },
                { label: "Satisfaction", pct: Math.round((stats.rating / 5) * 100) || 100, color: "#D97706" },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-600">{label}</span>
                    <span className="font-black" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#f5e0d0" }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t grid grid-cols-2 gap-3" style={{ borderColor: "#fce9d8" }}>
              {[
                { label: "Jobs Done", val: stats.completedJobs, bg: O.soft, text: O.dark },
                { label: "Avg Rating",  val: `${stats.rating || 5}/5 ⭐`, bg: "#fffbeb", text: "#92400e" },
              ].map(({ label, val, bg, text }) => (
                <div key={label} className="rounded-xl p-3 text-center border" style={{ background: bg, borderColor: "#f5e0d0" }}>
                  <p className="text-lg font-black" style={{ color: text }}>{val}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Requests Timeline */}
        <div className="bg-white rounded-3xl border p-8 shadow-lg" style={{ borderColor: "#f5e0d0", boxShadow: "0 8px 30px rgba(192,98,45,0.08)" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: O.soft }}>
                <Briefcase className="h-4 w-4" style={{ color: O.mid }} />
              </div>
              <div>
                <h3 className="font-black text-sm" style={{ color: O.dark }}>Recent Service Requests</h3>
                <p className="text-slate-400 text-xs">{recentRequests.length} incoming requests</p>
              </div>
            </div>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto mb-3" style={{ color: "#f5d0b8" }} />
              <p className="font-semibold text-slate-400">All caught up! No pending requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((r: any, idx: number) => (
                <div key={r._id} className="flex items-center justify-between p-4 rounded-2xl border group hover:-translate-y-0.5 transition-all duration-200"
                  style={{ background: idx === 0 ? O.soft : "#fafafa", borderColor: idx === 0 ? "#f5d0b8" : "#f3f4f6" }}>
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                      style={{ background: idx === 0 ? O.mid : "#9CA3AF" }}>
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black" style={{ color: O.dark }}>{(r.customerId as any)?.fullName || "Premium Customer"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{r.serviceType} · {r.variant}</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <CalendarIcon className="h-2.5 w-2.5" />{new Date(r.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tight ${
                      r.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    }`}>{r.status}</span>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
