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
  Eye,
} from "lucide-react";

export default function AddShoe() {
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
  const [sizesText, setSizesText] = useState("");
  const [colorsText, setColorsText] = useState("");
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
      setImageInputs(imageInputs.filter((_, i) => i !== index));
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
    const sizes = sizesText.split(",").map((s) => s.trim()).filter(Boolean);
    const colors = colorsText.split(",").map((c) => c.trim()).filter(Boolean);

    if (!name || !price || images.length === 0) {
      setError("Product name, price, and at least one image are required.");
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
        sizes,
        colors,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setName(""); setPrice(""); setCategory("bespoke"); setDescription("");
      setTag(""); setImageInputs([""]); setSizesText(""); setColorsText("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingUser) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
      <AdminSidebar />

      <main className="md:ml-64 min-h-screen px-4 py-8 md:px-10 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[1px] w-8 bg-red-600" />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500">New Arrival</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif italic">Curate Inventory</h1>
          </header>

          {!isAdmin ? (
            <div className="p-12 border border-white/5 bg-white/[0.02] rounded-[40px] text-center">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={32} />
              <p className="text-neutral-500 font-serif italic text-sm">Administrative privileges required.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: The Form */}
              <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
                <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[32px] backdrop-blur-sm space-y-8">
                  
                  {success && (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-xs animate-in slide-in-from-top duration-300">
                      <CheckCircle2 size={16} /> Product published successfully.
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs animate-pulse">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <div className="space-y-6">
                    <InputGroup label="Essential Details">
                      <div className="grid grid-cols-1 gap-4">
                        <input
                          type="text"
                          placeholder="Shoe Name (e.g. Oxford Midnight)"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-red-500/40 focus:outline-none transition-all"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Price (e.g. LKR 18,500)"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-red-500/40 focus:outline-none"
                          />
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-red-500/40 focus:outline-none appearance-none text-neutral-400"
                          >
                            <option value="bespoke">Bespoke Classics</option>
                            <option value="medical">Medical & Ortho</option>
                            <option value="uncommon">Uncommon Styles</option>
                          </select>
                        </div>
                      </div>
                    </InputGroup>

                    <InputGroup label="Product Narrative">
                      <textarea
                        placeholder="Describe the craftsmanship, material, and feel..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-red-500/40 focus:outline-none min-h-[120px] resize-none"
                      />
                    </InputGroup>

                    <InputGroup label="Attributes (Comma Separated)">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Sizes: 40, 41, 42..."
                          value={sizesText}
                          onChange={(e) => setSizesText(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-red-500/40 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Colors: Black, Tan..."
                          value={colorsText}
                          onChange={(e) => setColorsText(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-red-500/40 focus:outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Tag (e.g. New Season, Best Seller)"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm mt-4 focus:border-red-500/40 focus:outline-none"
                      />
                    </InputGroup>

                    <InputGroup 
                      label="Media Links" 
                      action={
                        <button type="button" onClick={handleAddImageField} className="text-[10px] font-bold text-red-500 flex items-center gap-1 hover:text-red-400 transition-colors">
                          <Plus size={12} /> ADD IMAGE
                        </button>
                      }
                    >
                      <div className="space-y-3">
                        {imageInputs.map((val, idx) => (
                          <div key={idx} className="relative group">
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => handleImageChange(idx, e.target.value)}
                              placeholder="Direct image URL"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs focus:border-red-500/40 focus:outline-none pr-10"
                            />
                            {imageInputs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeImageField(idx)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-red-500 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </InputGroup>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-5 rounded-[20px] bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-xl shadow-red-900/20 hover:bg-red-500 active:scale-95 transition-all disabled:bg-neutral-800 disabled:text-neutral-600"
                  >
                    {saving ? "Processing Archive..." : "Publish to Storefront"}
                  </button>
                </div>
              </form>

              {/* Right Column: Live Preview Card */}
              <div className="lg:col-span-5 lg:sticky lg:top-12">
                <div className="flex items-center gap-2 mb-6">
                  <Eye size={14} className="text-neutral-500" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Live Preview</h3>
                </div>

                <div className="max-w-[300px] mx-auto lg:mx-0">
                  <div className="bg-white/[0.03] border border-white/5 rounded-[40px] overflow-hidden group">
                    <div className="aspect-[4/5] bg-neutral-900 overflow-hidden relative">
                      {imageInputs[0] ? (
                        <img 
                          src={imageInputs[0]} 
                          alt="Preview" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => e.target.src = "https://placehold.co/400x500/111/333?text=Preview"}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-700">
                          <ImageIcon size={48} strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-red-600 text-[8px] font-black uppercase tracking-widest rounded-full">
                          {category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-medium mb-1 line-clamp-1 truncate">
                        {name || "Product Title"}
                      </h4>
                      <p className="text-red-500 font-mono text-sm mb-3">
                        {price || "LKR 0.00"}
                      </p>
                      <div className="flex items-center gap-2 opacity-40">
                        <Tag size={10} />
                        <span className="text-[9px] uppercase tracking-[0.2em] truncate">
                          {tag || "Unlabeled"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-white/[0.02] border border-dashed border-white/10 rounded-[32px]">
                    <p className="text-[10px] text-neutral-500 leading-relaxed italic">
                      "Make sure image URLs are direct (ending in .jpg, .png). High-resolution portraits work best for the archive display."
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Sub-component for form sections
function InputGroup({ label, children, action }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">{label}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}