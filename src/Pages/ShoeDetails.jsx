// src/Pages/ShoeDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { db } from "../firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function ShoeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [shoe, setShoe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadShoe() {
      try {
        const refDoc = doc(db, "shoes", id);
        const snap = await getDoc(refDoc);
        if (!snap.exists()) {
          throw new Error("Shoe not found");
        }
        const data = snap.data();
        setShoe({ id: snap.id, ...data });

        setActiveImageIndex(0);
        const sizesArray = Array.isArray(data.sizes) ? data.sizes : [];
        const colorsArray = Array.isArray(data.colors) ? data.colors : [];
        setSelectedSize(sizesArray[0] || "");
        setSelectedColor(colorsArray[0] || "");
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load shoe");
      } finally {
        setLoading(false);
      }
    }
    loadShoe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <NavBar />
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-neutral-300">Loading shoe details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !shoe) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <NavBar />
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-md text-center">
            <p className="text-red-400 mb-4">
              {error || "Shoe not found."}
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="mt-2 rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.3em] text-white hover:bg-red-700"
            >
              Back to Shop
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasImages = Array.isArray(shoe.images) && shoe.images.length > 0;
  const mainImageSrc =
    hasImages && shoe.images[activeImageIndex]
      ? shoe.images[activeImageIndex]
      : "";

  const sizes = Array.isArray(shoe.sizes) ? shoe.sizes : [];
  const colors = Array.isArray(shoe.colors) ? shoe.colors : [];

  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate("/signin");
      return;
    }
    if (!selectedSize || !selectedColor) {
      alert("Please select both size and color.");
      return;
    }

    try {
      setAdding(true);
      const cartRef = collection(
        db,
        "carts",
        currentUser.uid,
        "items"
      );
      await addDoc(cartRef, {
        shoeId: shoe.id,
        name: shoe.name,
        price: shoe.price,
        image: shoe.images?.[0] || "",
        size: selectedSize,
        color: selectedColor,
        createdAt: new Date(),
      });
      alert("Product added to cart");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <NavBar />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-white"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A]">
              {mainImageSrc ? (
                <img
                  src={mainImageSrc}
                  alt={shoe.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                  No image
                </div>
              )}
            </div>

            {hasImages && shoe.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {shoe.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-square overflow-hidden rounded-2xl border ${
                      activeImageIndex === idx
                        ? "border-red-500"
                        : "border-white/10"
                    } bg-[#0A0A0A]`}
                  >
                    <img
                      src={img}
                      alt={`${shoe.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-red-500 font-black">
                {shoe.category}
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-serif italic text-white">
                {shoe.name}
              </h1>
              {shoe.tag && (
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  {shoe.tag}
                </p>
              )}
              <p className="mt-4 text-lg font-mono text-white">
                {shoe.price}
              </p>

              {shoe.description && (
                <p className="mt-6 text-sm leading-relaxed text-neutral-300">
                  {shoe.description}
                </p>
              )}

              {sizes.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2 font-bold">
                    Available Sizes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] border ${
                          selectedSize === size
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2 font-bold">
                    Available Colors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] border ${
                          selectedColor === color
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 space-y-3">
              <button
                className="w-full rounded-full bg-red-600 py-4 text-xs font-black uppercase tracking-[0.3em] text-white hover:bg-red-700 transition-all disabled:bg-red-500/60"
                onClick={handleAddToCart}
                disabled={adding}
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>
              <p className="text-[11px] text-neutral-500 uppercase tracking-[0.2em]">
                Handcrafted in Kegalle • Precision Fit • Royal Comfort
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
