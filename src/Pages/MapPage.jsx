// src/Pages/MapPage.jsx
import React from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";

export default function MapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <NavBar />

      <main className="flex-1 px-4 py-24 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Majestic Shoe Center – Kegalle
        </h1>
        <p className="mb-6 text-sm text-neutral-300 text-center max-w-xl">
          This map shows the exact shop location as in your Google Maps link.
        </p>

        <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <iframe
            title="Majestic Shoe Center Kegalle"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.232708847058!2d80.3436!3d7.2524!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae32f9f9c7d8e2b%3A0xXXXXXXXXXXXXXXXX!2s783W%2B89P%2C%20Kegalle!5e0!3m2!1sen!2slk!4v1700000000000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </main>

      <Footer />
    </div>
  );
}
