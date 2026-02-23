// src/Components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:flex lg:justify-between lg:items-center">
        <div>
          <h3 className="text-2xl font-serif italic text-white">
            Majestic Shoe Center
          </h3>
          <p className="mt-2 text-slate-500 max-w-sm">
            197, Main Street, Kegalle.
            <br />
            Custom orders are our specialty. Walk-ins welcome.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-8 sm:flex-row lg:mt-0">
          <div className="text-left">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-amber-500">
              Visit Us
            </p>
            <p className="text-slate-300">
              Open Mon - Sat
              <br />
              9:00 AM - 6:00 PM
            </p>
          </div>

          <div className="text-left">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-amber-500">
              Support
            </p>
            <p className="text-slate-300">
              Bring a doctor’s note for
              <br />
              custom medical builds.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center text-xs uppercase tracking-widest text-slate-700">
        &copy; 2026 Majestic Shoe Center. Ethical Craftsmanship.
      </div>
    </footer>
  );
}
