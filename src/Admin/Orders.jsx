// src/Admin/Orders.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import AdminSidebar from "../Components/AdminSidebar";
import Footer from "../Components/Footer";
import {
  AlertCircle,
  PackageSearch,
  Printer,
  X,
  User,
  ShoppingBag,
  CreditCard,
  MapPin,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import OrderSlip from "../Components/OrderSlip";

export default function Orders() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const loadOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(list);
    } catch (err) {
      setError("Database sync failed.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadOrders();
  }, [isAdmin]);

  const updateStatus = async (orderId, status) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });

      const targetOrder = orders.find((o) => o.id === orderId);

      if (targetOrder && targetOrder.userId) {
        await addDoc(collection(db, "notifications"), {
          userId: targetOrder.userId,
          orderId,
          message: `Your order #${orderId.slice(0, 8)} status is now: ${status.toUpperCase()}.`,
          status,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }

      alert(`Order updated to ${status}`);
    } catch (err) {
      console.error("Update error:", err);
      alert("Status update failed. Check console for details.");
    }
  };

  if (loadingUser) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
      <AdminSidebar />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 px-6 py-8 md:px-12 md:py-14">
          <div className="max-w-7xl mx-auto mb-12 flex itemsend justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-[2px] w-10 bg-red-600" />
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-red-500">
                  Inventory Management
                </p>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif italic font-light text-white">
                Order Archive
              </h1>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                Live Volume
              </p>
              <p className="text-3xl font-mono text-white leading-none">
                {orders.length}
              </p>
            </div>
          </div>

          {!isAdmin ? (
            <UnauthorizedNotice />
          ) : loadingOrders ? (
            <div className="flex justify-center py-20">
              <Loader />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-neutral-400">
                        Reference
                      </th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-neutral-400">
                        Client Info
                      </th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-neutral-400">
                        Status
                      </th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-neutral-400 text-right">
                        Gross Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="group cursor-pointer hover:bg-white/[0.05] transition-all"
                      >
                        <td className="px-8 py-7 font-mono text-sm text-red-500 font-bold uppercase tracking-wider">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-8 py-7">
                          <p className="text-base font-medium text-white">
                            {order.userEmail || "Guest Client"}
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-1 font-mono uppercase tracking-tighter">
                            ID: {order.id.slice(0, 16)}...
                          </p>
                        </td>
                        <td className="px-8 py-7">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-8 py-7 text-right font-mono text-lg text-white font-semibold">
                          Rs. {Number(order.total || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          updateStatus={updateStatus}
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, updateStatus }) {
  const slipRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef: slipRef });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in zoom-in-95 duration-300">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl bg-[#0A0A0A] border border-white/10 rounded-[48px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-red-500 mb-2">
              Order Specification
            </p>
            <h2 className="text-3xl md:text-4xl font-serif italic text-white">
              Reference #{order.id.slice(0, 12)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-full transition-all text-neutral-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* LEFT COLUMN */}
            <div className="space-y-8">
              <DetailSection
                icon={<User size={18} className="text-red-500" />}
                title="Customer Profile"
              >
                <p className="text-lg text-white font-medium">
                  {order.fullName || "N/A"}
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-neutral-300">
                  <div>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">
                      Email
                    </p>
                    <p className="text-sm break-all">
                      {order.userEmail || "Guest Client"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">
                      NIC Number
                    </p>
                    <p className="text-sm">{order.nicNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">
                      Phone
                    </p>
                    <p className="text-sm">{order.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">
                      WhatsApp
                    </p>
                    <p className="text-sm">{order.whatsapp || "N/A"}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">
                    System UID
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono break-all">
                    {order.userId}
                  </p>
                </div>
              </DetailSection>

              <DetailSection
                icon={<MapPin size={18} className="text-red-500" />}
                title="Destination"
              >
                <div className="space-y-4 text-sm text-neutral-300">
                  <div>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">
                      Address
                    </p>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {order.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </DetailSection>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-3">
                  <ShoppingBag size={18} /> Consignment Breakdown
                </h3>
                <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full text-white font-bold">
                  {order.items?.length || 0} ITEMS
                </span>
              </div>

              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex justify-between items-center group hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover bg-white"
                        />
                      )}
                      <div>
                        <p className="text-lg font-medium text-white mb-1">
                          {item.name}
                        </p>
                        <div className="flex gap-4 text-xs text-neutral-500 font-medium">
                          <span className="flex items-center gap-1">
                            SIZE:{" "}
                            <b className="text-neutral-300">
                              {item.size || "STD"}
                            </b>
                          </span>
                          <span className="flex items-center gap-1">
                            COLOR:{" "}
                            <b className="text-neutral-300">
                              {item.color || "N/A"}
                            </b>
                          </span>
                          <span className="flex items-center gap-1">
                            QTY:{" "}
                            <b className="text-neutral-300">
                              {item.quantity || 1}
                            </b>
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-lg font-mono text-white">
                      Rs. {Number(item.price).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-8 flex justify-between items-center border-t border-white/10 mt-10">
                <div className="flex flex-col gap-2 text-neutral-400">
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} />
                    <span className="text-xs uppercase font-black tracking-widest">
                      Total Valuation
                    </span>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                    Payment:{" "}
                    {order.paymentMethod === "bank"
                      ? "Bank Transfer"
                      : "Cash on Delivery"}
                  </p>
                </div>
                <span className="text-4xl font-mono text-red-500 font-bold tracking-tighter">
                  Rs. {Number(order.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 bg-white/[0.02] border-t border-white/10 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex gap-3">
            <ActionButton
              label="Pending"
              onClick={() => updateStatus(order.id, "pending")}
              active={order.status === "pending"}
              color="yellow"
            />
            <ActionButton
              label="Completed"
              onClick={() => updateStatus(order.id, "completed")}
              active={order.status === "completed"}
              color="green"
            />
            <ActionButton
              label="Cancelled"
              onClick={() => updateStatus(order.id, "cancelled")}
              active={order.status === "cancelled"}
              color="red"
            />
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-3 px-10 py-4 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-xl"
          >
            <Printer size={18} /> Print Invoice
          </button>
        </div>

        <div className="hidden">
          <OrderSlip ref={slipRef} order={order} />
        </div>
      </div>
    </div>
  );
}

// Helpers

function StatusBadge({ status }) {
  const styles = {
    completed: "bg-green-500/10 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  };
  return (
    <span
      className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
        styles[status] || styles.pending
      }`}
    >
      {status || "pending"}
    </span>
  );
}

function DetailSection({ icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-neutral-400">
        {icon}
        <h4 className="text-xs font-black uppercase tracking-widest">
          {title}
        </h4>
      </div>
      <div className="bg-white/[0.03] rounded-[32px] p-7 border border-white/5">
        {children}
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, active, color }) {
  const colors = {
    green: active
      ? "bg-green-600 text-white border-green-500"
      : "text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
    red: active
      ? "bg-red-600 text-white border-red-500"
      : "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20",
    yellow: active
      ? "bg-yellow-500 text-black border-yellow-400"
      : "text-yellow-500 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20",
  };
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${colors[color]}`}
    >
      {label}
    </button>
  );
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center">
    <Loader />
  </div>
);

const Loader = () => (
  <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
);

const UnauthorizedNotice = () => (
  <div className="flex flex-col items-center justify-center py-32 border border-white/5 bg:white/[0.01] rounded-[48px]">
    <AlertCircle size={60} className="text-red-500 mb-6 opacity-30" />
    <p className="text-xl text-neutral-400 font-serif italic">
      Administrative Access Restricted
    </p>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-[48px]">
    <PackageSearch
      size={64}
      strokeWidth={1}
      className="text-neutral-800 mb-6"
    />
    <p className="text-xl text-neutral-500 font-serif italic">
      Archive is currently empty
    </p>
  </div>
);
