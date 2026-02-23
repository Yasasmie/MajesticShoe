// src/Pages/Home.jsx
import React, { useState, useEffect } from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";

// Slideshow images
const HERO_IMAGES = [
  "/home.jpeg",
  "/home2.jpeg",
  "/home3.jpeg",
  "/home4.jpeg"
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === HERO_IMAGES.length - 1 ? 0 : prev + 1));
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-red-500/30 font-sans">
      <NavBar />

      {/* --- HERO SECTION --- */}
      <main className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 lg:flex lg:items-center lg:gap-16 lg:pt-32">
        {/* Soft Ambient Glows */}
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-red-900/10 blur-[120px]" />

        <section className="relative z-10 flex-1 animate-fadeIn">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 backdrop-blur-md">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
              Artisan Craftsmanship • Kegalle
            </span>
          </div>

          <h1 className="text-5xl font-light leading-[1.1] tracking-tight text-white sm:text-7xl">
            Mastering the Art of <br />
            <span className="font-serif italic text-red-600">Perfect Fit.</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-400">
            Located at <span className="text-white font-bold">197, Main Street</span>, we blend
            Sri Lankan heritage with medical precision. From bespoke leather classics
            to orthopedic solutions, we craft footwear that fits your life.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">
            <button className="group relative overflow-hidden rounded-full bg-red-600 px-10 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-red-700 shadow-lg shadow-red-600/20">
              Book a Consultation
            </button>
            <div className="flex items-center gap-3 px-2">
              <span className="h-[1px] w-8 bg-red-600/50" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                Free Islandwide Shipping
              </span>
            </div>
          </div>
        </section>

        {/* Hero Image / Slideshow Display */}
        <section className="relative z-10 mt-16 flex-1 lg:mt-0">
          <div className="relative mx-auto aspect-square w-full max-w-lg">
            {/* The Artisan Borders (Styled to stay static) */}
            <div className="absolute inset-0 rotate-3 scale-95 rounded-2xl border border-red-600/20" />
            <div className="absolute inset-0 -rotate-3 rounded-2xl border border-white/10 transition-transform duration-700 hover:rotate-0" />
            
            {/* The Slideshow Container */}
            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl">
              {HERO_IMAGES.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Handcrafted display ${index + 1}`}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>

            {/* Quote Overlay */}
            <div className="absolute -bottom-6 -left-6 rounded-xl border border-white/5 bg-[#0A0A0A] p-6 shadow-2xl ring-1 ring-white/10">
              <p className="font-serif text-2xl italic text-red-600">"Truly Uncommon"</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Bespoke Quality
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* --- SERVICES GRID --- */}
      <section className="bg-[#030303] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-light text-white sm:text-4xl">What We Do</h2>
            <div className="mx-auto mt-4 h-1 w-12 bg-red-600" />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="Bespoke Designs"
              desc="Made-to-order classics and bold styles you won't find anywhere else."
              icon="👞"
            />
            <ServiceCard
              title="Medical Footwear"
              desc="Orthopedic, diabetic-friendly, and post-surgical shoes with custom depth."
              icon="🩺"
            />
            <ServiceCard
              title="Precise Fitting"
              desc="Gait checks and last adjustments for long-wear comfort."
              icon="📏"
            />
            <ServiceCard
              title="Premium Materials"
              desc="Hand-selected leathers and breathable linings for daily reliability."
              icon="🧵"
            />
            <ServiceCard
              title="Handcrafted Quality"
              desc="Patterns cut by hand and meticulous finishing by local artisans."
              icon="🔨"
            />
            <ServiceCard
              title="Aftercare Services"
              desc="Resoling, repairs, and conditioning to extend your shoe's life."
              icon="✨"
            />
          </div>
        </div>
      </section>

      {/* --- THE PROCESS SECTION --- */}
      <section className="bg-gradient-to-b from-[#050505] to-[#0A0A0A] py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-16 text-center text-3xl font-light text-white italic font-serif">
            The Artisan Process
          </h2>
          <div className="space-y-12">
            <Step
              num="01"
              title="Consultation"
              text="Share your style, purpose, and fit concerns with our experts."
            />
            <Step
              num="02"
              title="Measurement"
              text="We take detailed sizes and assess your specific support needs."
            />
            <Step
              num="03"
              title="Crafting"
              text="Your pair is hand-built with the right last, padding, and finish."
            />
            <Step
              num="04"
              title="Fitting"
              text="Final adjustments ensure the perfect feel before you take them home."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Sub-components
function ServiceCard({ title, desc, icon }) {
  return (
    <div className="group border border-white/5 bg-[#0A0A0A] p-8 transition-all hover:-translate-y-2 hover:border-red-600/50">
      <div className="mb-4 text-3xl grayscale transition-all group-hover:grayscale-0">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-medium text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-500 group-hover:text-neutral-400">
        {desc}
      </p>
    </div>
  );
}

function Step({ num, title, text }) {
  return (
    <div className="group flex items-start gap-8">
      <span className="text-4xl font-serif italic text-white/5 transition-colors group-hover:text-red-500/50">
        {num}
      </span>
      <div>
        <h4 className="mb-1 text-xl font-medium text-white">{title}</h4>
        <p className="text-neutral-400 text-sm">{text}</p>
      </div>
    </div>
  );
}