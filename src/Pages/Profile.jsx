// src/Pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { auth } from "../firebase";

export default function Profile() {
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [serverProfile, setServerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setFirebaseUser(null);
        setServerProfile(null);
        setLoading(false);
        navigate("/signin");
        return;
      }

      setFirebaseUser(user);

      try {
        const idToken = await user.getIdToken();
        const res = await fetch("http://localhost:4000/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({}),
        });

        if (res.ok) {
          const data = await res.json();
          setServerProfile(data);
        } else {
          console.error("Backend profile error:", await res.text());
        }
      } catch (err) {
        console.error("Failed to load profile from backend:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <NavBar />
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-neutral-300">Loading profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  const { displayName, email, uid } = firebaseUser;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <NavBar />

      <main className="flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Your Profile
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Welcome to your majestic profile overview.
          </p>

          <div className="mt-8 space-y-4">
            <ProfileRow label="Name" value={displayName || "Not set"} />
            <ProfileRow label="Email" value={email || "Not set"} />
            <ProfileRow label="User ID" value={uid} />
            {serverProfile && (
              <>
                {serverProfile.role && (
                  <ProfileRow label="Role" value={serverProfile.role} />
                )}
                {serverProfile.note && (
                  <ProfileRow label="Note" value={serverProfile.note} />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-white/5 pb-3">
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </span>
      <span className="text-sm text-neutral-200">{value}</span>
    </div>
  );
}
