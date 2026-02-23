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
        const q = query(
          collection(db, "shoes"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setShoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Firestore Error:", err);
        setError(
          "Unable to sync with inventory. Please check connection."
        );
      } finally {
        setLoadingShoes(false);
      }
    }

    async function loadOrders() {
      try {
        const q = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc")
        );
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
        // assumes you have a "users" collection
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
      {
        label: "Bespoke",
        value: counts.bespoke,
        color: "from-red-500 to-orange-500",
      },
      {
        label: "Medical",
        value: counts.medical,
        color: "from-blue-500 to-cyan-500",
      },
      {
        label: "Uncommon",
        value: counts.uncommon,
        color: "from-purple-500 to-pink-500",
      },
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

  const totalShoes = shoes.length;
  const totalOrders = orders.length; // simplified "today's sales"
  const totalCustomers = customers.length;

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse text-red-500 font-serif italic text-2xl">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-red-500/30">
      <AdminSidebar />

      <div className="md:ml-64 flex flex-col min-h-screen">
       

        <main className="flex-1 px-6 py-10 max-w-[1600px] mx-auto w-full">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-[1px] w-8 bg-red-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
                  Management Console
                </p>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif italic bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
                Welcome back, Admin
              </h1>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-all">
                Export Report
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg text-xs font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-900/20"
                onClick={() => navigate("/admin/add-shoe")}
              >
                <Plus size={14} /> New Product
              </button>
            </div>
          </header>

          {!isAdmin ? (
            <div className="flex flex-col items-center justify-center py-20 border border-white/5 bg-white/[0.02] rounded-3xl backdrop-blur-md">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h2 className="text-xl font-semibold">Access Restricted</h2>
              <p className="text-neutral-400 mt-2">
                Only authorized administrators can view these metrics.
              </p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                  title="Total shoes"
                  value={loadingShoes ? "..." : totalShoes}
                  sub="Active in product grid"
                  icon={<Package size={18} />}
                />
                <StatCard
                  title="Orders"
                  value={loadingOrders ? "..." : totalOrders}
                  sub="Total Orders"
                  icon={<TrendingUp size={18} />}
                />
                <StatCard
                  title="Revenue"
                  value="LKR 245k"
                  sub="Monthly Gross (mock)"
                  icon={<LayoutDashboard size={18} />}
                />
                <StatCard
                  title="Customers"
                  value={loadingCustomers ? "..." : totalCustomers}
                  sub="Registered Users"
                  icon={<Users size={18} />}
                />
              </section>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 group rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent p-8 shadow-2xl transition-all hover:border-white/10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-medium">
                        Sales Momentum
                      </h3>
                      <p className="text-sm text-neutral-500">
                        Performance tracking for current semester
                      </p>
                    </div>
                    <ArrowUpRight className="text-neutral-600 group-hover:text-red-500 transition-colors" />
                  </div>
                  <SimpleLineChart data={monthlySales} />
                </div>

                <div className="rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent p-8 shadow-2xl transition-all hover:border-white/10">
                  <h3 className="text-lg font-medium mb-1">
                    Category Mix
                  </h3>
                  <p className="text-sm text-neutral-500 mb-8">
                    Inventory distribution by type
                  </p>
                  <CategoryBarChart data={categoryStats} />

                  <div className="mt-10 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">
                        Most Popular:
                      </span>
                      <span className="text-red-500 font-bold uppercase tracking-widest">
                        {getMostPopularCategoryLabel(categoryStats)}
                      </span>
                    </div>
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

function getMostPopularCategoryLabel(stats) {
  if (!stats || stats.length === 0) return "N/A";
  const max = stats.reduce(
    (best, item) => (item.value > best.value ? item : best),
    stats[0]
  );
  return max.value === 0 ? "N/A" : max.label;
}

function StatCard({ title, value, sub, icon, trend }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0A0A0A] p-6 transition-all hover:-translate-y-1 hover:border-red-500/20 group">
      <div className="absolute top-0 right-0 p-4 text-neutral-800 group-hover:text-red-500/20 transition-colors">
        {icon}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-4">
        {title}
      </p>
      <div className="flex items-end justify-between">
        <div>
          <h4 className="text-3xl font-bold tracking-tight">{value}</h4>
          <p className="text-[11px] text-neutral-500 mt-1">{sub}</p>
        </div>
        {trend && (
          <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded-md mb-1">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function SimpleLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-xs text-neutral-500">
        No sales data available.
      </p>
    );
  }
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="flex items-end justify-between gap-2 h-64 mt-4">
      {data.map((d) => (
        <div
          key={d.month}
          className="flex-1 flex flex-col items-center gap-4 group/bar"
        >
          <div className="relative w-full flex flex-col justify-end items-center h-48">
            <div className="absolute -top-8 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-red-600 text-white text-[10px] py-1 px-2 rounded font-bold">
              {d.value}
            </div>
            <div
              className="w-2/3 max-w-[40px] rounded-t-lg bg-gradient-to-t from-red-900/40 to-red-600 transition-all duration-500 group-hover/bar:from-red-600 group-hover/bar:to-red-400"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-neutral-600 uppercase group-hover/bar:text-neutral-300 transition-colors">
            {d.month}
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-xs text-neutral-500">
        No category data available.
      </p>
    );
  }
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="space-y-6">
      {data.map((item) => (
        <div key={item.label} className="group/item">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 group-hover/item:text-white transition-colors">
              {item.label}
            </span>
            <span className="text-xs font-mono text-neutral-500">
              {item.value} Units
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700 ease-out`}
              style={{
                width:
                  max === 0
                    ? "0%"
                    : `${(item.value / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
