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
      <header className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-red-600/10 to-transparent blur-3xl opacity-50" />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-serif italic text-white mb-4">
            The Collection
          </h1>
          <p className="text-neutral-500 max-w-2xl mx-auto uppercase tracking-[0.3em] text-[10px] font-bold">
            Handcrafted in Kegalle • Precision Fit • Royal Comfort
          </p>
        </div>
      </header>

      {/* FILTER NAVIGATION */}
      <nav className="sticky top-16 z-40 bg-[#050505]/80 backdrop-blur-lg border-y border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-4 md:gap-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
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
      <main className="max-w-7xl mx-auto px-6 py-16">
        {loadingProducts && (
          <p className="text-neutral-400 mb-8">Loading products...</p>
        )}
        {error && <p className="text-red-400 mb-8">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-red-600/30 hover:-translate-y-2 shadow-2xl"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {product.tag && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white text-[9px] font-black uppercase px-3 py-1 tracking-tighter rounded-sm shadow-xl">
                      {product.tag}
                    </span>
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-6">
                  <button
                    onClick={() => handleAddToCart(product.name)}
                    className="w-full bg-red-600 text-white py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-500"
                  >
                    Quick Add to Cart
                  </button>
                  <button
                    onClick={() => navigate(`/shoes/${product.id}`)}
                    className="w-full bg-white text-black py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] uppercase tracking-widest text-red-500 font-black">
                    {product.category}
                  </p>
                  <span className="text-sm font-mono text-white">
                    {product.price}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-neutral-200 group-hover:text-white transition-colors">
                  {product.name}
                </h3>

                {/* Static Add to Cart for mobile */}
                <button
                  onClick={() => handleAddToCart(product.name)}
                  className="mt-6 flex w-full items-center justify-center gap-2 border border-white/10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:border-red-600 transition-all lg:hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
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
        <div className="mt-24 relative rounded-[2.5rem] overflow-hidden border border-red-600/10 bg-[#0A0A0A] p-8 md:p-16 text-center lg:text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px]" />
          <div className="relative z-10 lg:flex lg:items-center lg:justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-serif italic text-white mb-6">
                Uncompromising Quality
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                Can't find your exact style? Whether it's a specialized medical
                build or a custom artisan design, we craft shoes that respect
                the unique shape of your feet.
              </p>
              <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">
                Visit Us at 197, Main Street, Kegalle
              </p>
            </div>
            <button className="mt-10 lg:mt-0 bg-red-600 text-white px-12 py-5 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-700 transition-all rounded-full shadow-lg shadow-red-600/20">
              Request Custom Build
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
