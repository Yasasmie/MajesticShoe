// src/Pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import Swal from "sweetalert2";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

// Helper function in case you haven't exported it elsewhere
const formatOrderRef = (id) => `REF-${id.slice(-8).toUpperCase()}`;

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [serverProfile, setServerProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("order") === "success") {
      setShowThankYou(true);
      const t = setTimeout(() => setShowThankYou(false), 6000);
      return () => clearTimeout(t);
    }
  }, [location.search]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setFirebaseUser(null);
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
        }
      } catch (err) {
        console.error("Backend profile error:", err);
      } finally {
        setLoading(false);
      }

      try {
        setOrdersLoading(true);
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const userOrders = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to load orders with sort:", err);
        try {
          const fallbackQuery = query(
            collection(db, "orders"),
            where("userId", "==", user.uid)
          );
          const fallbackSnap = await getDocs(fallbackQuery);
          const fallbackOrders = fallbackSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          fallbackOrders.sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );
          setOrders(fallbackOrders);
        } catch (innerErr) {
          setOrders([]);
        }
      } finally {
        setOrdersLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsUpdatingPass(true);
    try {
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        oldPassword
      );
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);

      Swal.fire({
        title: "Success!",
        text: "Your password has been updated.",
        icon: "success",
        background: "#111",
        color: "#fff",
        confirmButtonColor: "#dc2626",
      });
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message.includes("wrong-password")
          ? "Incorrect current password"
          : "Failed to update password",
        icon: "error",
        background: "#111",
        color: "#fff",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsUpdatingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-neutral-500 text-xs uppercase tracking-[0.3em]">
            Initialising Profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-600/30">
      <NavBar />

      <main className="px-6 py-16 md:py-24 max-w-5xl mx-auto space-y-12">
        {showThankYou && (
          <div className="w-full rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center animate-in fade-in slide-in-from-top-4 duration-700">
            <h3 className="text-green-400 font-serif italic text-xl mb-1">
              Order Confirmed!
            </h3>
            <p className="text-green-500/70 text-sm">
              🎉 Your purchase was successful. Check your order history below.
            </p>
          </div>
        )}

        {/* Changed items-start to items-stretch for better mobile flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Sidebar: Profile Info - Fixed mobile scrolling by using lg:sticky only */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">
            <section className="rounded-3xl border border-white/5 bg-[#0A0A0A] p-6 md:p-8 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-red-600/10"></div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-serif italic mb-6">
                Profile
              </h1>

              <div className="space-y-5">
                <ProfileRow
                  label="Display Name"
                  value={firebaseUser.displayName || "Customer"}
                />
                <ProfileRow label="Email" value={firebaseUser.email} />
                {serverProfile?.role && (
                  <ProfileRow label="Account" value={serverProfile.role} />
                )}
              </div>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full mt-8 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors active:scale-95"
              >
                Change Password
              </button>
            </section>
          </aside>

          {/* Main Content: Orders - Full width on mobile, 2/3 on desktop */}
          <section className="lg:col-span-2 space-y-8">
            <div className="flex items-end justify-between border-b border-white/5 pb-6">
              <h2 className="text-2xl md:text-3xl font-serif italic tracking-tight">
                Order History
              </h2>
              <p className="text-[10px] md:text-xs text-neutral-500 uppercase tracking-widest">
                {orders.length} Records
              </p>
            </div>

            {ordersLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                <p className="text-neutral-500 text-sm mb-6 font-light">
                  No orders found.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-600 hover:text-white transition-all"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="group border border-white/5 rounded-3xl p-5 md:p-6 bg-[#0A0A0A] hover:border-white/10 transition-all duration-500"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 md:mb-8">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-red-600 font-black">
                          {formatOrderRef(order.id)}
                        </span>
                        <p className="text-xs text-neutral-500">
                          {order.createdAt?.toDate
                            ? order.createdAt
                                .toDate()
                                .toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                            : "Recently"}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-full ${
                            order.status === "pending"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-green-500/10 text-green-500 border border-green-500/20"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6 md:mb-8">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between group/item gap-4"
                        >
                          <div className="flex items-start gap-3 md:gap-4">
                            <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-neutral-500 font-mono">
                              {item.quantity}x
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-200 line-clamp-1">
                                {item.name}
                              </p>
                              {item.size && (
                                <p className="text-[10px] text-neutral-500 uppercase">
                                  Size: EU {item.size}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs md:text-sm text-neutral-400 whitespace-nowrap">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                      <div className="text-[9px] md:text-[10px] text-neutral-600 uppercase tracking-widest font-bold">
                        {order.paymentMethod === "cod" ? "COD" : "Bank"}
                      </div>
                      <div className="text-lg md:text-xl font-bold text-white tracking-tighter">
                        <span className="text-[9px] md:text-[10px] font-normal text-neutral-500 mr-2 uppercase tracking-widest">
                          Total
                        </span>
                        Rs. {(order.total || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Password Modal - Made more responsive */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-xl md:text-2xl font-serif italic mb-6">
              Security Settings
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-red-600 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-red-600 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPass}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {isUpdatingPass ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="group">
      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-600 group-hover:text-red-600 transition-colors">
        {label}
      </span>
      <p className="text-sm text-neutral-200 font-medium mt-1 truncate">
        {value}
      </p>
    </div>
  );
}