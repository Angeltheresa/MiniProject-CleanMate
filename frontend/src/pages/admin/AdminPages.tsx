import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, AlertCircle, Clock, CheckCircle2, TrendingUp, BarChart3, PieChart, ArrowUpRight, Calendar as CalendarIcon } from "lucide-react";
import { adminAPI } from "@/lib/api";

// Manage Users
export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getUsers().then((res) => setUsers(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container animate-fade-in flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="page-container animate-fade-in">
      <h2 className="page-header">Manage Users</h2>
      <div className="bg-card rounded-2xl border border-border/60 shadow-soft overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="py-4">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-12">No users found</TableCell></TableRow>}
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                    u.role === 'agent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                  }`}>
                    {u.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                    u.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${u.status === "active" ? "bg-success" : "bg-warning"}`}></span>
                    {u.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground font-medium">
                  {new Date(u.joined).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Verify Agents
export function AdminVerifyAgents() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAgentsPending().then((res) => setAgents(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, action: string) => {
    try {
      await adminAPI.verifyAgent(id, action as any);
      setAgents(agents.map((a) => a.id === id ? { ...a, status: action } : a));
      toast({ title: action === "verified" ? "✅ Agent Approved" : "❌ Agent Rejected" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="page-container animate-fade-in flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="page-container animate-fade-in">
      <h2 className="page-header">Verify Agents</h2>
      <div className="space-y-4">
        {agents.length === 0 && <p className="text-muted-foreground text-sm">No agents to verify.</p>}
        {agents.map((a) => (
          <div key={a.id} className="bg-card rounded-xl border border-border/60 shadow-soft p-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{a.name.charAt(0)}</div>
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-sm text-muted-foreground">{a.specialization}</p>
              </div>
            </div>
            {a.status === "pending" ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleAction(a.id, "verified")} className="gap-1"><Check className="h-3 w-3" /> Approve</Button>
                <Button size="sm" variant="outline" onClick={() => handleAction(a.id, "rejected")} className="gap-1"><X className="h-3 w-3" /> Reject</Button>
              </div>
            ) : (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.status === "verified" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{a.status}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// All Bookings
export function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getBookings().then((res) => setBookings(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container animate-fade-in flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="page-container animate-fade-in">
      <h2 className="page-header">All Bookings</h2>
      <div className="bg-card rounded-xl border border-border/60 shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No bookings found</TableCell></TableRow>}
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.id?.toString().slice(-6)}</TableCell>
                <TableCell className="font-medium text-sm">{b.customerName}</TableCell>
                <TableCell className="text-sm">{b.serviceType}</TableCell>
                <TableCell className="text-sm">{new Date(b.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    b.status === "completed" ? "bg-success/10 text-success" :
                    b.status === "in-progress" ? "bg-info/10 text-info" :
                    b.status === "pending" ? "bg-warning/10 text-warning" :
                    "bg-primary/10 text-primary"
                  }`}>{b.status}</span>
                </TableCell>
                <TableCell className="text-right font-medium">₹{b.amount.toLocaleString("en-IN")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Complaints
export function AdminComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "in-progress" | "resolved">("all");

  useEffect(() => {
    adminAPI.getComplaints().then((res) => setComplaints(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="h-12 w-12 rounded-full border-4 border-[#97BC62]/20 border-t-[#1a2e1a] animate-spin" />
    </div>
  );

  const counts = {
    all: complaints.length,
    pending: complaints.filter(c => c.status === "pending").length,
    "in-progress": complaints.filter(c => c.status === "in-progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  };

  const filtered = activeFilter === "all" ? complaints : complaints.filter(c => c.status === activeFilter);

  const priorityIcon = (status: string) => {
    if (status === "resolved") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "in-progress") return <Clock className="h-4 w-4 text-blue-500" />;
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  };

  const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
    pending:     { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  label: "Pending" },
    "in-progress": { bg: "bg-blue-50",  text: "text-blue-700",   border: "border-blue-200",   label: "In Progress" },
    resolved:    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Resolved" },
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1a2e1a] to-[#2C5F2D] px-8 py-8 mb-8">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-[#97BC62]" />
            <span className="text-[#97BC62] text-xs font-bold uppercase tracking-widest">Admin Panel</span>
          </div>
          <h1 className="text-3xl font-black text-white">Complaint Management</h1>
          <p className="text-white/50 text-sm mt-1">{complaints.length} total complaints tracked</p>
        </div>
        {/* Summary bubbles */}
        <div className="relative mt-6 flex flex-wrap gap-3">
          {(Object.keys(counts) as Array<keyof typeof counts>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                activeFilter === key
                  ? "bg-white text-[#1a2e1a] border-white shadow-lg scale-105"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              {key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1)} ({counts[key]})
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 pb-10">
        {/* Stat Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { key: "pending",     label: "Pending",     icon: AlertCircle,   color: "from-amber-500 to-orange-400" },
            { key: "in-progress", label: "In Progress", icon: Clock,         color: "from-blue-500 to-blue-400" },
            { key: "resolved",    label: "Resolved",    icon: CheckCircle2,  color: "from-emerald-500 to-teal-400" },
          ].map(({ key, label, icon: Ic, color }) => (
            <div key={key} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} text-white p-5 shadow-lg`}>
              <div className="absolute right-3 -top-2 opacity-20">
                <Ic className="h-16 w-16" />
              </div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
              <p className="text-3xl font-black">{counts[key as keyof typeof counts]}</p>
            </div>
          ))}
        </div>

        {/* Timeline Cards */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle2 className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No complaints in this category</p>
          </div>
        )}

        <div className="relative">
          {/* Timeline line */}
          {filtered.length > 0 && (
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#1a2e1a]/20 via-[#97BC62]/30 to-transparent" />
          )}
          <div className="space-y-4">
            {filtered.map((c, idx) => {
              const cfg = statusConfig[c.status] || statusConfig["pending"];
              return (
                <div key={c.id} className="relative pl-14 group" style={{ animationDelay: `${idx * 60}ms` }}>
                  {/* Timeline dot */}
                  <div className={`absolute left-3.5 top-5 h-5 w-5 rounded-full border-2 ${cfg.border} ${cfg.bg} flex items-center justify-center shadow-sm group-hover:scale-125 transition-transform duration-200`}>
                    <div className={`h-2 w-2 rounded-full ${
                      c.status === "resolved" ? "bg-emerald-500" :
                      c.status === "in-progress" ? "bg-blue-500" : "bg-amber-500"
                    }`} />
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">{priorityIcon(c.status)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1a2e1a] text-sm leading-tight">{c.subject}</p>
                          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed line-clamp-2">{c.description}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                              <CalendarIcon className="h-3 w-3" />
                              {new Date(c.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">By {c.userName}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${cfg.bg} ${cfg.text} ${cfg.border} shrink-0 whitespace-nowrap`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Analytics
export function AdminAnalytics() {
  const [data, setData] = useState<{ categories: any[]; revenue: any[] }>({ categories: [], revenue: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics().then((res) => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="h-12 w-12 rounded-full border-4 border-[#97BC62]/20 border-t-[#1a2e1a] animate-spin" />
    </div>
  );

  const maxCategory = Math.max(...data.categories.map((c) => c.value), 1);
  const maxRevenue = Math.max(...data.revenue.map((m) => m.amount), 1);
  const totalRevenue = data.revenue.reduce((sum, m) => sum + m.amount, 0);
  const totalBookings = data.categories.reduce((sum, c) => sum + c.value, 0);

  const categoryPalette = [
    { bg: "bg-[#1a2e1a]",    ring: "#1a2e1a",  text: "text-[#1a2e1a]" },
    { bg: "bg-[#97BC62]",    ring: "#97BC62",  text: "text-[#97BC62]" },
    { bg: "bg-amber-500",    ring: "#f59e0b",  text: "text-amber-600" },
    { bg: "bg-blue-500",     ring: "#3b82f6",  text: "text-blue-600"  },
    { bg: "bg-purple-500",   ring: "#a855f7",  text: "text-purple-600" },
    { bg: "bg-rose-500",     ring: "#f43f5e",  text: "text-rose-600"  },
  ];

  // Build donut chart data
  const donutTotal = data.categories.reduce((s, c) => s + c.value, 0) || 1;
  let cumulativeDeg = 0;
  const donutSlices = data.categories.map((cat, i) => {
    const pct = cat.value / donutTotal;
    const deg = pct * 360;
    const start = cumulativeDeg;
    cumulativeDeg += deg;
    return { ...cat, pct, deg, start, color: categoryPalette[i % categoryPalette.length].ring };
  });

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1a2e1a] to-[#2C5F2D] px-8 py-8 mb-8">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-[#97BC62]" />
            <span className="text-[#97BC62] text-xs font-bold uppercase tracking-widest">Data Intelligence</span>
          </div>
          <h1 className="text-3xl font-black text-white">Analytics Overview</h1>
          <p className="text-white/50 text-sm mt-1">Platform performance insights</p>
        </div>
        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
            { label: "Total Bookings", value: totalBookings },
            { label: "Revenue Months", value: data.revenue.length },
            { label: "Service Types", value: data.categories.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
              <p className="text-white font-black text-lg">{value}</p>
              <p className="text-white/50 text-[10px] font-semibold mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 pb-10 space-y-8">
        {/* Row 1: Category Bar Chart + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Bar Chart - 3 cols */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#1a2e1a]/5 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#1a2e1a]" />
                </div>
                <div>
                  <h3 className="font-black text-[#1a2e1a] text-sm">Bookings by Category</h3>
                  <p className="text-slate-400 text-xs">{totalBookings} total bookings</p>
                </div>
              </div>
            </div>
            {data.categories.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No category data yet</p>
              </div>
            ) : (
              <div className="space-y-5">
                {data.categories.map((cat, i) => {
                  const pal = categoryPalette[i % categoryPalette.length];
                  const pct = (cat.value / maxCategory) * 100;
                  return (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${pal.bg}`} />
                          <span className="text-sm font-semibold text-slate-700">{cat.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black ${pal.text}`}>{cat.value}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{Math.round(pct)}%</span>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pal.bg} transition-all duration-1000 ease-out`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Donut Chart - 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-[#97BC62]/10 flex items-center justify-center">
                <PieChart className="h-4 w-4 text-[#2C5F2D]" />
              </div>
              <div>
                <h3 className="font-black text-[#1a2e1a] text-sm">Share Breakdown</h3>
                <p className="text-slate-400 text-xs">By service type</p>
              </div>
            </div>
            {data.categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">No data</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      {donutSlices.map((slice, i) => {
                        const r = 55;
                        const circ = 2 * Math.PI * r;
                        const dash = (slice.pct) * circ;
                        const offset = ((360 - slice.start) / 360) * circ;
                        return (
                          <circle
                            key={i}
                            cx="70" cy="70" r={r}
                            fill="none"
                            stroke={slice.color}
                            strokeWidth="20"
                            strokeDasharray={`${dash} ${circ - dash}`}
                            strokeDashoffset={offset}
                            strokeLinecap="butt"
                            transform="rotate(-90 70 70)"
                          />
                        );
                      })}
                      <circle cx="70" cy="70" r="38" fill="white" />
                      <text x="70" y="66" textAnchor="middle" fontSize="12" fontWeight="900" fill="#1a2e1a">{totalBookings}</text>
                      <text x="70" y="80" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600">TOTAL</text>
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  {data.categories.map((cat, i) => {
                    const pal = categoryPalette[i % categoryPalette.length];
                    return (
                      <div key={cat.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${pal.bg}`} />
                          <span className="text-xs text-slate-600 font-medium">{cat.label}</span>
                        </div>
                        <span className="text-xs font-black text-slate-700">{Math.round((cat.value / donutTotal) * 100)}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Revenue Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-black text-[#1a2e1a] text-sm">Monthly Revenue Trend</h3>
                <p className="text-slate-400 text-xs">Total: ₹{totalRevenue.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 rounded-xl px-3 py-1.5 border border-emerald-100">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">Revenue</span>
            </div>
          </div>
          {data.revenue.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-10 w-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No revenue data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Bar chart */}
              <div className="flex items-end gap-2 h-40">
                {data.revenue.map((m, i) => {
                  const h = (m.amount / maxRevenue) * 100;
                  const isLast = i === data.revenue.length - 1;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex justify-center">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                            isLast ? "bg-gradient-to-t from-[#1a2e1a] to-[#2C5F2D]" : "bg-gradient-to-t from-[#97BC62]/60 to-[#97BC62]/90"
                          } group-hover:opacity-80`}
                          style={{ height: `${h}%`, minHeight: "4px" }}
                        />
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a2e1a] text-white text-[9px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                          ₹{m.amount.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* X labels */}
              <div className="flex gap-2">
                {data.revenue.map((m) => (
                  <div key={m.month} className="flex-1 text-center">
                    <span className="text-[9px] text-slate-400 font-bold">{m.month.slice(0, 3).toUpperCase()}</span>
                  </div>
                ))}
              </div>
              {/* Table fallback */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {data.revenue.map((m) => (
                  <div key={m.month} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{m.month}</p>
                    <p className="text-sm font-black text-[#1a2e1a] mt-0.5">₹{m.amount.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
