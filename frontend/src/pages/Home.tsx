import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, Shield, Clock, Droplets, ArrowRight, 
  Phone, Mail, Star, CheckCircle2, Leaf, 
  Wind, Building2, UserCheck, MessageSquare,
  Smartphone, Award
} from "lucide-react";
import logo from "@/assets/logo.svg";

const SERVICES = [
  { 
    icon: Wind, 
    title: "Deep Cleaning", 
    desc: "A thorough, detailed cleaning that reaches every hidden corner of your home, ensuring a pristine living space.",
    bg: "bg-brand-soft"
  },
  { 
    icon: Building2, 
    title: "Commercial Cleaning", 
    desc: "Maintain a professional and healthy workspace for your employees with our tailored office cleaning solutions.",
    bg: "bg-brand-soft"
  },
  { 
    icon: Leaf, 
    title: "Eco Sanitization", 
    desc: "Using only eco-friendly, non-toxic products to disinfect your environment safely for families and pets.",
    bg: "bg-brand-soft"
  },
  { 
    icon: Droplets, 
    title: "Window Cleaning", 
    desc: "Streak-free, crystal clear windows that invite natural light and enhance the beauty of your property.",
    bg: "bg-brand-soft"
  }
];

const EQUIPMENT = [
  { name: "Eco-HEPA Vacuum", image: "/images/vacuum_new.png" },
  { name: "Fiber Cloths", image: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=400&auto=format&fit=crop" },
  { name: "Steam Purifiers", image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=400&auto=format&fit=crop" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-brand-dark overflow-x-hidden">
      {/* Top Contact Bar */}
      <div className="bg-brand-dark text-white py-2 px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[13px] font-medium opacity-90">
          <div className="flex items-center gap-6">
            <a href="tel:+911234567890" className="flex items-center gap-2 hover:text-brand-light transition-colors">
              <Phone className="h-3.5 w-3.5 text-brand-light" /> +91 123 456 7890
            </a>
            <a href="mailto:hello@cleanmate.com" className="flex items-center gap-2 hover:text-brand-light transition-colors">
              <Mail className="h-3.5 w-3.5 text-brand-light" /> hello@cleanmate.com
            </a>
          </div>
          <div className="flex items-center gap-4 italic text-brand-light">
            <Leaf className="h-3 w-3" /> Eco-Friendly Choice for Your Home
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-brand-dark rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-brand-light" />
            </div>
            <span className="text-2xl font-display font-extrabold tracking-tight text-brand-dark italic">CleanMate</span>
          </div>

          <div className="hidden lg:flex flex-1 justify-center gap-10">
            {['Home', 'Services', 'Quality', 'Our Team', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[15px] font-semibold text-brand-dark/80 hover:text-brand-dark hover:underline decoration-brand-light decoration-2 underline-offset-8 transition-all">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-brand-dark hover:text-brand-dark/70 font-bold">Log in</Button>
              </Link>
              <Link to="/signup?role=customer">
                <Button className="green-gradient text-white hover:opacity-90 rounded-full px-8 h-12 font-bold shadow-lg shadow-brand-dark/10">
                  Book Now
                </Button>
              </Link>
            </div>
            
            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="lg:hidden text-brand-dark" onClick={() => {
              const menu = document.getElementById('mobile-menu');
              if (menu) menu.classList.toggle('hidden');
            }}>
              <Wind className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div id="mobile-menu" className="hidden lg:hidden bg-white border-b border-gray-100 animate-slide-in">
          <div className="flex flex-col p-6 space-y-4">
            {['Home', 'Services', 'Quality', 'Our Team', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
                className="text-lg font-bold text-brand-dark hover:text-brand-light transition-colors"
              >
                {item}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-4">
              <Link to="/login" onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}>
                <Button variant="outline" className="w-full h-12 rounded-full font-bold">Log in</Button>
              </Link>
              <Link to="/signup?role=customer" onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}>
                <Button className="w-full h-12 rounded-full green-gradient text-white font-bold">Book Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section id="home" className="relative pt-10 pb-20 lg:pt-20 lg:pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-16">
            <div className="space-y-10 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-soft border border-brand-light/20 text-brand-dark text-sm font-bold">
                < Award className="h-4 w-4 text-brand-light" /> #1 Eco-Cleaning Service in India
              </div>
              
              <h1 className="text-6xl lg:text-[80px] font-display font-black leading-[1] text-brand-dark">
                Sparkling Spaces,<br />
                <span className="text-brand-light drop-shadow-sm italic">Exceptional</span> Results
              </h1>

              <p className="text-xl text-brand-dark/60 max-w-xl leading-relaxed">
                Transform your home with our premium, eco-friendly cleaning services. We use non-toxic products to ensure a safe, healthy, and pristine environment for your family.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <Button size="lg" className="green-gradient text-white rounded-full px-10 h-16 text-lg font-bold shadow-2xl hover:scale-105 transition-transform">
                  Book an Appointment
                </Button>
                <a href="tel:+911234567890" className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="h-14 w-14 rounded-full border-2 border-brand-light flex items-center justify-center group-hover:bg-brand-light/10 transition-colors">
                    <Smartphone className="h-6 w-6 text-brand-dark" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Call us Today</p>
                    <p className="text-lg font-black text-brand-dark">+91 123 456 7890</p>
                  </div>
                </a>
              </div>

              {/* Trust Section Badges (Figure Style) */}
              <div className="flex items-center gap-10 pt-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-3">
                      {['/images/expert.png', '/images/expert_woman.png', '/images/expert_man.png', '/images/customer_3.png', '/images/customer_4.png', '/images/expert_team.png'].map((img, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden`}>
                           <img src={img} alt="user" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-xl font-black text-brand-dark ml-2">50K+</span>
                  </div>
                  <p className="text-xs font-bold text-brand-dark/40 uppercase tracking-widest">Satisfied Customers</p>
                </div>
                <div className="h-12 w-[1px] bg-gray-100"></div>
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-brand-light text-brand-light" />)}
                  </div>
                  <p className="text-xs font-bold text-brand-dark/40 uppercase tracking-widest">4.9/5 Average Rating</p>
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="absolute -inset-4 bg-brand-light/10 rounded-[60px] blur-3xl opacity-50"></div>
              <div className="relative rounded-[60px] overflow-hidden border-8 border-white shadow-2xl aspect-[4/5]">
                <img src="/images/hero_main.png" alt="Clean Home" className="w-full h-full object-cover" />
                <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-xl">
                  <p className="text-brand-dark font-black text-lg italic">"Everything about CleanMate is professional. My house has never looked so fresh!"</p>
                  <p className="text-brand-dark/40 font-bold text-sm mt-2">— Sarah Johnson, Mumbai</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUALITY COMMITMENT SECTION */}
        <section id="quality" className="py-24 bg-brand-soft/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="flex-1 w-full grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="h-[250px] rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                    <img src="https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=800&auto=format&fit=crop" alt="Eco" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-brand-dark p-8 rounded-3xl text-white space-y-4">
                    <Leaf className="h-10 w-10 text-brand-light" />
                    <h3 className="text-xl font-bold">100% Eco-Products</h3>
                    <p className="text-white/60 text-sm">We only use botanical extracts and natural minerals for our cleaning solutions.</p>
                  </div>
                </div>
                <div className="space-y-6 pt-12">
                  <div className="bg-brand-light p-8 rounded-3xl text-brand-dark space-y-4 shadow-xl">
                    <Award className="h-10 w-10 text-brand-dark" />
                    <h3 className="text-xl font-bold">Certified Quality</h3>
                    <p className="text-brand-dark/60 text-sm">ISO certified cleaning protocols that ensure hospital-grade sanitation.</p>
                  </div>
                  <div className="h-[250px] rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                    <img src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=800&auto=format&fit=crop" alt="Home" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <span className="text-brand-light font-black uppercase tracking-widest text-sm">Quality Commitment</span>
                  <h2 className="text-5xl font-display font-black leading-tight text-brand-dark">Our Commitment to<br /><span className="text-brand-light">Quality</span> Cleaning</h2>
                  <p className="text-lg text-brand-dark/60 leading-relaxed italic border-l-4 border-brand-light pl-6">
                    "We don't just clean spaces; we rejuvenate them. Our team is dedicated to the highest standards of eco-conscious home maintenance."
                  </p>
                </div>
                <p className="text-brand-dark/60 text-base leading-relaxed">
                  Choosing CleanMate means choosing a service that cares about your health and the planet. Our professionals are vetted, trained, and equipped with the latest sustainable technology to deliver results that truly shine.
                </p>
                <div className="grid grid-cols-2 gap-y-6">
                  {['Expert Professionals', '100% Satisfaction', 'No-Chemical Policy', 'Emergency 24/7 Support'].map(item => (
                    <div key={item} className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="h-4 w-4 text-brand-light" /> {item}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="rounded-full border-brand-dark/20 text-brand-dark px-8 h-12 font-bold hover:bg-brand-soft">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-brand-light font-black uppercase tracking-[0.2em] text-xs">Our Expertise</span>
              <h2 className="text-5xl font-display font-black text-brand-dark">Fresh Solutions for Every Space</h2>
              <div className="h-1 w-20 bg-brand-light mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {SERVICES.map((s, i) => (
                <div key={i} className="group p-10 rounded-[40px] border border-gray-100 bg-white hover:bg-brand-dark transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-2xl">
                  <div className={`w-16 h-16 rounded-2xl ${s.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    <s.icon className="h-8 w-8 text-brand-dark" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 group-hover:text-white transition-colors">{s.title}</h3>
                  <p className="text-brand-dark/50 text-base leading-relaxed group-hover:text-white/60 transition-colors uppercase text-[12px] font-bold tracking-wider">
                    {s.desc}
                  </p>
                  <Link to="/" className="inline-flex items-center gap-2 mt-6 text-brand-light font-black group-hover:text-white transition-colors">
                    Explore <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EQUIPMENT SHOWCASE */}
        <section className="py-24 bg-brand-dark text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-light/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
           
           <div className="max-w-7xl mx-auto px-6">
             <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-10">
               <div className="space-y-4">
                 <span className="text-brand-light font-black uppercase tracking-widest text-sm">Advanced Tools</span>
                 <h2 className="text-5xl font-display font-black">Our Trusted<br />Cleaning Equipment</h2>
               </div>
               <p className="text-white/40 max-w-md italic border-l border-white/10 pl-8">
                 We invest in the latest low-energy, high-efficiency equipment to reduce our carbon footprint while providing industry-leading results.
               </p>
             </div>

             <div className="grid md:grid-cols-3 gap-10">
               {EQUIPMENT.map((item, i) => (
                 <div key={i} className="group bg-white/5 border border-white/10 rounded-[50px] p-10 hover:bg-white/10 transition-all duration-500">
                    <div className="h-56 relative mb-8 flex items-center justify-center">
                      <div className="absolute inset-0 bg-brand-light/5 rounded-full scale-75 blur-xl group-hover:scale-100 transition-transform duration-700"></div>
                      <img src={item.image} alt={item.name} className="relative z-10 max-h-full object-contain drop-shadow-2xl group-hover:rotate-6 transition-transform duration-500" />
                    </div>
                    <div className="text-center space-y-2">
                       <h4 className="text-2xl font-black">{item.name}</h4>
                       <p className="text-brand-light uppercase text-xs font-bold tracking-widest">Premium Choice</p>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <span className="text-brand-light font-black uppercase tracking-widest text-sm">Customer Stories</span>
                  <h2 className="text-5xl font-display font-black text-brand-dark leading-tight">People Love Our<br />Eco-Care</h2>
                </div>
                
                <div className="space-y-8">
                  {[
                    { 
                      name: "Anita Desai", 
                      role: "Homeowner", 
                      image: "/images/expert_woman.png",
                      text: "The team arrived on time and used products that didn't leave any chemical smell. My kids have allergies, so this was perfect for us." 
                    },
                    { 
                      name: "Rahul Sharma", 
                      role: "CEO, TechOffice", 
                      image: "/images/expert_man.png",
                      text: "CleanMate manages our daily office cleaning across 3 floors. They are silent, efficient, and very professional." 
                    },
                    { 
                      name: "Meera Iyer", 
                      role: "Interior Designer", 
                      image: "/images/customer_3.png",
                      text: "I recommend CleanMate to all my clients. Their attention to detail and eco-friendly approach is unmatched." 
                    },
                    { 
                      name: "Amitabh Kumar", 
                      role: "Property Manager", 
                      image: "/images/customer_4.png",
                      text: "Managing over 50 residential units requires a partner you can trust. CleanMate is consistently exceptional." 
                    }
                  ].map((t, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative group hover:shadow-xl transition-all">
                       <div className="absolute -top-4 -left-4 h-10 w-10 bg-brand-light rounded-2xl flex items-center justify-center text-brand-dark">
                         <MessageSquare className="h-5 w-5" />
                       </div>
                       <p className="text-brand-dark/70 text-lg leading-relaxed italic mb-6">"{t.text}"</p>
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-brand-soft overflow-hidden">
                           <img 
                             src={t.image} 
                             alt={t.name} 
                             className="w-full h-full object-cover" 
                           />
                         </div>
                         <div>
                            <p className="font-black text-brand-dark">{t.name}</p>
                            <p className="text-[10px] font-bold uppercase text-brand-light tracking-widest">{t.role}</p>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-soft/50 rounded-[80px] p-16 space-y-12">
                <div className="text-center space-y-4">
                  <h3 className="text-4xl font-display font-black text-brand-dark">How We Work</h3>
                  <div className="h-1 w-12 bg-brand-light mx-auto"></div>
                </div>
                <div className="space-y-10">
                   {[
                     { step: "01", title: "Online Booking", desc: "Select your service and schedule in 2 minutes." },
                     { step: "02", title: "Eco-Prep", desc: "We prepare non-toxic solutions for your specific floors." },
                     { step: "03", title: "Sparkle Day", desc: "Our team arrives and works their magic." }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-8 group">
                        <span className="text-6xl font-display font-black text-brand-light/20 group-hover:text-brand-light transition-colors">{item.step}</span>
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-brand-dark">{item.title}</h4>
                          <p className="text-brand-dark/50 text-sm font-bold uppercase leading-relaxed tracking-wider">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
                <Button className="w-full h-16 rounded-full green-gradient text-white font-black text-lg shadow-xl shadow-brand-dark/10">Start Your Booking</Button>
              </div>
            </div>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section id="our-team" className="py-24 bg-brand-soft/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <span className="text-brand-light font-black uppercase tracking-widest text-sm">Meet the Experts</span>
              <h2 className="text-5xl font-display font-black text-brand-dark">Our Professional Staff</h2>
              <p className="text-brand-dark/40 font-bold uppercase text-xs tracking-[0.3em]">Trained. Vetted. Friendly.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: "Robert Fox", role: "Head of Eco-Sanitation", image: "/images/expert.png" },
                { name: "Jenny Wilson", role: "Deep Clean Expert", image: "/images/expert_woman.png" },
                { name: "Wade Warren", role: "Team Supervisor", image: "/images/expert_man.png" },
                { name: "Jane Cooper", role: "Home Care Specialist", image: "/images/expert_team.png" }
              ].map((user, i) => (
                <div key={i} className="group relative bg-white rounded-[60px] p-8 pb-12 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-brand-light/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-light/20 transition-all"></div>
                  <div className="h-56 w-56 mx-auto rounded-full bg-gray-100 p-2 mb-8 relative z-10 border-2 border-brand-light/20 group-hover:border-brand-light transition-colors">
                     <img 
                       src={user.image} 
                       alt={user.name} 
                       className="w-full h-full object-cover rounded-full" 
                     />
                  </div>
                  <div className="text-center space-y-1 relative z-10">
                    <h3 className="text-2xl font-black text-brand-dark">{user.name}</h3>
                    <p className="text-brand-light font-bold text-xs uppercase tracking-widest">{user.role}</p>
                    <div className="flex justify-center gap-3 pt-4">
                      <div className="h-8 w-8 rounded-full bg-brand-soft flex items-center justify-center hover:bg-brand-dark hover:text-white transition-all cursor-pointer">
                        <UserCheck className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* CONTACT SECTION */}
        <section id="contact" className="py-32 px-6 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-[80px] bg-brand-dark p-12 lg:p-24 overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-light/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-light/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
              
              <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-12">
                  <div className="space-y-4">
                    <span className="text-brand-light font-black uppercase tracking-[0.3em] text-xs">Get in Touch</span>
                    <h2 className="text-5xl lg:text-7xl font-display font-black text-white leading-tight">Ready for a<br /><span className="text-brand-light italic underline decoration-white/20 underline-offset-[12px]">Fresh Start?</span></h2>
                    <p className="text-white/40 text-xl max-w-md leading-relaxed">
                      We're here to help you transform your space. Send us a message and our team will get back to you within 24 hours.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8 lg:gap-12">
                    <a href="tel:+911234567890" className="group relative p-10 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 h-32 w-32 bg-brand-light/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-light/10 transition-all"></div>
                      <div className="relative z-10 space-y-6">
                        <div className="h-14 w-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-dark group-hover:scale-110 transition-transform">
                          <Phone className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-brand-light tracking-[0.3em] opacity-60">Call Us Anywhere</p>
                          <p className="text-2xl font-display font-black text-white tracking-tight">+91 123 456 7890</p>
                        </div>
                      </div>
                    </a>
                    <a href="mailto:hello@cleanmate.com" className="group relative p-8 lg:p-10 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 h-32 w-32 bg-brand-light/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-light/10 transition-all"></div>
                      <div className="relative z-10 space-y-6">
                        <div className="h-14 w-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-dark group-hover:scale-110 transition-transform">
                          <Mail className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-brand-light tracking-[0.3em] opacity-60">Message Our Team</p>
                          <p className="text-xl md:text-2xl font-display font-black text-white tracking-tight break-all">hello@cleanmate.com</p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-3xl p-10 lg:p-16 rounded-[60px] border border-white/20 shadow-2xl">
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks! We'll be in touch soon."); }}>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-light ml-2">Full Name</label>
                       <input 
                         type="text" 
                         placeholder="Your Name" 
                         className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-2xl text-white focus:outline-none focus:border-brand-light transition-all placeholder:text-white/20" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-light ml-2">Email Address</label>
                       <input 
                         type="email" 
                         placeholder="hello@company.com" 
                         className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-2xl text-white focus:outline-none focus:border-brand-light transition-all placeholder:text-white/20" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-light ml-2">Message</label>
                       <textarea 
                         rows={4}
                         placeholder="How can we help?" 
                         className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-2xl text-white focus:outline-none focus:border-brand-light transition-all placeholder:text-white/20 resize-none" 
                       />
                    </div>
                    <Button type="submit" className="w-full h-16 rounded-2xl green-gradient text-white font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-black/20">
                      Send Messsage
                    </Button>
                  </form>
                </div>
              </div>

              {/* Decorative graphic */}
              <div className="absolute -bottom-20 -right-20 w-96 h-96 opacity-10 blur-2xl">
                 <img src="/images/contact_bg.png" alt="Clean Decor" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-brand-dark text-white pt-32 pb-10 px-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-light"></div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-20 relative z-10">
          <div className="space-y-10 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-brand-light rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-brand-dark" />
              </div>
              <span className="text-2xl font-display font-extrabold tracking-tight italic">CleanMate</span>
            </div>
            <p className="text-white/40 text-[14px] leading-relaxed font-medium">
              We provide the most reliable and eco-conscious cleaning services in the country. Our focus on non-toxic products ensures your home remains a safe haven for your family.
            </p>
            <div className="flex gap-4">
              {['fb', 'tw', 'ln', 'ig'].map(s => (
                <div key={s} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-light hover:text-brand-dark transition-all cursor-pointer font-bold">
                  {s.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 lg:col-span-2">
            <div className="space-y-10">
              <h4 className="text-lg font-black italic border-b border-white/10 pb-4">Our Services</h4>
              <ul className="space-y-4 text-white/40 text-sm font-bold uppercase tracking-widest">
                {['House Cleaning', 'Office Cleaning', 'Deep Clean', 'Sanitation', 'Windows'].map(l => (
                  <li key={l} className="hover:text-brand-light cursor-pointer transition-colors flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" /> {l}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-10">
              <h4 className="text-lg font-black italic border-b border-white/10 pb-4">Helpful Links</h4>
              <ul className="space-y-4 text-white/40 text-sm font-bold uppercase tracking-widest">
                {['About Us', 'Sustainability', 'Expert Team', 'Careers', 'Contact'].map(l => (
                  <li key={l} className="hover:text-brand-light cursor-pointer transition-colors flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" /> {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-10 lg:col-span-1">
            <h4 className="text-lg font-black italic border-b border-white/10 pb-4">Join Newsletter</h4>
            <p className="text-white/40 text-sm italic">Get eco-cleaning tips and exclusive offers directly in your inbox.</p>
            <div className="relative">
              <input type="email" placeholder="email@address.com" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm focus:outline-none focus:border-brand-light transition-colors" />
              <button className="absolute right-2 top-2 h-11 w-11 bg-brand-light text-brand-dark rounded-xl flex items-center justify-center hover:bg-white transition-colors">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <div className="pt-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-brand-light">
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Secured & Encrypted<br />Booking</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:row justify-between items-center gap-6 text-[10px] uppercase font-black tracking-[0.3em] text-white/20">
          <p>© {new Date().getFullYear()} CleanMate Eco-Service. Design by Antigravity.</p>
          <div className="flex gap-10">
             <span className="hover:text-brand-light cursor-pointer">Privacy Policy</span>
             <span className="hover:text-brand-light cursor-pointer">Terms & Conditions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
