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
        const q = query(
          collection(db, "shoes"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setShoes(list);
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
      imagesText: Array.isArray(shoe.images)
        ? shoe.images.join(", ")
        : "",
      sizesText: Array.isArray(shoe.sizes)
        ? shoe.sizes.join(", ")
        : "",
      colorsText: Array.isArray(shoe.colors)
        ? shoe.colors.join(", ")
        : "",
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id) => {
    try {
      const images = editData.imagesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const sizes = editData.sizesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const colors = editData.colorsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedObj = {
        name: editData.name,
        price: editData.price,
        category: editData.category,
        tag: editData.tag,
        description: editData.description,
        images,
        sizes,
        colors,
      };

      await updateDoc(doc(db, "shoes", id), updatedObj);
      setShoes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updatedObj } : s))
      );
      setEditingId(null);
    } catch (err) {
      setError("Update failed. Please try again.");
    }
  };

  const deleteShoe = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this product?")
    )
      return;
    try {
      await deleteDoc(doc(db, "shoes", id));
      setShoes((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError("Delete failed.");
    }
  };

  if (loadingUser) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30">
      <AdminSidebar />

      <main className="md:ml-64 min-h-screen px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header & Controls */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-[1px] w-8 bg-red-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
                  Inventory Management
                </p>
              </div>
              <h1 className="text-4xl font-serif italic">Catalog Archive</h1>
            </div>

            <div className="relative group w-full md:w-72">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-red-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-all"
              />
            </div>
          </header>

          {!isAdmin ? (
            <div className="p-10 border border-red-500/20 bg-red-500/5 rounded-3xl text-center">
              <p className="text-red-400">
                Access Restricted to Administrators.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <Trash2 size={14} /> {error}
                </div>
              )}

              {loadingShoes ? (
                <div className="flex flex-col items-center py-20 gap-4">
                  <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-neutral-500 text-sm tracking-widest uppercase">
                    Fetching Inventory
                  </p>
                </div>
              ) : filteredShoes.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                  <Package
                    className="mx-auto text-neutral-700 mb-4"
                    size={48}
                  />
                  <p className="text-neutral-500">
                    No products found matching your search.
                  </p>
                </div>
              ) : (
                filteredShoes.map((shoe) => (
                  <ShoeCard
                    key={shoe.id}
                    shoe={shoe}
                    isEditing={editingId === shoe.id}
                    editData={editData}
                    setEditData={setEditData}
                    onStartEdit={() => startEdit(shoe)}
                    onCancel={cancelEdit}
                    onSave={() => saveEdit(shoe.id)}
                    onDelete={() => deleteShoe(shoe.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* --- Sub-Component: Shoe Card --- */
function ShoeCard({
  shoe,
  isEditing,
  editData,
  setEditData,
  onStartEdit,
  onCancel,
  onSave,
  onDelete,
}) {
  const categoryColors = {
    bespoke: "text-red-500 bg-red-500/10",
    medical: "text-blue-400 bg-blue-500/10",
    uncommon: "text-purple-400 bg-purple-500/10",
  };

  return (
    <div
      className={`transition-all duration-500 rounded-3xl border ${
        isEditing
          ? "border-red-500/30 bg-[#0F0F0F]"
          : "border-white/5 bg-[#0A0A0A] hover:border-white/20"
      }`}
    >
      <div className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Visual Side */}
          <div className="w-full md:w-48">
            <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 relative group">
              <img
                src={shoe.images?.[0]}
                alt={shoe.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImageIcon size={20} className="text-white" />
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="flex-1">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditInput
                  label="Name"
                  value={editData.name}
                  onChange={(v) =>
                    setEditData({ ...editData, name: v })
                  }
                />
                <EditInput
                  label="Price"
                  value={editData.price}
                  onChange={(v) =>
                    setEditData({ ...editData, price: v })
                  }
                />
                <div className="md:col-span-2">
                  <label className="text-[9px] uppercase tracking-widest text-neutral-500 mb-1 block">
                    Category
                  </label>
                  <select
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-500/50"
                  >
                    <option value="bespoke">Bespoke Classics</option>
                    <option value="medical">Medical & Orthopedic</option>
                    <option value="uncommon">Uncommon Styles</option>
                  </select>
                </div>
                <EditInput
                  label="Tag"
                  value={editData.tag}
                  onChange={(v) =>
                    setEditData({ ...editData, tag: v })
                  }
                />
                <EditInput
                  label="Description"
                  value={editData.description}
                  onChange={(v) =>
                    setEditData({ ...editData, description: v })
                  }
                  isTextArea
                />
                <EditInput
                  label="Images (Comma separated)"
                  value={editData.imagesText}
                  onChange={(v) =>
                    setEditData({ ...editData, imagesText: v })
                  }
                  isTextArea
                />
                <EditInput
                  label="Sizes (Comma separated)"
                  value={editData.sizesText}
                  onChange={(v) =>
                    setEditData({ ...editData, sizesText: v })
                  }
                />
                <EditInput
                  label="Colors (Comma separated)"
                  value={editData.colorsText}
                  onChange={(v) =>
                    setEditData({ ...editData, colorsText: v })
                  }
                />
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                        categoryColors[
                          shoe.category?.toLowerCase()
                        ] || categoryColors.uncommon
                      }`}
                    >
                      {shoe.category}
                    </span>
                    {shoe.tag && (
                      <span className="text-neutral-500 text-[10px] uppercase tracking-tighter italic">
                        / {shoe.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-medium text-white mb-1">
                    {shoe.name}
                  </h3>
                  <p className="text-red-500 font-mono text-sm mb-2">
                    {shoe.price}
                  </p>
                  <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2">
                    {shoe.description}
                  </p>
                  <div className="mt-2 text-[10px] text-neutral-500">
                    {Array.isArray(shoe.sizes) &&
                      shoe.sizes.length > 0 && (
                        <p>
                          Sizes:{" "}
                          <span className="text-neutral-300">
                            {shoe.sizes.join(", ")}
                          </span>
                        </p>
                      )}
                    {Array.isArray(shoe.colors) &&
                      shoe.colors.length > 0 && (
                        <p>
                          Colors:{" "}
                          <span className="text-neutral-300">
                            {shoe.colors.join(", ")}
                          </span>
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions Side */}
          <div className="flex md:flex-col gap-2 justify-end">
            {isEditing ? (
              <>
                <button
                  onClick={onSave}
                  className="p-3 bg-red-600 rounded-xl hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={onCancel}
                  className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onStartEdit}
                  className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-3 bg-red-500/5 rounded-xl hover:bg-red-500/20 transition-colors text-red-500/50 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditInput({ label, value, onChange, isTextArea = false }) {
  return (
    <div className="w-full">
      <label className="text-[9px] uppercase tracking-widest text-neutral-500 mb-1 block">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-500/50 min-h-[80px]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-500/50"
        />
      )}
    </div>
  );
}
