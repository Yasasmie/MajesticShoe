// src/Pages/Signin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Signin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const idToken = await user.getIdToken();

      // Choose backend endpoint based on selected mode
      const endpoint = isAdminLogin
        ? "http://localhost:4000/api/admin/profile"
        : "http://localhost:4000/api/profile";

      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      }).catch((err) =>
        console.error("Backend profile fetch error:", err)
      );

      // ADMIN RESTRICTION:
      // Only admin@gmail.com can access Admin panel.
      if (isAdminLogin) {
        if (email === "admin@gmail.com") {
          // Correct admin email -> allow admin panel
          navigate("/admin");
        } else {
          // Wrong email trying to use admin side -> show message, do not navigate
          setError(
            "Only admin can access the admin panel. Please login using the User side."
          );
        }
        return;
      }

      // Normal user login (User side)
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
      <NavBar />

      <main className="relative flex min-h-screen items-center justify-center px-6 py-24">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-red-600/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-red-900/10 blur-[100px]" />

        <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl lg:flex-row">
          {/* LEFT SIDE */}
          <div className="relative hidden w-1/2 lg:block">
            <img
              src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop"
              alt="Premium Craftsmanship"
              className="h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
            <div className="absolute bottom-12 left-12 right-12">
              <h2 className="text-3xl font-serif italic text-white">
                Join the Palace.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                Access your custom measurements, track your bespoke orders, and
                receive priority notifications for our limited artisan drops.
              </p>
              <div className="mt-8 space-y-3">
                <BenefitItem text="Save Medical Footwear Prescriptions" />
                <BenefitItem text="Fast Checkout for New Drops" />
                <BenefitItem text="Exclusive Repair Discounts" />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: LOGIN FORM */}
          <div className="flex w-full flex-col justify-center p-8 md:p-16 lg:w-1/2">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tighter text-white">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Enter your credentials to access your majestic profile.
              </p>
            </div>

            {/* Toggle for User / Admin sign in */}
            <div className="mb-4 flex items-center justify-center gap-3 text-xs text-neutral-400">
              <button
                type="button"
                onClick={() => setIsAdminLogin(false)}
                className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                  !isAdminLogin
                    ? "bg-red-600 text-white"
                    : "bg-transparent text-neutral-400 border border-white/10"
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setIsAdminLogin(true)}
                className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                  isAdminLogin
                    ? "bg-red-600 text-white"
                    : "bg-transparent text-neutral-400 border border-white/10"
                }`}
              >
                Admin
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-300">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm transition-all focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                    Password
                  </label>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                    Forgot?
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm transition-all focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-lg bg-red-600 py-4 text-xs font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-red-500/70"
              >
                {loading
                  ? isAdminLogin
                    ? "Signing In as Admin..."
                    : "Signing In..."
                  : isAdminLogin
                  ? "Sign In as Admin"
                  : "Sign In"}
              </button>
            </form>

            <p className="mt-10 text-center text-sm text-neutral-500">
              Do not have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-red-500 hover:text-red-400"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function BenefitItem({ text }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-medium tracking-wide text-neutral-300">
      <div className="h-1 w-1 rounded-full bg-red-500" />
      {text}
    </div>
  );
}
