// src/Admin/AddShoe.jsx
import React, { useEffect, useState, useMemo } from "react";
import Footer from "../Components/Footer";
import AdminSidebar from "../Components/AdminSidebar";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  Plus,
  Image as ImageIcon,
  Tag,
  Type,
  DollarSign,
  AlignLeft,
  Layers,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AdminPanel() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("bespoke");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [imageInputs, setImageInputs] = useState([""]);
  const [sizesText, setSizesText] = useState("");   // comma-separated sizes
  const [colorsText, setColorsText] = useState(""); // comma-separated colors
  const [saving, setSaving] = useState(false);

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

  const handleImageChange = (index, value) => {
    const arr = [...imageInputs];
    arr[index] = value;
    setImageInputs(arr);
  };

  const handleAddImageField = () => setImageInputs([...imageInputs, ""]);

  const removeImageField = (index) => {
    if (imageInputs.length > 1) {
      const arr = imageInputs.filter((_, i) => i !== index);
      setImageInputs(arr);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!isAdmin) {
      setError("Unauthorized access.");
      return;
    }

    const images = imageInputs.map((url) => url.trim()).filter(Boolean);
    const sizes = sizesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const colors = colorsText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (!name || !price || !category || images.length === 0) {
      setError(
        "Please fill in name, price, category and provide at least one image."
      );
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, "shoes"), {
        name,
        price,
        category,
        description,
        tag,
        images,
        sizes,   // array
        colors,  // array
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setName("");
      setPrice("");
      setCategory("bespoke");
      setDescription("");
      setTag("");
      setImageInputs([""]);
      setSizesText("");
      setColorsText("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
      <AdminSidebar />

      <main className="md:ml-64 min-h-screen px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[1px] w-10 bg-red-600" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
                Inventory Management
              </p>
            </div>
            <h1 className="text-4xl font-serif italic">Add New Masterpiece</h1>
          </header>

          {!isAdmin ? (
            <div className="flex flex-col items-center justify-center p-12 border border-red-500/20 bg-red-500/5 rounded-3xl">
              <AlertCircle className="text-red-500 mb-4" size={40} />
              <p className="text-red-200">
                Only authorized administrators can add products.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
                  {success && (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                      <CheckCircle2 size={18} /> Shoe added successfully to the
                      catalog!
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      <AlertCircle size={18} /> {error}
                    </div>
                  )}

                  <InputField label="Shoe Name" icon={<Type size={14} />}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input-custom"
                      placeholder="e.g. Royal Sovereign Brogue"
                    />
                  </InputField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Price"
                      icon={<DollarSign size={14} />}
                    >
                      <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="form-input-custom"
                        placeholder="LKR 24,000"
                      />
                    </InputField>

                    <InputField
                      label="Category"
                      icon={<Layers size={14} />}
                    >
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="form-input-custom appearance-none"
                      >
                        <option value="bespoke">Bespoke Classics</option>
                        <option value="medical">Medical & Orthopedic</option>
                        <option value="uncommon">Uncommon Styles</option>
                      </select>
                    </InputField>
                  </div>

                  <InputField label="Product Tag" icon={<Tag size={14} />}>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="form-input-custom"
                      placeholder="Hand-Stitched, Premium Leather..."
                    />
                  </InputField>

                  <InputField
                    label="Description"
                    icon={<AlignLeft size={14} />}
                  >
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="form-input-custom h-32 resize-none"
                      placeholder="Detailed craftsmanship information..."
                    />
                  </InputField>

                  <InputField label="Available Sizes" icon={<Type size={14} />}>
                    <input
                      type="text"
                      value={sizesText}
                      onChange={(e) => setSizesText(e.target.value)}
                      className="form-input-custom"
                      placeholder="e.g. 39, 40, 41, 42"
                    />
                    <p className="mt-1 text-[10px] text-neutral-500">
                      Enter sizes separated by commas.
                    </p>
                  </InputField>

                  <InputField
                    label="Available Colors"
                    icon={<Tag size={14} />}
                  >
                    <input
                      type="text"
                      value={colorsText}
                      onChange={(e) => setColorsText(e.target.value)}
                      className="form-input-custom"
                      placeholder="e.g. Black, Brown, Tan"
                    />
                    <p className="mt-1 text-[10px] text-neutral-500">
                      Enter colors separated by commas.
                    </p>
                  </InputField>
                </div>
              </div>

              {/* Right Column: Media */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-3xl shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} className="text-red-500" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-300">
                        Media Assets
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImageField}
                      className="text-[10px] bg-white/5 hover:bg-red-600 transition-colors px-3 py-1.5 rounded-full uppercase font-bold tracking-tighter"
                    >
                      + Add Link
                    </button>
                  </div>

                  <div className="space-y-4 mb-8">
                    {imageInputs.map((val, idx) => (
                      <div key={idx} className="relative group">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) =>
                            handleImageChange(idx, e.target.value)
                          }
                          className="form-input-custom pr-10"
                          placeholder="Image URL"
                        />
                        {imageInputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(idx)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Image Preview Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {imageInputs.map(
                      (url, idx) =>
                        url && (
                          <div
                            key={idx}
                            className="aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-white/10 group relative"
                          >
                            <img
                              src={url}
                              alt="Preview"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src =
                                  "https://placehold.co/400x400/0a0a0a/red?text=Invalid+Link";
                              }}
                            />
                          </div>
                        )
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-5 rounded-2xl bg-red-600 hover:bg-red-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-red-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Publish to Store
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />

      {/* Tailwind-like helper (only if your setup supports it) */}
      <style jsx>{`
        .form-input-custom {
          @apply w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm transition-all;
          @apply focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50;
          @apply placeholder:text-neutral-600;
        }
      `}</style>
    </div>
  );
}

// Helper Component
function InputField({ label, icon, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-red-500">{icon}</span>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}
