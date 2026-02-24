import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { MoveRight, ShieldCheck, Footprints, Ruler, Hammer, Sparkles, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";

const HERO_IMAGES = [
  "/home.jpeg",
  "/home2.jpeg",
  "/home3.jpeg",
  "/home4.jpeg"
];

const SERVICES = [
  { icon: <Footprints size={24} />, title: "Bespoke Designs", desc: "Individually patterned classics crafted for your unique style." },
  { icon: <Activity size={24} />, title: "Medical Solutions", desc: "Specialized footwear for diabetes and postural correction." },
  { icon: <Ruler size={24} />, title: "Professional Fitting", desc: "Gait analysis ensures weight distribution is balanced." },
  { icon: <ShieldCheck size={24} />, title: "Premium Leather", desc: "Sustainably sourced full-grain leathers that age beautifully." },
  { icon: <Hammer size={24} />, title: "Master Craft", desc: "Old-world techniques combined with modern foot-health tech." },
  { icon: <Sparkles size={24} />, title: "Restoration", desc: "Extend the life of your favorites with our resoling service." },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [serviceIndex, setServiceIndex] = useState(0);
  const navigate = useNavigate(); // Initialize navigate hook

  // Hero Slider Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === HERO_IMAGES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextService = () => {
    setServiceIndex((prev) => (prev === SERVICES.length - 1 ? 0 : prev + 1));
  };

  const prevService = () => {
    setServiceIndex((prev) => (prev === 0 ? SERVICES.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-red-600/30 font-sans overflow-x-hidden">
      <NavBar />

      {/* --- FLOATING DECOR --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-red-900/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] h-[30%] w-[30%] rounded-full bg-red-600/5 blur-[100px]" />
      </div>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-32 lg:flex lg:items-center lg:gap-12 lg:pt-48 min-h-[90vh]">
        <section className="flex-1 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">
              Est. 197, Main Street, Kegalle
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-light leading-[1] tracking-tighter text-white">
            Engineering <br />
            <span className="font-serif italic text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">Ultimate Comfort.</span>
          </h1>

          <p className="max-w-lg text-base md:text-lg leading-relaxed text-neutral-400">
            We fuse <span className="text-white">Sri Lankan artistry</span> with orthopedic precision. 
            Experience footwear designed not just to be worn, but to be lived in.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <button 
              onClick={() => navigate("/shop")} // Added Navigation Logic
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-red-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:pr-12 active:scale-95 shadow-2xl shadow-red-600/20"
            >
              Start Your Journey
              <MoveRight className="absolute right-4 opacity-0 transition-all group-hover:opacity-100" size={18} />
            </button>
            
            <div className="flex items-center gap-3 border-l border-white/10 pl-6 h-12">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 leading-none">
                Islandwide <br /> <span className="text-white/50">Shipping</span>
              </p>
            </div>
          </div>
        </section>

        <section className="mt-20 lg:mt-0 flex-1 relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
            <div className="h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A]">
              {HERO_IMAGES.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-transform duration-[2000ms] ease-out ${
                    index === currentSlide ? "scale-100 opacity-100" : "scale-110 opacity-0"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
                  <img src={img} alt="Handcrafted" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- EXPERTISE SLIDESHOW SECTION --- */}
      <section className="relative bg-[#030303] py-24 overflow-hidden border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-red-600 text-xs font-black uppercase tracking-[0.3em]">Our Expertise</span>
            <h2 className="text-4xl md:text-5xl font-light text-white tracking-tighter">Precision in Every Stitch</h2>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={prevService}
              className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-red-600 hover:border-red-600 active:scale-90"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={nextService}
              className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-red-600 hover:border-red-600 active:scale-90"
            >
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Unique Slide Motion Container */}
        <div className="relative mx-auto max-w-5xl h-[350px] px-6">
          <div className="relative w-full h-full flex items-center justify-center">
            {SERVICES.map((s, i) => {
              let offset = i - serviceIndex;
              if (offset > 2) offset -= SERVICES.length;
              if (offset < -2) offset += SERVICES.length;

              const isActive = offset === 0;
              const isVisible = Math.abs(offset) <= 1;

              return (
                <div
                  key={i}
                  className={`absolute w-full max-w-sm transition-all duration-700 ease-out p-6
                    ${isActive ? "z-30 opacity-100 scale-100 translate-x-0" : "z-10 opacity-0 scale-90"}
                    ${offset === 1 ? "translate-x-[60%] md:translate-x-[80%] opacity-40 blur-sm z-20 !block" : ""}
                    ${offset === -1 ? "-translate-x-[60%] md:-translate-x-[80%] opacity-40 blur-sm z-20 !block" : ""}
                    ${!isVisible && !isActive ? "hidden" : "block"}
                  `}
                >
                  <div className={`rounded-[2.5rem] p-10 border transition-all duration-500 bg-[#0A0A0A]
                    ${isActive ? "border-red-600 shadow-[0_20px_50px_-10px_rgba(220,38,38,0.2)]" : "border-white/5"}
                  `}>
                    <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-500
                      ${isActive ? "bg-red-600 text-white" : "bg-white/5 text-red-600"}
                    `}>
                      {s.icon}
                    </div>
                    <h3 className="mb-4 text-2xl font-bold text-white tracking-tight">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-neutral-400">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- ARTISAN PROCESS --- */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-serif italic text-white">The Journey to Your Perfect Pair</h2>
          </div>
          <div className="space-y-24 relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-red-600/50 via-white/5 to-transparent hidden md:block" />
            <Step num="01" title="The Private Consultation" text="We discuss your lifestyle, health needs, and aesthetic preferences." />
            <Step num="02" title="Anatomical Mapping" text="Using traditional measurements and modern mapping, we create a custom last." />
            <Step num="03" title="Master Construction" text="Weeks of hand-cutting and stitching by master artisans in Kegalle." />
            <Step num="04" title="The Final Refinement" text="A trial fitting ensures every curve aligns with your stride." />
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="pb-32 px-6">
        <div className="mx-auto max-w-5xl rounded-[3rem] bg-gradient-to-br from-red-600 to-red-900 p-12 md:p-20 text-center relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-light text-white tracking-tighter mb-8">Ready for a Better Walk?</h2>
            <button 
              onClick={() => navigate("/shop")} // Added Navigation Logic here as well for consistency
              className="bg-white text-red-600 px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
            >
              Schedule Your Measurement
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Step({ num, title, text }) {
  return (
    <div className="group relative flex flex-col md:flex-row gap-6 md:gap-16">
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-600 bg-[#050505] text-[10px] font-black text-white transition-transform group-hover:scale-125">
        {num}
      </div>
      <div className="space-y-2">
        <h4 className="text-2xl font-bold text-white tracking-tight group-hover:text-red-500 transition-colors">{title}</h4>
        <p className="max-w-xl text-neutral-400 leading-relaxed text-sm md:text-base">{text}</p>
      </div>
    </div>
  );
}