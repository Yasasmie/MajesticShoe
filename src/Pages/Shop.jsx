// src/Pages/Shop.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const categories = [
  { id: "all", name: "All Collections" },
  { id: "bespoke", name: "Bespoke Classics" },
  { id: "medical", name: "Medical & Orthopedic" },
  { id: "uncommon", name: "Uncommon Styles" },
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");

  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [adding, setAdding] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    async function loadProducts() {
      try {
        const q = query(
          collection(db, "shoes"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setProducts(list);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const openVariantModal = (product) => {
    if (!currentUser) {
      navigate("/signin");
      return;
    }

    const sizesArray = Array.isArray(product.sizes) ? product.sizes : [];
    const colorsArray = Array.isArray(product.colors) ? product.colors : [];

    setSelectedProduct(product);
    setSelectedSize(sizesArray[0] || "");
    setSelectedColor(colorsArray[0] || "");
    setShowVariantModal(true);
  };

  const closeVariantModal = () => {
    setShowVariantModal(false);
    setSelectedProduct(null);
    setSelectedSize("");
    setSelectedColor("");
    setAdding(false);
  };

  const handleConfirmAddToCart = async () => {
    if (!currentUser) {
      navigate("/signin");
      return;
    }
    if (!selectedProduct) return;

    if (!selectedSize || !selectedColor) {
      alert("Please select both size and color.");
      return;
    }

    try {
      setAdding(true);
      const cartRef = collection(db, "carts", currentUser.uid, "items");
      await addDoc(cartRef, {
        shoeId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.images?.[0] || "",
        size: selectedSize,
        color: selectedColor,
        createdAt: new Date(),
      });
      setCartCount((prev) => prev + 1);
      alert("Product added to cart");
      closeVariantModal();
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <NavBar cartCount={cartCount} />

      {/* HEADER */}
      <header className="relative pt-24 pb-10 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-red-600/10 to-transparent blur-3xl opacity-50" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-serif italic text-white mb-3">
            The Collection
          </h1>
          <p className="text-neutral-500 max-w-2xl mx-auto uppercase tracking-[0.3em] text-[9px] font-bold">
            Handcrafted in Kegalle • Precision Fit • Royal Comfort
          </p>
        </div>
      </header>

      {/* FILTER NAVIGATION */}
      <nav className="sticky top-16 z-40 bg-[#050505]/90 backdrop-blur-lg border-y border-white/5 py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-3 md:gap-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-[9px] font-black uppercase tracking-[0.18em] transition-all duration-300 ${
                activeCategory === cat.id
                  ? "text-red-500 border-b-2 border-red-600 pb-1"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* PRODUCT GRID */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-10">
        {loadingProducts && (
          <p className="text-neutral-400 mb-4 text-xs">
            Loading products...
          </p>
        )}
        {error && (
          <p className="text-red-400 mb-4 text-xs">{error}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-red-600/40 hover:-translate-y-1 shadow-xl"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {product.tag && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 tracking-tight rounded-sm shadow-lg">
                      {product.tag}
                    </span>
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 p-3">
                  <button
                    onClick={() => openVariantModal(product)}
                    className="w-full bg-red-600 text-white py-2 rounded-full text-[9px] font-black uppercase tracking-[0.16em] hover:bg-red-700 transition-colors transform translate-y-3 group-hover:translate-y-0 duration-300"
                  >
                    Quick Add
                  </button>
                  <button
                    onClick={() => navigate(`/shoes/${product.id}`)}
                    className="w-full bg-white text-black py-2 rounded-full text-[9px] font-black uppercase tracking-[0.16em] hover:bg-neutral-200 transition-colors transform translate-y-3 group-hover:translate-y-0 duration-300 delay-75"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-red-500 font-black line-clamp-1">
                    {product.category}
                  </p>
                  <span className="text-[11px] font-mono text-white">
                    {product.price}
                  </span>
                </div>
                <h3 className="text-[12px] sm:text-[13px] font-medium text-neutral-200 group-hover:text-white transition-colors line-clamp-2 min-h-[32px]">
                  {product.name}
                </h3>

                {/* Static Add to Cart for mobile */}
                <button
                  onClick={() => openVariantModal(product)}
                  className="mt-3 flex w-full items-center justify-center gap-1 border border-white/10 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.18em] hover:bg-red-600 hover:border-red-600 transition-all lg:hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CALLOUT */}
        <div className="mt-16 md:mt-20 relative rounded-[2rem] overflow-hidden border border-red-600/10 bg-[#0A0A0A] p-6 md:p-10 text-center lg:text-left">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 blur-[90px]" />
          <div className="relative z-10 lg:flex lg:items-center lg:justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-serif italic text-white mb-4">
                Uncompromising Quality
              </h2>
              <p className="text-neutral-400 text-[13px] leading-relaxed mb-3">
                Can&apos;t find your exact style? Whether it&apos;s a specialized
                medical build or a custom artisan design, we craft shoes that
                respect the unique shape of your feet.
              </p>
              <p className="text-red-500 text-[9px] font-black uppercase tracking-[0.2em]">
                Visit Us at 197, Main Street, Kegalle
              </p>
            </div>
            <button className="mt-6 lg:mt-0 bg-red-600 text-white px-10 py-4 font-black uppercase tracking-[0.2em] text-[9px] hover:bg-red-700 transition-all rounded-full shadow-lg shadow-red-600/20">
              Request Custom Build
            </button>
          </div>
        </div>
      </main>

      {/* Variant selection modal */}
      {showVariantModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0A0A0A] border border-white/10 p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-red-500 font-black">
                  {selectedProduct.category}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  {selectedProduct.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeVariantModal}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-[#050505]">
                {selectedProduct.images?.[0] ? (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-neutral-400">
                  Handcrafted in Kegalle • Precision Fit • Royal Comfort
                </p>
                <p className="mt-2 text-sm font-mono text-white">
                  {selectedProduct.price}
                </p>
              </div>
            </div>

            {/* Sizes */}
            {Array.isArray(selectedProduct.sizes) &&
              selectedProduct.sizes.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2 font-bold">
                    Choose Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border ${
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

            {/* Colors */}
            {Array.isArray(selectedProduct.colors) &&
              selectedProduct.colors.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2 font-bold">
                    Choose Color
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border ${
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

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleConfirmAddToCart}
                disabled={adding}
                className="flex-1 rounded-full bg-red-600 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white hover:bg-red-700 transition-all disabled:bg-red-500/60"
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>
              <button
                type="button"
                onClick={closeVariantModal}
                className="flex-1 rounded-full border border-white/15 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-neutral-200 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
