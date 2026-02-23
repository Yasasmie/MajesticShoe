// src/Admin/Orders.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import AdminSidebar from "../Components/AdminSidebar";
import Footer from "../Components/Footer";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PackageSearch,
  Printer,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import OrderSlip from "../Components/OrderSlip";

export default function Orders() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user || null);
      setLoadingUser(false);
    });
    return () => unsub();
  }, []);

  const isAdmin = useMemo(
    () => !!firebaseUser && firebaseUser.email === "admin@gmail.com",
    [firebaseUser]
  );

  useEffect(() => {
    async function loadOrders() {
      try {
        const q = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(list);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders.");
      } finally {
        setLoadingOrders(false);
      }
    }
    if (isAdmin) loadOrders();
  }, [isAdmin]);

  const updateStatus = async (orderId, status) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update order status.");
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <AdminSidebar />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 max-w-6xl mx-auto px-6 py-10">
          <header className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                Order Management
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-serif italic">
                Orders
              </h1>
            </div>
          </header>

          {!isAdmin ? (
            <div className="flex flex-col items-center justify-center py-20 border border-white/5 bg-white/[0.02] rounded-3xl">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <p>Only admin can view orders.</p>
            </div>
          ) : loadingOrders ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl">
              <PackageSearch size={48} className="text-neutral-700 mb-4" />
              <p className="text-neutral-400">No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  updateStatus={updateStatus}
                />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

function OrderRow({ order, updateStatus }) {
  const slipRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: slipRef, // << modern API
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-5 relative">
      {/* Visible order info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-red-500 font-black">
            Order #{order.id.slice(0, 6)}
          </p>
          <p className="text-xs text-neutral-400">
            {order.userEmail || order.userId}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleString()
              : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">
            Rs. {Number(order.total || 0).toLocaleString("en-LK")}
          </p>
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em]">
            {order.items?.length || 0} items
          </p>
        </div>
      </div>

      <div className="mb-4 text-xs text-neutral-300 space-y-1">
        {order.items?.map((item, idx) => (
          <p key={idx}>
            {idx + 1}. {item.name} – Rs.{item.price} ×{" "}
            {item.quantity || 1}
            {item.size ? `, Size ${item.size}` : ""}
            {item.color ? `, ${item.color}` : ""}
          </p>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
        <div className="flex items-center gap-2 text-xs">
          {order.status === "completed" ? (
            <CheckCircle2 size={16} className="text-green-500" />
          ) : (
            <Clock size={16} className="text-yellow-400" />
          )}
          <span className="uppercase tracking-[0.2em] text-neutral-400">
            Status: {order.status || "pending"}
          </span>
        </div>
        <div className="flex gap-2 text-[11px]">
          <button
            onClick={() => updateStatus(order.id, "pending")}
            className="px-3 py-1 rounded-full border border-white/15 bg-white/5 hover:bg-white/10"
          >
            Pending
          </button>
          <button
            onClick={() => updateStatus(order.id, "completed")}
            className="px-3 py-1 rounded-full border border-green-500/40 bg-green-500/10 hover:bg-green-500/20 text-green-300"
          >
            Completed
          </button>
          <button
            onClick={() => updateStatus(order.id, "cancelled")}
            className="px-3 py-1 rounded-full border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300"
          >
            Cancelled
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 flex items-center gap-1"
          >
            <Printer size={14} /> Slip
          </button>
        </div>
      </div>

      {/* Slip rendered off-screen but mounted with ref */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <OrderSlip ref={slipRef} order={order} />
      </div>
    </div>
  );
}
