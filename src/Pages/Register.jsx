// src/Pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!firstName || !lastName) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!acceptTerms) {
      setError("You must accept the Terms of Craftsmanship.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      setMessage("Account created successfully. Redirecting to sign in...");
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
      <NavBar />

      <main className="relative flex min-h-screen items-center justify-center px-6 py-24">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-red-600/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-red-900/10 blur-[120px]" />

        <div className="relative z-10 w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A0A0A] shadow-2xl lg:flex">
          {/* LEFT SIDE */}
          <div className="relative hidden w-2/5 lg:block">
            <div className="absolute inset-0 z-0 bg-red-950/20" />
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=800&auto=format&fit=crop"
              alt="Artisan Tools"
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A]" />

            <div className="absolute inset-0 flex flex-col justify-center p-12">
              <h2 className="text-4xl font-serif italic leading-tight text-white">
                Your Journey <br /> to the Perfect Fit.
              </h2>
              <p className="mt-6 leading-relaxed text-neutral-400">
                By joining Majestic Shoe Palace, you gain a partner in footwear.
                Whether it is for the ballroom or for post-surgical recovery, we
                craft with your unique story in mind.
              </p>

              <div className="mt-10 space-y-6">
                <FeatureRow
                  icon="✂️"
                  title="Custom Profiling"
                  desc="We save your gait and size data."
                />
                <FeatureRow
                  icon="📦"
                  title="Priority Crafting"
                  desc="Get first access to limited leather batches."
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: FORM */}
          <div className="flex w-full flex-col p-8 md:p-16 lg:w-3/5">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tighter text-white">
                Create Your Profile
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Enter your details to begin your bespoke experience.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-300">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300">
                {message}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Arjuna"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm transition-all focus:border-red-500/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Ranatunga"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm transition-all focus:border-red-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="example@kegalle.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm transition-all focus:border-red-500/50 focus:outline-none"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 pr-12 text-sm transition-all focus:border-red-500/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-red-500"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 pr-12 text-sm transition-all focus:border-red-500/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-red-500"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-white/10 bg-white/5 accent-red-600"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <label
                  htmlFor="terms"
                  className="cursor-pointer select-none text-xs text-neutral-500"
                >
                  I agree to the{" "}
                  <span className="text-red-400 underline">
                    Terms of Craftsmanship
                  </span>{" "}
                  and Privacy Policy.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-red-600 py-4 text-xs font-black uppercase tracking-[0.3em] text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-red-600/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-red-500/70"
              >
                {loading ? "Creating Account..." : "Establish Account"}
              </button>
            </form>

            <p className="mt-10 text-center text-sm text-neutral-500">
              Already have a royal profile?{" "}
              <Link
                to="/login"
                className="font-bold text-red-500 hover:text-red-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FeatureRow({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-xl">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="mt-1 text-xs leading-normal text-neutral-500">{desc}</p>
      </div>
    </div>
  );
}
