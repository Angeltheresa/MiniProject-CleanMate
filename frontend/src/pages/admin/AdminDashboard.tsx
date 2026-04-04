import { useState, useEffect } from "react";
import { Users, ShieldCheck, Calendar, AlertTriangle, Star, TrendingUp, Activity, ArrowUpRight, CheckCircle2, Clock, Zap } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { AdminDashboardData } from "@/types";

function MetricRing({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black text-[#1a2e1a]">{value}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-500 text-center leading-tight">{label}</span>
    </div>
  );
}

function KpiCard({ title, value, sub, icon: Icon, gradient, pulse }: {
  title: string; value: string | number; sub: string;
  icon: React.ElementType; gradient: string; pulse?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} text-white shadow-lg group hover:-translate-y-1 transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-black/5 translate-y-8 -translate-x-8" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Icon className="h-5 w-5 text-white" />
          </div>
          {pulse && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black tracking-tight">{value}</p>
        <p className="text-white/60 text-xs mt-1 font-medium">{sub}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then((res) => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-[#97BC62]/20 border-t-[#1a2e1a] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-5 w-5 text-[#1a2e1a]" />
          </div>
        </div>
      </div>
    );
  }

  const completionRate = data.stats.totalBookings > 0
    ? Math.round(((data.stats.totalBookings - data.stats.pendingComplaints) / data.stats.totalBookings) * 100)
    : 0;

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1a2e1a] via-[#2C5F2D] to-[#3a7a3b] px-8 py-10 mb-8">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-5"
          style={{ backgroundImage: "linear-gradient(45deg, #97BC62 25%, transparent 25%, transparent 75%, #97BC62 75%)", backgroundSize: "20px 20px" }} />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#97BC62] animate-pulse" />
              <span className="text-[#97BC62] text-xs font-bold uppercase tracking-widest">Control Center</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-1">Admin Dashboard</h1>
            <p className="text-white/50 text-sm font-medium">Real-time platform monitoring & management</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
            <Activity className="h-5 w-5 text-[#97BC62]" />
            <div>
              <p className="text-white text-sm font-bold">Platform Status</p>
              <p className="text-[#97BC62] text-xs font-semibold">All systems operational</p>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users", val: data.stats.totalUsers, icon: Users },
            { label: "Total Agents", val: data.stats.totalAgents, icon: ShieldCheck },
            { label: "Bookings", val: data.stats.totalBookings, icon: Calendar },
            { label: "Open Complaints", val: data.stats.pendingComplaints, icon: AlertTriangle },
          ].map(({ label, val, icon: Ic }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 flex items-center gap-3">
              <Ic className="h-4 w-4 text-[#97BC62] shrink-0" />
              <div>
                <p className="text-white text-base font-black">{val}</p>
                <p className="text-white/50 text-[10px] font-semibold">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 pb-10 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <KpiCard
            title="Monthly Revenue"
            value={`₹${data.revenue.toLocaleString("en-IN")}`}
            sub="Verified earnings this month"
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-[#1a2e1a] to-[#2C5F2D]"
            pulse
          />
          <KpiCard
            title="Active Services"
            value={data.activeServices}
            sub={`Across ${data.activeAgents} registered agents`}
            icon={Zap}
            gradient="bg-gradient-to-br from-[#97BC62] to-[#6a9c38]"
          />
          <KpiCard
            title="Platform Health"
            value={`${data.satisfaction}/5`}
            sub="Average service satisfaction rating"
            icon={Star}
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          />
        </div>

        {/* Dual Panel: Metric Rings + Completion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metric Rings */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-[#1a2e1a]/5 flex items-center justify-center">
                <Activity className="h-4 w-4 text-[#1a2e1a]" />
              </div>
              <div>
                <h3 className="font-black text-[#1a2e1a] text-sm">Platform Metrics</h3>
                <p className="text-[#1a2e1a]/40 text-xs">Visual distribution overview</p>
              </div>
            </div>
            <div className="flex items-center justify-around flex-wrap gap-6">
              <MetricRing value={data.stats.totalUsers} max={data.stats.totalUsers + 50} color="#1a2e1a" label="Users" />
              <MetricRing value={data.stats.totalAgents} max={data.stats.totalUsers} color="#97BC62" label="Agents" />
              <MetricRing value={data.stats.totalBookings} max={data.stats.totalBookings + 20} color="#f59e0b" label="Bookings" />
              <MetricRing value={data.stats.pendingComplaints} max={data.stats.totalBookings || 10} color="#ef4444" label="Complaints" />
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-black text-[#1a2e1a] text-sm">Completion Rate</h3>
                <p className="text-[#1a2e1a]/40 text-xs">Bookings resolved successfully</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={completionRate >= 70 ? "#22c55e" : completionRate >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="12"
                    strokeDasharray={`${(completionRate / 100) * 314} ${314 - (completionRate / 100) * 314}`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    style={{ transition: "stroke-dasharray 1.2s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-[#1a2e1a]">{completionRate}%</span>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                {[
                  { label: "Completed Bookings", val: data.stats.totalBookings - data.stats.pendingComplaints, color: "bg-emerald-500" },
                  { label: "Open Complaints", val: data.stats.pendingComplaints, color: "bg-red-400" },
                  { label: "Active Agents", val: data.activeAgents, color: "bg-[#97BC62]" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${color} shrink-0`} />
                    <span className="text-xs text-slate-500 font-medium flex-1">{label}</span>
                    <span className="text-xs font-black text-[#1a2e1a]">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">Platform performing well</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#1a2e1a]/5 flex items-center justify-center">
                <Clock className="h-4 w-4 text-[#1a2e1a]" />
              </div>
              <div>
                <h3 className="font-black text-[#1a2e1a] text-sm">Activity Snapshot</h3>
                <p className="text-[#1a2e1a]/40 text-xs">Platform at a glance</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Satisfaction Score", value: `${data.satisfaction}/5 ⭐`, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
              { label: "Active Services", value: data.activeServices, bg: "bg-[#97BC62]/10", text: "text-[#2C5F2D]", border: "border-[#97BC62]/20" },
              { label: "Registered Agents", value: data.activeAgents, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
              { label: "Completion Rate", value: `${completionRate}%`, bg: data.stats.pendingComplaints > 5 ? "bg-red-50" : "bg-emerald-50", text: data.stats.pendingComplaints > 5 ? "text-red-700" : "text-emerald-700", border: data.stats.pendingComplaints > 5 ? "border-red-100" : "border-emerald-100" },
            ].map(({ label, value, bg, text, border }) => (
              <div key={label} className={`${bg} ${border} border rounded-2xl p-4 text-center`}>
                <p className={`text-xl font-black ${text}`}>{value}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
