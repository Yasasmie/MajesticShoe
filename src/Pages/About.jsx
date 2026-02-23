// src/Pages/About.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";

export default function About() {
  const navigate = useNavigate();

  const handleDirections = () => {
    navigate("/map");
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200">
      <NavBar />

      {/* --- HERO SECTION: STORY TELLING --- */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fadeIn">
            <span className="text-red-500 font-bold uppercase tracking-[0.3em] text-xs">
              Established Artisan Workshop
            </span>
            <h1 className="mt-4 text-5xl md:text-7xl font-serif italic text-white leading-tight">
              Crafting Heritage, <br />
              One Stitch at a Time.
            </h1>
            <p className="mt-8 text-lg text-slate-400 leading-relaxed">
              Located at{" "}
              <span className="text-white border-b border-red-500/50">
                197, Main Street, Kegalle
              </span>
              , Majestic Shoe Center is more than a retail space. It is an
              artisan-led workshop dedicated to creating uncommon footwear that
              blends comfort, durability, and distinctive Sri Lankan style.
            </p>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 border border-red-500/20 rounded-2xl group-hover:rotate-2 transition-transform duration-500"></div>
            <img
              src="/about.jpeg"
              alt="Artisan at work"
              className="relative rounded-xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </section>

      {/* --- CORE PILLARS: WHAT WE DO --- */}
      <section className="py-24 bg-[#0a0c10] border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <h2 className="text-4xl font-serif text-white">Our Specialties</h2>
            <p className="text-red-500 uppercase tracking-widest text-xs font-bold">
              Precision • Health • Style
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1px bg-slate-800 border border-slate-800">
            <SpecialtyCard
              title="Bespoke Designs"
              text="From timeless classics to bold, uncommon styles you will not find elsewhere."
            />
            <SpecialtyCard
              title="Medical Solutions"
              text="Orthopedic, diabetic-friendly, and post-surgical shoes with custom cushioning."
            />
            <SpecialtyCard
              title="Precise Fitting"
              text="Careful measurements and gait checks for long-wear comfort."
            />
            <SpecialtyCard
              title="Premium Leather"
              text="Hand-selected leathers and breathable linings for daily reliability."
            />
            <SpecialtyCard
              title="Handcrafted Quality"
              text="Hand-cut patterns and meticulous finishing by skilled local artisans."
            />
            <SpecialtyCard
              title="Aftercare"
              text="Repairs, resoling, and leather conditioning to extend the life of your shoes."
            />
          </div>
        </div>
      </section>

      {/* --- THE MEDICAL EXPERTISE --- */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 order-2 lg:order-1">
            <h2 className="text-3xl font-serif text-white mb-6">
              Health-Focused Solutions
            </h2>
            <p className="text-slate-400 mb-8">
              We provide practical, health-focused solutions for a variety of
              foot conditions. Our workshop is equipped to handle custom builds
              for:
            </p>
            <ul className="grid grid-cols-2 gap-4 text-sm font-medium tracking-wide">
              <li className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                Flat Feet
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                Heel Pain
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                Arch Support
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                Bunions
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                Sensitive Feet
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                Diabetic Care
              </li>
            </ul>
          </div>
          <div className="flex-1 order-1 lg:order-2 bg-amber-500/5 p-12 rounded-full border border-amber-500/10">
            <div className="text-center">
              <p className="text-5xl mb-4">🩺</p>
              <h3 className="text-xl font-bold text-red-400 uppercase tracking-tighter">
                Medical Builds
              </h3>
              <p className="text-xs text-slate-500 mt-2 italic">
                Bring your doctor's note for a custom build.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS: THE JOURNEY --- */}
      <section className="py-24 bg-[#11141a]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-4xl font-serif text-white mb-20">
            The Creation Journey
          </h2>
          <div className="relative space-y-12">
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-red-800 md:left-1/2"></div>

            <JourneyStep
              side="left"
              num="01"
              title="Consultation"
              desc="Share your style, purpose, and fit concerns with our master artisans."
            />
            <JourneyStep
              side="right"
              num="02"
              title="Measurement"
              desc="We take detailed sizes and assess gait support needs with precision."
            />
            <JourneyStep
              side="left"
              num="03"
              title="Crafting"
              desc="Your pair is hand-built with the right last, padding, and premium finish."
            />
            <JourneyStep
              side="right"
              num="04"
              title="Fitting"
              desc="Final adjustments ensure the perfect feel before your first walk."
            />
          </div>
        </div>
      </section>

      {/* --- VISIT CTA --- */}
      <section className="py-24 text-center px-6">
        <div className="max-w-3xl mx-auto bg-gradient-to-b from-red-200 to-red-500 p-12 rounded-2xl text-[#0f1115]">
          <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4">
            Visit Our Workshop
          </h2>
          <p className="font-medium mb-8">
            197, Main Street, Kegalle. <br />
            Walk-ins are welcome to browse our leather swatches and try on
            samples.
          </p>
          <button
            className="bg-[#0f1115] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
            onClick={handleDirections}
          >
            Get Directions
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Sub-components
function SpecialtyCard({ title, text }) {
  return (
    <div className="bg-[#0f1115] p-10 hover:bg-amber-500/[0.02] transition-colors group">
      <h3 className="text-lg font-bold text-white mb-4 group-hover:text-red-500 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
    </div>
  );
}

function JourneyStep({ side, num, title, desc }) {
  return (
    <div
      className={`relative flex flex-col md:flex-row ${
        side === "right" ? "md:flex-row-reverse" : ""
      } items-center gap-10`}
    >
      <div className="absolute left-0 md:left-1/2 -translate-x-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-400 text-black text-xs font-black">
        {num}
      </div>
      <div
        className={`flex-1 ${
          side === "left" ? "md:text-right" : "md:text-left"
        } pl-12 md:pl-0`}
      >
        <h4 className="text-xl font-serif text-white mb-2">{title}</h4>
        <p className="text-slate-500 text-sm max-w-sm ml-auto mr-auto md:ml-0 md:mr-0">
          {desc}
        </p>
      </div>
      <div className="hidden md:block flex-1"></div>
    </div>
  );
}
