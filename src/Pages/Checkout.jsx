// src/Pages/Checkout.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  serverTimestamp,
  doc,
  runTransaction,
} from "firebase/firestore";

export default function Checkout() {
  const { items, clearCart, loadingCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loadingCart) {
      if (!currentUser) {
        navigate("/signin");
      } else if (!items || items.length === 0) {
        navigate("/cart");
      }
    }
  }, [currentUser, loadingCart, items, navigate]);

  const totalAmount = (items || []).reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = item.quantity || 1;
    return acc + price * qty;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      navigate("/signin");
      return;
    }
    if (!items || items.length === 0) {
      navigate("/cart");
      return;
    }
    if (!fullName || !address || !phone || !nicNumber) {
      // keep HTML5 required + silent guard
      return;
    }

    try {
      setSubmitting(true);

      const orderItems = items.map((item) => ({
        shoeId: item.shoeId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        size: item.size || null,
        color: item.color || null,
        image: item.image || null,
      }));

      const payload = {
        userId: currentUser.uid,
        userEmail: currentUser.email || null,
        items: orderItems,
        total: totalAmount,
        status: "pending",
        createdAt: serverTimestamp(),
        fullName,
        nicNumber,
        address,
        phone,
        whatsapp,
        paymentMethod,
      };

      await runTransaction(db, async (tx) => {
        const stockUpdates = [];

        for (const item of orderItems) {
          if (!item.shoeId) continue;

          const shoeRef = doc(db, "shoes", item.shoeId);
          const shoeSnap = await tx.get(shoeRef);

          if (!shoeSnap.exists()) {
            throw new Error(
              `Product "${item.name}" is no longer available in the store.`
            );
          }

          const data = shoeSnap.data();
          const currentStock = Number(data.stock || 0);
          const qty = Number(item.quantity || 1);

          if (currentStock < qty) {
            throw new Error(
              `Product "${item.name}" is out of stock or does not have enough quantity.`
            );
          }

          stockUpdates.push({
            ref: shoeRef,
            newStock: currentStock - qty,
          });
        }

        for (const upd of stockUpdates) {
          tx.update(upd.ref, { stock: upd.newStock });
        }

        const ordersRef = collection(db, "orders");
        const orderRef = doc(ordersRef);
        tx.set(orderRef, payload);
      });

      await clearCart();
      // no success popup; just redirect
      navigate("/");
    } catch (err) {
      console.error("Order create error:", err);
      // if there is an error, stop submitting state but no alert popup
      setSubmitting(false);
    }
  };

  if (!currentUser || loadingCart || !items) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <NavBar />
        <main className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
          <p className="text-neutral-400 text-sm">Preparing checkout...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <NavBar />

      <main className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
        <header className="mb-10 border-b border-white/5 pb-6">
          <h1 className="text-3xl md:text-4xl font-serif italic mb-2 tracking-tight">
            Checkout
          </h1>
          <p className="text-neutral-500 text-xs uppercase tracking-[0.3em]">
            Secure your order • {items.length} items • Rs.{" "}
            {totalAmount.toLocaleString("en-LK")}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 md:p-8"
        >
          {/* Customer info */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400">
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1">
                  NIC Number *
                </label>
                <input
                  type="text"
                  value={nicNumber}
                  onChange={(e) => setNicNumber(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-600"
                  required
                />
              </div>
            </div>
          </section>

          {/* Address & contact */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400">
              Delivery Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1">
                  Full Address *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-600 min-h-[80px]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-600"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400">
              Payment Method
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex-1 px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-[0.2em] ${
                  paymentMethod === "cod"
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-[#111] border-white/10 text-neutral-300 hover:bg-white/5"
                }`}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className={`flex-1 px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-[0.2em] ${
                  paymentMethod === "bank"
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-[#111] border-white/10 text-neutral-300 hover:bg-white/5"
                }`}
              >
                Bank Transfer
              </button>
            </div>
          </section>

          {/* Submit */}
          <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-neutral-400">
              Total Payable:{" "}
              <span className="font-bold text-white">
                Rs. {totalAmount.toLocaleString("en-LK")}
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto bg-red-600 text-white py-3 px-10 rounded-full font-black uppercase tracking-[0.25em] text-xs hover:bg-red-700 transition-all active:scale-95 disabled:bg-red-500/60"
            >
              {submitting ? "Submitting..." : "Confirm Order"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
