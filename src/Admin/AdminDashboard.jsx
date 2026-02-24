// src/Pages/AdminDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../Components/AdminSidebar";
import Footer from "../Components/Footer";
import { auth, db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
  AlertCircle,
  ArrowUpRight,
  Plus,
} from "lucide-react";

export default function AdminDashboard() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [shoes, setShoes] = useState([]);
  const [loadingShoes, setLoadingShoes] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    async function loadShoes() {
      try {
        const q = query(collection(db, "shoes"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setShoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        setError("Unable to sync with inventory.");
      } finally {
        setLoadingShoes(false);
      }
    }

    async function loadOrders() {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    }

    async function loadCustomers() {
      try {
        const snap = await getDocs(collection(db, "users"));
        setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCustomers(false);
      }
    }

    if (isAdmin) {
      loadShoes();
      loadOrders();
      loadCustomers();
    }
  }, [isAdmin]);

  const categoryStats = useMemo(() => {
    const counts = shoes.reduce(
      (acc, shoe) => {
        const c = (shoe.category || "uncommon").toLowerCase();
        if (acc[c] !== undefined) acc[c] += 1;
        return acc;
      },
      { bespoke: 0, medical: 0, uncommon: 0 }
    );
    return [
      { label: "Bespoke", value: counts.bespoke, color: "from-red-500 to-orange-500" },
      { label: "Medical", value: counts.medical, color: "from-blue-500 to-cyan-500" },
      { label: "Uncommon", value: counts.uncommon, color: "from-purple-500 to-pink-500" },
    ];
  }, [shoes]);

  const monthlySales = [
    { month: "Jan", value: 20 },
    { month: "Feb", value: 35 },
    { month: "Mar", value: 25 },
    { month: "Apr", value: 40 },
    { month: "May", value: 30 },
    { month: "Jun", value: 55 },
  ];

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse text-red-500 font-serif italic text-2xl">
          Loading Console...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-red-500/30 overflow-x-hidden">
      {/* Decorative background glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-900/10 blur-[100px] rounded-full" />
      </div>

      <AdminSidebar />

      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        <main className="flex-1 px-4 py-8 md:px-8 md:py-10 max-w-[1600px] mx-auto w-full">
          
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-[1px] w-6 bg-red-600" />
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
                  Management Console
                </p>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif italic bg-gradient-to-r from-white via-white to-neutral-600 bg-clip-text text-transparent">
                Welcome back, Admin
              </h1>
            </div>
            
            <div className="flex gap-2 items-center">
              <button className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] font-medium hover:bg-white/10 transition-all">
                Export
              </button>
              <button
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 rounded-xl text-[11px] font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-900/20"
                onClick={() => navigate("/admin/add-shoe")}
              >
                <Plus size={14} /> New Product
              </button>
            </div>
          </header>

          {!isAdmin ? (
            <div className="flex flex-col items-center justify-center py-20 border border-white/5 bg-white/[0.02] rounded-3xl backdrop-blur-xl">
              <AlertCircle size={40} className="text-red-500 mb-4" />
              <h2 className="text-lg font-semibold text-center px-4">Access Restricted</h2>
              <p className="text-neutral-400 mt-2 text-sm text-center px-6">
                Only authorized administrators can view these metrics.
              </p>
            </div>
          ) : (
            <>
              {/* Stats Grid - Compact on Mobile */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-10">
                <StatCard
                  title="Products"
                  value={loadingShoes ? "..." : shoes.length}
                  icon={<Package size={16} />}
                />
                <StatCard
                  title="Orders"
                  value={loadingOrders ? "..." : orders.length}
                  icon={<TrendingUp size={16} />}
                />
                <StatCard
                  title="Revenue"
                  value="245k"
                  sub="LKR"
                  icon={<LayoutDashboard size={16} />}
                />
                <StatCard
                  title="Users"
                  value={loadingCustomers ? "..." : customers.length}
                  icon={<Users size={16} />}
                />
              </section>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {/* Main Charts Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm transition-all hover:border-white/10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-md md:text-lg font-medium">Sales Momentum</h3>
                      <p className="text-xs text-neutral-500">Performance tracking</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg">
                        <ArrowUpRight size={18} className="text-red-500" />
                    </div>
                  </div>
                  <SimpleLineChart data={monthlySales} />
                </div>

                {/* Category Chart */}
                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm transition-all hover:border-white/10">
                  <h3 className="text-md md:text-lg font-medium mb-1">Category Mix</h3>
                  <p className="text-xs text-neutral-500 mb-8">Inventory distribution</p>
                  
                  <CategoryBarChart data={categoryStats} />

                  <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Leading</span>
                    <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">
                      {getMostPopularCategoryLabel(categoryStats)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}

// Sub-components with refined mobile styles
function StatCard({ title, value, icon, trend, sub }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 md:p-6 transition-all hover:border-red-500/30 group active:scale-95">
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <span className="p-2 bg-white/5 rounded-lg text-neutral-400 group-hover:text-red-500 transition-colors">
          {icon}
        </span>
        {trend && (
          <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <h4 className="text-xl md:text-3xl font-bold tracking-tight">{value}</h4>
          {sub && <span className="text-[10px] text-neutral-600 font-medium">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

function SimpleLineChart({ data }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="flex items-end justify-between gap-1.5 md:gap-4 h-48 md:h-64 mt-4">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-3 group/bar">
          <div className="relative w-full flex flex-col justify-end items-center h-full">
            <div className="absolute -top-7 opacity-0 md:group-hover/bar:opacity-100 transition-opacity bg-red-600 text-white text-[9px] py-1 px-1.5 rounded-md font-bold z-20 pointer-events-none">
              {d.value}
            </div>
            <div
              className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-red-950/40 via-red-800/40 to-red-600/80 transition-all duration-700 group-hover/bar:to-red-500"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-bold text-neutral-600 uppercase">
            {d.month}
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="space-y-5">
      {data.map((item) => (
        <div key={item.label} className="group/item">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover/item:text-white transition-colors">
              {item.label}
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              {item.value}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function getMostPopularCategoryLabel(stats) {
  if (!stats || stats.length === 0) return "N/A";
  const max = stats.reduce((best, item) => (item.value > best.value ? item : best), stats[0]);
  return max.value === 0 ? "None" : max.label;
}