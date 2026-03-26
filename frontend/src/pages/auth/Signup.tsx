import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "@/assets/logo.svg";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types";

export default function Signup() {
  const [form, setForm] = useState({ fullName: "", email: "", address: "", phone: "", role: "" as UserRole, username: "", password: "" });
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = (p: string) => {
    if (p.length === 0) return { label: "", color: "" };
    if (p.length < 4) return { label: "Weak", color: "bg-destructive" };
    if (p.length < 8) return { label: "Medium", color: "bg-warning" };
    return { label: "Strong", color: "bg-success" };
  };

  const strength = passwordStrength(form.password);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '');
    if (digits.length > 10) {
      setPhoneError("Phone number must be exactly 10 digits");
    } else {
      setPhoneError("");
    }
    setForm({ ...form, phone: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) { toast({ title: "Error", description: "Please select a role", variant: "destructive" }); return; }
    if (!form.email) { toast({ title: "Error", description: "Please enter an email", variant: "destructive" }); return; }
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length !== 10) { toast({ title: "Error", description: "Phone number must be exactly 10 digits", variant: "destructive" }); return; }
    setIsLoading(true);
    try {
      const result = await signup({ ...form, role: form.role });
      if (result.success) {
        toast({ title: "✅ Registration Successful", description: "Please login with your credentials" });
        navigate("/login");
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#1a2e1a]">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2C5F2D] rounded-full blur-[120px] opacity-40" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#97BC62] rounded-full blur-[120px] opacity-20" />
      
      <div className="w-full max-w-2xl relative z-10 animate-fade-in py-8">
        <div className="text-center mb-6">
          <div className="inline-flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl mb-2 overflow-hidden">
              <img src={logo} alt="CleanMate" className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white">CleanMate</h1>
            <p className="text-sm text-white/60 tracking-widest uppercase">Deep Cleaning Platform</p>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-[2.5rem] shadow-2xl border border-white/20 p-8 md:p-12 relative overflow-hidden group">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 gap-3 mb-8 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 rounded-xl transition-all"
            onClick={loginWithGoogle}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-4 text-white/40 font-medium">Or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white/80 ml-1">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  value={form.fullName} 
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
                  required 
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-12 focus:bg-black/40 transition-all rounded-xl border-2 focus:border-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 ml-1">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  required 
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-12 focus:bg-black/40 transition-all rounded-xl border-2 focus:border-white/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-white/80 ml-1">Address</Label>
              <Textarea 
                id="address" 
                placeholder="Enter your full address" 
                rows={2} 
                value={form.address} 
                onChange={(e) => setForm({ ...form, address: e.target.value })} 
                required 
                className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:bg-black/40 transition-all rounded-xl border-2 focus:border-white/30 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/80 ml-1">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="10-digit phone number" 
                  value={form.phone} 
                  onChange={handlePhoneChange} 
                  required 
                  className={`bg-black/20 border-white/10 text-white placeholder:text-white/30 h-12 focus:bg-black/40 transition-all rounded-xl border-2 ${phoneError ? 'border-red-400 focus:border-red-400' : 'focus:border-white/30'}`}
                />
                {phoneError && (
                  <p className="text-red-400 text-xs font-semibold ml-1 mt-1">{phoneError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 ml-1">Account Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white h-12 focus:bg-black/40 transition-all rounded-xl border-2 focus:border-white/30">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2e1a] border-white/10 text-white">
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="agent">Cleaning Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80 ml-1">Username</Label>
                <Input 
                  id="username" 
                  placeholder="Choose a username" 
                  value={form.username} 
                  onChange={(e) => setForm({ ...form, username: e.target.value })} 
                  required 
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-12 focus:bg-black/40 transition-all rounded-xl border-2 focus:border-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80 ml-1">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Create a strong password" 
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })} 
                  required 
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-12 focus:bg-black/40 transition-all rounded-xl border-2 focus:border-white/30"
                />
                {form.password && (
                  <div className="flex items-center gap-2 mt-2 px-1">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${strength.color}`} 
                        style={{ width: form.password.length < 4 ? "33%" : form.password.length < 8 ? "66%" : "100%" }} 
                      />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider transition-colors" style={{ color: strength.color.includes('destructive') ? '#ff4d4d' : strength.color.includes('warning') ? '#ffcc00' : '#4ade80' }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 mt-4 bg-white text-[#1a2e1a] hover:bg-white/90 font-bold rounded-xl shadow-lg transition-transform active:scale-95" 
              disabled={isLoading}
            >
              {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-white/50">
            Already have an account?{" "}
            <Link to="/login" className="text-white font-bold hover:underline">LOG IN</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
