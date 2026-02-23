// src/Pages/Shop.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

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
  const navigate = useNavigate();

  const handleAddToCart = (productName) => {
    setCartCount((prev) => prev + 1);
    console.log(`${productName} added to cart`);
  };

  useEffect(() => {
    async function loadProducts() {
      try {
        const q = query(
          collection(db, "shoes"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
          <p className="text-neutral-400 mb-4 text-xs">Loading products...</p>
        )}
        {error && (
          <p className="text-red-400 mb-4 text-xs">{error}</p>
        )}

        {/* compact grid: more columns, less gap, smaller cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-red-600/40 hover:-translate-y-1 shadow-xl"
            >
              {/* Image Container – shorter aspect for compact card */}
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

                {/* Hover actions – compact buttons */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 p-3">
                  <button
                    onClick={() => handleAddToCart(product.name)}
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

              {/* Product Info – tighter spacing, smaller text */}
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

                {/* Static Add to Cart for mobile – smaller button */}
                <button
                  onClick={() => handleAddToCart(product.name)}
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
                Can't find your exact style? Whether it's a specialized medical
                build or a custom artisan design, we craft shoes that respect
                the unique shape of your feet.
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

      <Footer />
    </div>
  );
}
