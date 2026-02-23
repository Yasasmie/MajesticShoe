// src/Pages/Contact.jsx
import React from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200">
      <NavBar />

      {/* --- HERO / HEADER --- */}
      <section className="relative pt-32 pb-16 px-6 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full" />
        </div>
        
        <div className="relative z-10 animate-fadeIn">
          <h1 className="text-5xl md:text-7xl font-serif italic text-white mb-6">Get in Touch</h1>
          <p className="text-slate-400 max-w-2xl mx-auto uppercase tracking-widest text-xs leading-loose">
            Visit our Kegalle workshop for a precision fit <br /> 
            or reach out for custom medical builds.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* --- LEFT: CONTACT DETAILS & MAP --- */}
          <section className="space-y-12 order-2 lg:order-1">
            <div className="bg-[#161920] border border-slate-800 p-10 rounded-2xl">
              <h2 className="text-2xl font-serif text-white mb-8">Workshop Details</h2>
              
              <div className="space-y-8">
                <ContactInfo 
                  icon="📍" 
                  label="Our Location" 
                  detail="197, Main Street, Kegalle, Sri Lanka" 
                />
                <ContactInfo 
                  icon="📞" 
                  label="Phone Number" 
                  detail="+94 076 359 4460 / +94 77 374 5260" 
                />
                <ContactInfo 
                  icon="✉️" 
                  label="Email Address" 
                  detail="majesticshoekegalle@gmail.com" 
                />
                <ContactInfo 
                  icon="🕒" 
                  label="Workshop Hours" 
                  detail="Mon - Sat: 9:00 AM - 6:00 PM (Closed Sundays)" 
                />
              </div>
            </div>

            {/* Placeholder for Map
            <div className="h-80 w-full bg-slate-800 rounded-2xl overflow-hidden grayscale contrast-125 opacity-50 hover:opacity-100 transition-opacity duration-700">
              <div className="w-full h-full flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700">
                <p className="uppercase tracking-widest text-xs font-bold">Google Maps Integration Here</p>
              </div>
            </div>*/}
          </section>

          {/* --- RIGHT: THE FORM --- */}
          <section className="bg-white/[0.02] border border-white/10 p-8 md:p-12 rounded-3xl backdrop-blur-sm order-1 lg:order-2">
            <h3 className="text-2xl font-serif text-white mb-2">Send a Message</h3>
            <p className="text-slate-500 text-sm mb-10">Whether it's a style inquiry or a medical requirement, our master artisans will get back to you within 24 hours.</p>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-red-500 font-bold">Full Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-slate-700 py-3 focus:border-red-500 focus:outline-none transition-colors" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-red-500 font-bold">Email</label>
                  <input type="email" className="w-full bg-transparent border-b border-slate-700 py-3 focus:border-red-500 focus:outline-none transition-colors" placeholder="john@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-red-500 font-bold">Inquiry Type</label>
                <select className="w-full bg-transparent border-b border-slate-700 py-3 focus:border-red-500 focus:outline-none transition-colors appearance-none text-slate-400">
                  <option className="bg-[#0f1115]">Bespoke Fashion Order</option>
                  <option className="bg-[#0f1115]">Medical / Orthopedic Requirement</option>
                  <option className="bg-[#0f1115]">Repair & Aftercare Service</option>
                  <option className="bg-[#0f1115]">General Inquiry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-red-500 font-bold">Your Message</label>
                <textarea rows="4" className="w-full bg-transparent border-b border-slate-700 py-3 focus:border-red-500 focus:outline-none transition-colors resize-none" placeholder="Tell us about your feet, style, or doctor's recommendations..."></textarea>
              </div>

              <button className="w-full mt-4 bg-red-400 text-black font-black uppercase tracking-[0.2em] py-5 rounded-sm hover:bg-red-500 transition-all active:scale-[0.98]">
                Submit Inquiry
              </button>
            </form>
          </section>

        </div>
      </main>

      {/* --- QUICK HELP BAR --- */}
      <section className="bg-red-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-[#0f1115]">
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-bold uppercase tracking-tighter">Direct Consultation</h4>
            <p className="font-medium opacity-80">Prefer a quick chat? Call our master artisan directly.</p>
          </div>
          <a href="tel:+94771234567" className="bg-[#0f1115] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:shadow-xl transition-all">
            Call: 077 374 5260
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Internal Helper Component
function ContactInfo({ icon, label, detail }) {
  return (
    <div className="flex gap-6 items-start group">
      <div className="text-2xl bg-slate-800 h-12 w-12 flex items-center justify-center rounded-full group-hover:bg-red-500 group-hover:text-black transition-all duration-500">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-red-500 font-bold mb-1">{label}</p>
        <p className="text-slate-300 font-medium">{detail}</p>
      </div>
    </div>
  );
}