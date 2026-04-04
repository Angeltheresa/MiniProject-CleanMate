import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload, Wind, CalendarCheck, CheckCircle2, Shield, Plus, X, Star,
  Briefcase, ArrowRight, Trash2, Edit, FileText, RefreshCw, Calendar as CalendarIcon,
  Clock, Zap, AlertTriangle, UploadCloud
} from "lucide-react";
import { agentAPI } from "@/lib/api";

// ─────────────────────────────────────────────
// Rusted Orange Design Tokens
// ─────────────────────────────────────────────
const O = {
  dark:   "#7A3410",
  mid:    "#C0622D",
  bright: "#E07A45",
  soft:   "#FFF0E8",
  muted:  "#F5D0B8",
  accent: "#D95F27",
};

// Shared page hero banner
function PageHero({ eyebrow, title, subtitle, icon: Icon }: { eyebrow: string; title: string; subtitle: string; icon: any }) {
  return (
    <div className="relative overflow-hidden px-8 py-8 mb-8" style={{ background: `linear-gradient(135deg, ${O.dark}, ${O.mid})` }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="relative flex items-center gap-3 mb-1">
        <Icon className="h-4 w-4" style={{ color: O.bright }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: O.bright }}>{eyebrow}</span>
      </div>
      <h1 className="relative text-3xl font-black text-white">{title}</h1>
      <p className="relative text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{subtitle}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// AVAILABILITY
// ─────────────────────────────────────────────
export function AgentAvailability() {
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agentAPI.getAvailability().then((res) => setAvailable(res.data.available)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggle = async (value: boolean) => {
    try { await agentAPI.setAvailability(value); setAvailable(value); } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="h-12 w-12 rounded-full border-4 animate-spin" style={{ borderColor: O.soft, borderTopColor: O.mid }} />
    </div>
  );

  return (
    <div className="min-h-full animate-fade-in" style={{ background: "linear-gradient(135deg, #fff9f5 0%, #fff 60%, #fff5ee 100%)" }}>
      <PageHero eyebrow="Status Management" title="Availability Status" subtitle="Control your visibility to customers" icon={Wind} />

      <div className="px-8 pb-10 space-y-8">
        {/* Status badge */}
        <div className="flex justify-end">
          <span className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all"
            style={available
              ? { background: "#ecfdf5", color: "#065f46", borderColor: "#6ee7b7" }
              : { background: "#fef2f2", color: "#991b1b", borderColor: "#fca5a5" }}>
            {available ? "● Currently Online" : "○ Currently Offline"}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Toggle Card */}
          <div className="relative overflow-hidden rounded-3xl p-10 text-white shadow-2xl transition-all duration-500"
            style={{ background: available ? `linear-gradient(135deg, ${O.dark}, ${O.mid})` : "linear-gradient(135deg, #374151, #6B7280)" }}>
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
            <div className="relative z-10 space-y-6">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <Wind className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2">Work Mode</h3>
                <p className="text-sm font-semibold opacity-60 leading-relaxed">
                  {available
                    ? "You are visible to customers and can receive new service requests."
                    : "You are hidden from new bookings. Pending jobs will still be visible."}
                </p>
              </div>
              <div className="pt-4 flex items-center gap-5">
                <Switch checked={available} onCheckedChange={toggle}
                  className="data-[state=checked]:bg-white/30 data-[state=unchecked]:bg-white/10" />
                <span className="font-black text-xl uppercase tracking-tight italic">
                  {available ? "Go Offline" : "Go Online"}
                </span>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="rounded-3xl p-10 border space-y-6" style={{ background: O.soft, borderColor: O.muted }}>
            <h4 className="text-xl font-black" style={{ color: O.dark }}>Active Hours Tips</h4>
            <div className="space-y-5">
              {[
                { tip: "Stay online during mornings (8am–11am) for peak demand.", icon: Clock },
                { tip: "Ensure your phone notifications are enabled.", icon: Zap },
                { tip: "Fast response time improves your agent rating.", icon: Star },
              ].map(({ tip, icon: Ic }, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: O.muted }}>
                    <Ic className="h-4 w-4" style={{ color: O.mid }} />
                  </div>
                  <p className="text-sm font-semibold leading-relaxed" style={{ color: `${O.dark}99` }}>{tip}</p>
                </div>
              ))}
            </div>
            {/* Indicator dots */}
            <div className="pt-4 border-t flex items-center gap-3" style={{ borderColor: O.muted }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: available ? "#22c55e" : "#9ca3af" }} />
              <span className="text-xs font-bold" style={{ color: `${O.dark}80` }}>{available ? "Accepting new bookings" : "Not accepting bookings"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────
export function AgentAttendance() {
  const { toast } = useToast();
  const [marked, setMarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agentAPI.getAttendance().then((res) => setMarked(res.data.markedToday)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAttendance = async () => {
    try {
      await agentAPI.markAttendance();
      setMarked(true);
      toast({ title: "✅ Attendance Marked" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="h-12 w-12 rounded-full border-4 animate-spin" style={{ borderColor: O.soft, borderTopColor: O.mid }} />
    </div>
  );

  return (
    <div className="min-h-full animate-fade-in" style={{ background: "linear-gradient(135deg, #fff9f5 0%, #fff 60%, #fff5ee 100%)" }}>
      <PageHero eyebrow="Daily Log" title="Punch-In Center" subtitle="Mark your daily attendance to start receiving assignments" icon={CalendarCheck} />

      <div className="px-8 pb-10">
        {/* Date pill */}
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-3 bg-white border rounded-2xl px-5 py-3 shadow-sm" style={{ borderColor: O.muted }}>
            <CalendarIcon className="h-4 w-4" style={{ color: O.mid }} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${O.dark}60` }}>Today's Date</p>
              <p className="text-sm font-black" style={{ color: O.dark }}>
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Punch Card */}
          <div className="lg:col-span-2">
            <div className={`relative overflow-hidden bg-white rounded-[50px] border shadow-2xl text-center p-12 lg:p-20 space-y-10 transition-all ${marked ? "opacity-90" : ""}`}
              style={{ borderColor: O.muted, boxShadow: `0 20px 60px -10px rgba(192,98,45,0.15)` }}>
              {/* Glow ring behind icon */}
              <div className="relative flex justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full blur-2xl opacity-20 transition-all duration-700"
                    style={{ background: marked ? "#22c55e" : O.mid }} />
                </div>
                <div className={`relative h-24 w-24 rounded-full flex items-center justify-center transition-all duration-700 ${marked ? "scale-110" : "animate-pulse"}`}
                  style={{ background: marked ? `linear-gradient(135deg, #059669, #10b981)` : `linear-gradient(135deg, ${O.mid}, ${O.bright})` }}>
                  {marked ? <Upload className="h-10 w-10 text-white rotate-180" /> : <CalendarCheck className="h-10 w-10 text-white" />}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-4xl font-black" style={{ color: O.dark }}>
                  {marked ? "All Done for Today!" : "Ready for Duty?"}
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${O.dark}50` }}>
                  {marked ? "You have successfully clocked in." : "Please punch in to start receiving assignments."}
                </p>
              </div>

              {!marked && (
                <button onClick={markAttendance}
                  className="inline-flex items-center gap-3 px-16 py-5 rounded-full text-white font-black text-lg shadow-2xl hover:scale-105 transition-all duration-300"
                  style={{ background: `linear-gradient(135deg, ${O.dark}, ${O.mid})`, boxShadow: `0 12px 30px rgba(192,98,45,0.4)` }}>
                  <CalendarCheck className="h-5 w-5" /> Confirm Arrival
                </button>
              )}

              {marked && (
                <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-black text-lg border"
                  style={{ background: "#ecfdf5", color: "#065f46", borderColor: "#6ee7b7" }}>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Marked at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>
          </div>

          {/* Rules Card */}
          <div className="space-y-6">
            <div className="rounded-[40px] p-8 text-white relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${O.dark}, ${O.accent})` }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
              <h4 className="relative text-lg font-black italic mb-6">Attendance Rules</h4>
              <ul className="relative space-y-5">
                {[
                  { title: "Punctuality", desc: "Clock in before 9 AM daily." },
                  { title: "Geo-Fencing", desc: "Must be within service zone." },
                  { title: "Uniform",     desc: "Formal CleanMate t-shirt." },
                ].map((rule, i) => (
                  <li key={i} className="pl-4 border-l-2 space-y-1" style={{ borderColor: `${O.bright}60` }}>
                    <p className="font-black text-sm uppercase tracking-widest">{rule.title}</p>
                    <p className="text-xs font-semibold opacity-50 leading-relaxed">{rule.desc}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick stats */}
            {[
              { label: "Shift Start", val: "9:00 AM" },
              { label: "Shift End",   val: "6:00 PM" },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white rounded-2xl border p-5 flex items-center justify-between" style={{ borderColor: O.muted }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: `${O.dark}60` }}>{label}</span>
                <span className="font-black text-sm" style={{ color: O.dark }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PORTFOLIO
// ─────────────────────────────────────────────
export function AgentPortfolio() {
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>(["Deep Cleaning", "Eco-Sanitization", "Kitchen Deep Clean"]);
  const [isAdding, setIsAdding] = useState(false);
  const [viewingProject, setViewingProject] = useState<any | null>(null);
  const { toast } = useToast();

  const [newProject, setNewProject] = useState<any>({
    title: "", description: "", category: "General",
    images: [] as string[], date: new Date().toISOString().split("T")[0], beforeAfter: null as any,
  });

  useEffect(() => {
    agentAPI.getPortfolio().then((res) => {
      if (res.data.images && res.data.images.length > 0) {
        setProjects([{
          id: "1", title: "Premium Home Restoration",
          description: "Complete deep cleaning for a 3BHK apartment in Mumbai.",
          images: res.data.images, category: "Deep Cleaning", date: "2024-03-15", beforeAfter: null,
        }]);
      }
    }).catch(() => {});
  }, []);

  const handleAddProject = () => {
    if (!newProject.title || !newProject.description || newProject.images.length === 0) {
      toast({ title: "Validation Error", description: "Title, description and at least 1 image are required.", variant: "destructive" });
      return;
    }
    setProjects([...projects, { ...newProject, id: Date.now().toString() }]);
    setIsAdding(false);
    setNewProject({ title: "", description: "", category: "General", images: [], date: new Date().toISOString().split("T")[0], beforeAfter: null });
    toast({ title: "✅ Project Created" });
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    toast({ title: "Project Deleted" });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "regular" | "before" | "after" = "regular") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      if (type === "regular") setNewProject({ ...newProject, images: [...newProject.images, b64] });
      else if (type === "before") setNewProject({ ...newProject, beforeAfter: { ...newProject.beforeAfter, before: b64 } });
      else setNewProject({ ...newProject, beforeAfter: { ...newProject.beforeAfter, after: b64 } });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-full animate-fade-in" style={{ background: "linear-gradient(135deg, #fff9f5 0%, #fff 60%, #fff5ee 100%)" }}>
      <PageHero eyebrow="Agent Showroom" title="My Portfolio" subtitle="Showcase your best work to attract more customers" icon={Briefcase} />

      <div className="px-8 pb-10 space-y-10">
        {/* Action header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${O.dark}60` }}>{projects.length} project{projects.length !== 1 ? "s" : ""} published</p>
          </div>
          <button onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-black text-sm shadow-lg hover:scale-105 transition-all"
            style={{ background: `linear-gradient(135deg, ${O.dark}, ${O.mid})`, boxShadow: `0 8px 24px rgba(192,98,45,0.35)` }}>
            <Plus className="h-4 w-4" /> Add New Project
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Skills */}
            <div className="rounded-3xl border p-8 space-y-5" style={{ background: O.soft, borderColor: O.muted }}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black italic" style={{ color: O.dark }}>Expertise</h3>
                <div className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                  style={{ background: O.muted, color: O.mid }}>
                  <Plus className="h-4 w-4" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <div key={skill} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-white group cursor-pointer"
                    style={{ borderColor: O.muted, color: O.dark }}>
                    {skill}
                    <X className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: "#991b1b" }}
                      onClick={() => setSkills(skills.filter(s => s !== skill))} />
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-4">
              <h3 className="text-lg font-black italic" style={{ color: O.dark }}>Recent Reviews</h3>
              {[
                { name: "Suresh P.", rating: 5, comment: "Incredible attention to detail in the kitchen." },
                { name: "Anita D.", rating: 4, comment: "Punctual and professional work." },
              ].map((r, i) => (
                <div key={i} className="p-6 rounded-2xl border bg-white space-y-3 shadow-sm hover:shadow-md transition-all" style={{ borderColor: O.muted }}>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-current" : "text-gray-200"}`} style={s <= r.rating ? { color: O.bright } : {}} />)}
                  </div>
                  <p className="text-sm font-semibold italic leading-relaxed" style={{ color: `${O.dark}80` }}>"{r.comment}"</p>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${O.dark}50` }}>— {r.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="lg:col-span-3">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 rounded-3xl border-2 border-dashed text-center space-y-6"
                style={{ borderColor: O.muted, background: `${O.soft}80` }}>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: O.muted }}>
                  <Briefcase className="h-10 w-10" style={{ color: O.mid }} />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic" style={{ color: O.dark }}>Your Showroom is Empty</h3>
                  <p className="text-xs font-bold uppercase tracking-widest mt-2" style={{ color: `${O.dark}50` }}>Create your first project to showcase your expertise</p>
                </div>
                <button onClick={() => setIsAdding(true)}
                  className="px-10 py-4 rounded-full font-black border text-sm transition-all hover:scale-105"
                  style={{ borderColor: O.muted, color: O.dark, background: "white" }}>
                  Start First Project
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {projects.map(p => (
                  <div key={p.id} className="group bg-white rounded-3xl border shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                    style={{ borderColor: O.muted }}>
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md"
                        style={{ background: `${O.soft}DD`, color: O.dark, borderColor: O.muted }}>
                        {p.category}
                      </div>
                    </div>
                    <div className="p-7 space-y-3" style={{ borderTop: `3px solid ${O.muted}` }}>
                      <h4 className="text-xl font-black" style={{ color: O.dark }}>{p.title}</h4>
                      <p className="text-sm font-medium leading-relaxed line-clamp-2" style={{ color: `${O.dark}70` }}>{p.description}</p>
                      <div className="pt-3 flex items-center justify-between">
                        <button onClick={() => setViewingProject(p)}
                          className="flex items-center gap-1.5 text-sm font-black transition-all hover:gap-2.5"
                          style={{ color: O.mid }}>
                          View Details <ArrowRight className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteProject(p.id)}
                          className="h-9 w-9 rounded-full flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 lg:p-16 overflow-y-auto"
          style={{ background: `${O.dark}CC` }}>
          <div className="bg-white w-full max-w-4xl rounded-[60px] p-10 lg:p-16 space-y-10 shadow-2xl relative">
            <button onClick={() => setIsAdding(false)}
              className="absolute top-8 right-8 h-12 w-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: O.soft, color: O.mid }}>
              <X className="h-5 w-5" />
            </button>
            <div>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: O.bright }}>Creation Suite</span>
              <h2 className="text-4xl font-black italic mt-1" style={{ color: O.dark }}>Add New Project</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                {[
                  { label: "Project Title", key: "title", type: "input", placeholder: "e.g. Living Room Restoration" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${O.dark}60` }}>{label}</label>
                    <input type="text" placeholder={placeholder}
                      className="w-full border-2 rounded-2xl px-5 py-4 text-base font-black outline-none transition-all"
                      style={{ background: O.soft, borderColor: "transparent", color: O.dark }}
                      onFocus={e => (e.target.style.borderColor = O.mid)}
                      onBlur={e => (e.target.style.borderColor = "transparent")}
                      value={newProject[key]}
                      onChange={e => setNewProject({ ...newProject, [key]: e.target.value })} />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${O.dark}60` }}>Description</label>
                  <textarea rows={4} placeholder="Describe your work..."
                    className="w-full border-2 rounded-2xl px-5 py-4 font-semibold outline-none transition-all resize-none"
                    style={{ background: O.soft, borderColor: "transparent", color: O.dark }}
                    onFocus={e => (e.target.style.borderColor = O.mid)}
                    onBlur={e => (e.target.style.borderColor = "transparent")}
                    value={newProject.description}
                    onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${O.dark}60` }}>Category</label>
                    <Select onValueChange={(v) => setNewProject({ ...newProject, category: v })}>
                      <SelectTrigger className="rounded-2xl h-12 border-none font-black" style={{ background: O.soft, color: O.dark }}>
                        <SelectValue placeholder="Choose" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {["Kitchen", "Bathroom", "Office", "Full Home", "Deep Cleaning"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${O.dark}60` }}>Date</label>
                    <input type="date" className="w-full rounded-2xl h-12 px-4 font-black outline-none border-none"
                      style={{ background: O.soft, color: O.dark }}
                      value={newProject.date}
                      onChange={e => setNewProject({ ...newProject, date: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${O.dark}60` }}>Project Images</label>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {newProject.images.map((img: string, i: number) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2" style={{ borderColor: O.mid }}>
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div onClick={() => { const ip = document.createElement("input"); ip.type = "file"; ip.accept = "image/*"; ip.onchange = (e: any) => handleImageUpload(e); ip.click(); }}
                      className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all"
                      style={{ borderColor: O.muted, background: O.soft }}>
                      <Plus className="h-6 w-6" style={{ color: O.mid }} />
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl border space-y-3" style={{ background: O.soft, borderColor: O.muted }}>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${O.dark}60` }}>Before &amp; After</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(["before", "after"] as const).map(type => (
                      <div key={type} onClick={() => { const ip = document.createElement("input"); ip.type = "file"; ip.accept = "image/*"; ip.onchange = (e: any) => handleImageUpload(e, type); ip.click(); }}
                        className="aspect-video rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer bg-white"
                        style={{ borderColor: O.muted }}>
                        {newProject.beforeAfter?.[type]
                          ? <img src={newProject.beforeAfter[type]} className="w-full h-full object-cover rounded-xl" />
                          : <p className="text-[10px] font-black uppercase" style={{ color: `${O.dark}40` }}>{type}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-6 flex gap-4">
              <button onClick={() => setIsAdding(false)}
                className="flex-1 py-5 rounded-full font-black border text-lg transition-all hover:scale-105"
                style={{ borderColor: O.muted, color: O.dark }}>Discard</button>
              <button onClick={handleAddProject}
                className="flex-[2] py-5 rounded-full font-black text-white text-lg shadow-2xl transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${O.dark}, ${O.mid})` }}>Publish Project</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {viewingProject && (
        <div className="fixed inset-0 z-50 backdrop-blur-3xl flex items-center justify-center p-4 lg:p-16 overflow-y-auto"
          style={{ background: `${O.dark}F0` }}>
          <div className="bg-white w-full max-w-6xl rounded-[60px] p-10 lg:p-16 grid lg:grid-cols-2 gap-16 shadow-2xl relative">
            <button onClick={() => setViewingProject(null)}
              className="absolute top-8 right-8 h-12 w-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: O.soft, color: O.mid }}>
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-8">
              <div>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: O.bright }}>{viewingProject.category} · {viewingProject.date}</span>
                <h2 className="text-5xl font-black italic leading-tight mt-2" style={{ color: O.dark }}>{viewingProject.title}</h2>
                <p className="mt-4 text-lg leading-relaxed" style={{ color: `${O.dark}70` }}>{viewingProject.description}</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-6 py-3 rounded-full font-black border text-sm" style={{ borderColor: O.muted, color: O.dark }}>
                  <Edit className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => { deleteProject(viewingProject.id); setViewingProject(null); }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-black border text-sm text-red-500 hover:bg-red-50 transition-all"
                  style={{ borderColor: "#fca5a5" }}>
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {viewingProject.images.map((img: string, i: number) => (
                <div key={i} className={`rounded-3xl overflow-hidden shadow-lg ${i === 0 ? "col-span-2 aspect-video" : "aspect-square"}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────────────
export function AgentDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    agentAPI.getDocuments().then((res) => setDocuments(res.data.documents || [])).catch(() => {});
  }, []);

  const handleUpload = async (docType: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", docType);
      try {
        const res = await agentAPI.uploadDocument(formData);
        setDocuments(res.data.documents);
        toast({ title: "✅ Document Uploaded" });
      } catch (error: any) {
        toast({ title: "Error", description: error.response?.data?.message || "Upload failed", variant: "destructive" });
      }
    };
    input.click();
  };

  const docTypes = ["ID Proof", "Address Proof", "Background Check"];

  return (
    <div className="min-h-full animate-fade-in" style={{ background: "linear-gradient(135deg, #fff9f5 0%, #fff 60%, #fff5ee 100%)" }}>
      <PageHero eyebrow="Verify Account" title="Authentication Center" subtitle="Upload your documents to become a verified agent" icon={Shield} />

      <div className="px-8 pb-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Documents List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border shadow-lg p-8 space-y-8" style={{ borderColor: O.muted, boxShadow: `0 12px 40px rgba(192,98,45,0.1)` }}>
              <div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: O.muted }}>
                <div>
                  <h3 className="text-2xl font-black" style={{ color: O.dark }}>Required Documents</h3>
                  <p className="text-xs font-semibold mt-1" style={{ color: `${O.dark}60` }}>{documents.length}/{docTypes.length} uploaded</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl border animate-pulse"
                  style={{ background: "#ecfdf5", borderColor: "#6ee7b7" }}>
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Guaranteed</span>
                </div>
              </div>

              <div className="space-y-4">
                {docTypes.map((doc) => {
                  const uploaded = documents.find((d: any) => d.type === doc);
                  const statusColors = {
                    approved: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
                    rejected: { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" },
                    pending:  { bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
                  };
                  const sc = uploaded ? statusColors[uploaded.status as keyof typeof statusColors] || statusColors.pending : null;

                  return (
                    <div key={doc} className="flex items-center justify-between p-6 rounded-2xl border group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                      style={{ background: uploaded ? O.soft : "#fafafa", borderColor: uploaded ? O.muted : "#e5e7eb" }}>
                      <div className="flex items-center gap-5">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm`}
                          style={uploaded
                            ? { background: `linear-gradient(135deg, ${O.mid}, ${O.bright})` }
                            : { background: O.soft, border: `2px dashed ${O.muted}` }}>
                          {uploaded ? <CheckCircle2 className="h-7 w-7 text-white" /> : <FileText className="h-7 w-7" style={{ color: O.muted }} />}
                        </div>
                        <div>
                          <span className="font-black text-base" style={{ color: O.dark }}>{doc}</span>
                          {uploaded && sc ? (
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="h-1.5 w-1.5 rounded-full animate-pulse"
                                style={{ background: uploaded.status === "approved" ? "#22c55e" : uploaded.status === "rejected" ? "#ef4444" : "#f59e0b" }} />
                              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: sc.text }}>
                                {uploaded.status}
                              </span>
                            </div>
                          ) : (
                            <p className="text-[11px] font-bold uppercase tracking-wider mt-1" style={{ color: `${O.dark}40` }}>Waiting for Upload</p>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleUpload(doc)}
                        className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 shadow-md"
                        style={uploaded
                          ? { background: O.soft, color: O.dark, border: `1px solid ${O.muted}`, boxShadow: "none" }
                          : { background: `linear-gradient(135deg, ${O.dark}, ${O.mid})`, color: "white", boxShadow: `0 6px 20px rgba(192,98,45,0.35)` }}>
                        {uploaded ? "Re-upload" : "Upload"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl p-10 text-white relative overflow-hidden min-h-[400px] flex flex-col justify-between"
              style={{ background: `linear-gradient(135deg, ${O.dark}, ${O.accent})` }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5" style={{ background: "white", transform: "translate(-30%, 30%)" }} />

              <div className="relative space-y-5">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-4xl font-black italic leading-tight">
                  Why Security <br /><span style={{ color: O.bright }}>Matters.</span>
                </h3>
                <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Verification ensures trust in our community. We encrypt all sensitive data to ensure your privacy is never compromised.
                </p>
              </div>

              <div className="relative pt-8 border-t grid grid-cols-2 gap-6" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1" style={{ color: O.bright }}>Speed</p>
                  <p className="text-xl font-black">24–48 Hours</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1" style={{ color: O.bright }}>Badge</p>
                  <p className="text-xl font-black italic" style={{ color: O.bright }}>GUARANTEED</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// UPDATE STATUS
// ─────────────────────────────────────────────
export function AgentUpdateStatus() {
  const { toast } = useToast();
  const [status, setStatus] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agentAPI.getRequests().then((res) => {
      const active = res.data.filter((r: any) => r.status === "approved" || r.status === "in-progress");
      setBookings(active);
      if (active.length > 0) setSelectedBooking(active[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async () => {
    if (!status || !selectedBooking) return;
    try {
      await agentAPI.updateBookingStatus(selectedBooking, status);
      toast({ title: "✅ Status Updated", description: `Job status changed to ${status}` });
      setBookings(bookings.map((b) => b.id === selectedBooking ? { ...b, status } : b));
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="h-12 w-12 rounded-full border-4 animate-spin" style={{ borderColor: O.soft, borderTopColor: O.mid }} />
    </div>
  );

  const statusOptions = [
    { value: "in-progress", label: "In Progress",  desc: "Started working on this job",  color: O.mid },
    { value: "completed",   label: "Completed",    desc: "Job finished successfully",    color: "#059669" },
  ];

  const selected = bookings.find(b => b.id === selectedBooking);

  return (
    <div className="min-h-full animate-fade-in" style={{ background: "linear-gradient(135deg, #fff9f5 0%, #fff 60%, #fff5ee 100%)" }}>
      <PageHero eyebrow="Job Management" title="Update Service Status" subtitle="Keep customers informed by updating your job progress" icon={RefreshCw} />

      <div className="px-8 pb-10">
        {bookings.length === 0 ? (
          <div className="text-center py-24">
            <div className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ background: O.soft }}>
              <AlertTriangle className="h-10 w-10" style={{ color: O.muted }} />
            </div>
            <p className="text-xl font-black" style={{ color: O.dark }}>No Active Bookings</p>
            <p className="text-sm mt-2 font-semibold" style={{ color: `${O.dark}60` }}>You have no approved or in-progress bookings to update.</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Current booking selector */}
            <div className="bg-white rounded-3xl border p-8 space-y-6 shadow-lg" style={{ borderColor: O.muted, boxShadow: `0 12px 40px rgba(192,98,45,0.1)` }}>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest block mb-3" style={{ color: `${O.dark}60` }}>Select Booking</label>
                <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                  <SelectTrigger className="rounded-2xl h-14 border-2 font-black" style={{ borderColor: O.muted, color: O.dark }}>
                    <SelectValue placeholder="Select a booking" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {bookings.map((b: any) => (
                      <SelectItem key={b.id} value={b.id} className="font-semibold">
                        {b.serviceType} – {b.variant} ({b.customerName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected booking detail */}
              {selected && (
                <div className="rounded-2xl p-5 border" style={{ background: O.soft, borderColor: O.muted }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: `${O.dark}60` }}>Current Job</p>
                  <p className="font-black text-base" style={{ color: O.dark }}>{selected.serviceType} · {selected.variant}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: `${O.dark}70` }}>{selected.customerName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: O.mid }} />
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: O.mid }}>{selected.status}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status selector */}
            <div className="bg-white rounded-3xl border p-8 space-y-6 shadow-lg" style={{ borderColor: O.muted }}>
              <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: `${O.dark}60` }}>New Status</label>
              <div className="grid grid-cols-2 gap-4">
                {statusOptions.map(opt => (
                  <button key={opt.value} onClick={() => setStatus(opt.value)}
                    className="p-5 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5 duration-200"
                    style={status === opt.value
                      ? { borderColor: opt.color, background: `${opt.color}12` }
                      : { borderColor: "#e5e7eb", background: "#fafafa" }}>
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: status === opt.value ? opt.color : "#e5e7eb" }}>
                      <RefreshCw className="h-4 w-4" style={{ color: status === opt.value ? "white" : "#9ca3af" }} />
                    </div>
                    <p className="font-black text-sm" style={{ color: status === opt.value ? opt.color : O.dark }}>{opt.label}</p>
                    <p className="text-[10px] mt-0.5 font-semibold text-slate-400">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <button onClick={updateStatus} disabled={!status || !selectedBooking}
                className="w-full py-5 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{ background: `linear-gradient(135deg, ${O.dark}, ${O.mid})`, boxShadow: `0 8px 30px rgba(192,98,45,0.35)` }}>
                <RefreshCw className="h-5 w-5" /> Update Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
