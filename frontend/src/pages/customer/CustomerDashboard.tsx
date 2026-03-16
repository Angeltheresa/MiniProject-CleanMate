import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { Calendar, CheckCircle, Clock, Wallet } from "lucide-react";
import { customerAPI } from "@/lib/api";
import { DashboardStats, Booking } from "@/types";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ active: 0, completed: 0, pending: 0, totalSpent: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerAPI.getDashboard().then((res) => {
      setStats(res.data.stats);
      setRecentBookings(res.data.recentBookings || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-container animate-fade-in flex items-center justify-center py-20">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="page-container animate-fade-in p-8 space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-display font-bold text-[#1a2e1a]">Welcome back! 👋</h2>
        <p className="text-sm text-[#1a2e1a]/40 font-medium">Ready for a sparkling clean home today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Bookings" value={stats.active} icon={Calendar} variant="primary" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} variant="success" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} variant="warning" />
        <StatCard title="Total Spent" value={`₹${stats.totalSpent.toLocaleString("en-IN")}`} icon={Wallet} variant="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 group transition-all duration-300">
          <h3 className="text-[#1a2e1a] font-display font-bold text-lg mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#97BC62] rounded-full" />
            Recent Bookings
          </h3>
          <div className="space-y-4">
            {recentBookings.length === 0 && <p className="text-sm text-[#1a2e1a]/40 font-medium italic">No bookings yet. Let's make your space shine!</p>}
            {recentBookings.slice(0, 3).map((b: any) => (
              <div key={b._id} className="flex items-center justify-between p-5 rounded-2xl bg-[#97BC62]/5 border border-[#97BC62]/10 hover:bg-[#97BC62]/10 transition-colors group/item">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#1a2e1a]">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a2e1a]">{b.serviceType}</p>
                    <p className="text-[10px] text-[#1a2e1a]/40 font-bold uppercase tracking-wider">{new Date(b.date).toLocaleDateString()} · {b.variant}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${
                  b.status === "completed" ? "bg-emerald-500/10 text-emerald-600" :
                  b.status === "in-progress" ? "bg-[#1a2e1a]/10 text-[#1a2e1a]" :
                  b.status === "pending" ? "bg-amber-500/10 text-amber-600" :
                  "bg-[#97BC62]/20 text-[#1a2e1a]"
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
          <h3 className="text-[#1a2e1a] font-display font-bold text-lg mb-6 flex items-center gap-2">
             <span className="w-1.5 h-6 bg-[#1a2e1a] rounded-full" />
             Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Book Service", desc: "Start fresh today", color: "bg-[#1a2e1a]", route: "/customer/book" },
              { label: "Track Service", desc: "Real-time updates", color: "bg-[#97BC62]", route: "/customer/tracking" },
              { label: "View History", desc: "Past cleanings", color: "bg-white", route: "/customer/history" },
              { label: "Get Estimate", desc: "Plan your budget", color: "bg-slate-50", route: "/customer/estimator" },
            ].map((a) => (
              <div key={a.label} onClick={() => navigate(a.route)} className="group p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-12 h-12 ${a.color} opacity-10 rounded-bl-[2rem]`} />
                <p className="text-sm font-black text-[#1a2e1a] group-hover:text-[#97BC62] transition-colors">{a.label}</p>
                <p className="text-[10px] text-[#1a2e1a]/40 font-bold mt-1">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
