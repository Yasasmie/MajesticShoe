// src/Pages/AllShoes.jsx
import React, { useEffect, useState, useMemo } from "react";
import AdminSidebar from "../Components/AdminSidebar";
import Footer from "../Components/Footer";
import { auth, db } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  Search,
  Edit3,
  Trash2,
  X,
  Check,
  Package,
  Image as ImageIcon,
  Tag,
} from "lucide-react";

export default function AllShoes() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [shoes, setShoes] = useState([]);
  const [loadingShoes, setLoadingShoes] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    price: "",
    category: "",
    tag: "",
    description: "",
    imagesText: "",
    sizesText: "",
    colorsText: "",
  });

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
        setError("Failed to sync inventory.");
      } finally {
        setLoadingShoes(false);
      }
    }
    if (isAdmin) loadShoes();
  }, [isAdmin]);

  const filteredShoes = shoes.filter(
    (shoe) =>
      shoe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shoe.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (shoe) => {
    setEditingId(shoe.id);
    setEditData({
      name: shoe.name || "",
      price: shoe.price || "",
      category: shoe.category || "bespoke",
      tag: shoe.tag || "",
      description: shoe.description || "",
      imagesText: Array.isArray(shoe.images) ? shoe.images.join(", ") : "",
      sizesText: Array.isArray(shoe.sizes) ? shoe.sizes.join(", ") : "",
      colorsText: Array.isArray(shoe.colors) ? shoe.colors.join(", ") : "",
    });
  };

  const saveEdit = async (id) => {
    try {
      const updatedObj = {
        name: editData.name,
        price: editData.price,
        category: editData.category,
        tag: editData.tag,
        description: editData.description,
        images: editData.imagesText.split(",").map(s => s.trim()).filter(Boolean),
        sizes: editData.sizesText.split(",").map(s => s.trim()).filter(Boolean),
        colors: editData.colorsText.split(",").map(s => s.trim()).filter(Boolean),
      };
      await updateDoc(doc(db, "shoes", id), updatedObj);
      setShoes(prev => prev.map(s => (s.id === id ? { ...s, ...updatedObj } : s)));
      setEditingId(null);
    } catch (err) {
      setError("Update failed.");
    }
  };

  const deleteShoe = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "shoes", id));
      setShoes(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError("Delete failed.");
    }
  };

  if (loadingUser) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 blur-[120px] rounded-full opacity-50" />
      </div>

      <AdminSidebar />

      <main className="md:ml-64 min-h-screen relative z-10 px-4 py-8 md:px-10 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Compact Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-[1px] w-6 bg-red-600" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500">
                  Inventory System
                </p>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif italic text-white/90">Catalog Archive</h1>
            </div>

            <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-red-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-red-500/40 transition-all placeholder:text-neutral-600"
              />
            </div>
          </header>

          {!isAdmin ? (
            <div className="p-10 border border-white/5 bg-white/[0.02] rounded-3xl text-center backdrop-blur-md">
              <p className="text-neutral-500 text-sm italic font-serif">Unauthorized Access</p>
            </div>
          ) : (
            <div className="space-y-8">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] uppercase tracking-widest flex items-center gap-2 animate-pulse">
                  <X size={12} /> {error}
                </div>
              )}

              {loadingShoes ? (
                <div className="flex flex-col items-center py-24 gap-4">
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-neutral-600 text-[10px] uppercase tracking-widest">Syncing Database</p>
                </div>
              ) : filteredShoes.length === 0 ? (
                <div className="text-center py-32 border border-dashed border-white/5 rounded-[40px]">
                  <Package className="mx-auto text-neutral-800 mb-4" size={40} />
                  <p className="text-neutral-500 text-sm">No items found in archive.</p>
                </div>
              ) : (
                /* The Compact Grid */
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {filteredShoes.map((shoe) => (
                    <ShoeCard
                      key={shoe.id}
                      shoe={shoe}
                      isEditing={editingId === shoe.id}
                      editData={editData}
                      setEditData={setEditData}
                      onStartEdit={() => startEdit(shoe)}
                      onCancel={() => setEditingId(null)}
                      onSave={() => saveEdit(shoe.id)}
                      onDelete={() => deleteShoe(shoe.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ShoeCard({ shoe, isEditing, editData, setEditData, onStartEdit, onCancel, onSave, onDelete }) {
  const categoryColors = {
    bespoke: "text-red-500 bg-red-500/10 border-red-500/20",
    medical: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    uncommon: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  if (isEditing) {
    return (
      <div className="col-span-2 lg:col-span-2 bg-[#0F0F0F] border border-red-500/30 rounded-[32px] p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">Edit Product</h3>
          <button onClick={onCancel} className="text-neutral-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditInput label="Product Name" value={editData.name} onChange={(v) => setEditData({ ...editData, name: v })} />
          <EditInput label="Price (LKR)" value={editData.price} onChange={(v) => setEditData({ ...editData, price: v })} />
          <div className="md:col-span-2 space-y-4">
            <EditInput label="Description" isTextArea value={editData.description} onChange={(v) => setEditData({ ...editData, description: v })} />
            <div className="grid grid-cols-2 gap-4">
               <EditInput label="Sizes" value={editData.sizesText} onChange={(v) => setEditData({ ...editData, sizesText: v })} />
               <EditInput label="Colors" value={editData.colorsText} onChange={(v) => setEditData({ ...editData, colorsText: v })} />
            </div>
            <EditInput label="Image URLs (Comma separated)" value={editData.imagesText} onChange={(v) => setEditData({ ...editData, imagesText: v })} />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onSave} className="flex-1 bg-red-600 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-900/20">Save Changes</button>
          <button onClick={onDelete} className="px-5 bg-white/5 border border-white/10 rounded-xl text-red-500 hover:bg-red-500/10"><Trash2 size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white/[0.02] border border-white/5 rounded-[24px] md:rounded-[32px] overflow-hidden transition-all duration-500 hover:border-white/20 hover:-translate-y-1 active:scale-95">
      {/* Image Container */}
      <div className="aspect-[4/5] overflow-hidden bg-neutral-900 relative">
        <img src={shoe.images?.[0]} alt={shoe.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${categoryColors[shoe.category?.toLowerCase()] || categoryColors.uncommon}`}>
            {shoe.category}
          </span>
        </div>
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
          <button onClick={onStartEdit} className="p-3 bg-white rounded-full text-black hover:bg-red-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0">
            <Edit3 size={16} />
          </button>
          <button onClick={onDelete} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-all transform translate-y-4 group-hover:translate-y-0 delay-75">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3 md:p-5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-[11px] md:text-sm font-medium text-white/90 line-clamp-1 truncate">{shoe.name}</h3>
        </div>
        <p className="text-red-500 font-mono text-[10px] md:text-xs mb-2">{shoe.price}</p>
        
        <div className="flex items-center gap-2 opacity-60">
            <Tag size={10} className="text-neutral-500" />
            <span className="text-[9px] uppercase tracking-widest truncate">{shoe.tag || "No Tag"}</span>
        </div>
      </div>
    </div>
  );
}

function EditInput({ label, value, onChange, isTextArea = false }) {
  return (
    <div className="w-full">
      <label className="text-[8px] uppercase tracking-[0.2em] text-neutral-500 mb-1.5 block font-bold">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-red-500/40 min-h-[100px] transition-all"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-red-500/40 transition-all"
        />
      )}
    </div>
  );
}