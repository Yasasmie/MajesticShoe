// src/Pages/Cart.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Cart() {
  const {
    items,
    loadingCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const totalAmount = items.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = item.quantity || 1;
    return acc + price * qty;
  }, 0);

  const isEmpty = !loadingCart && items.length === 0;

  const handleCheckout = async () => {
    if (!currentUser) {
      alert("Please sign in to checkout.");
      navigate("/signin");
      return;
    }
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const ok = window.confirm(
      "Please confirm your order details.\n\n" +
        `Items: ${items.length}\n` +
        `Total: Rs. ${totalAmount.toLocaleString("en-LK")}\n\n` +
        "Proceed to place this order?"
    );
    if (!ok) return;

    try {
      const orderItems = items.map((item) => ({
        shoeId: item.shoeId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        size: item.size || null,
        color: item.color || null,
        image: item.image || null,
      }));

      await addDoc(collection(db, "orders"), {
        userId: currentUser.uid,
        userEmail: currentUser.email || null,
        phone: null, // fill from profile if you have it
        items: orderItems,
        total: totalAmount,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Optional: open WhatsApp for manual confirmation message
      const msgLines = [
        "New Order Request - Majestic Shoe Palace",
        "",
        `Customer: ${currentUser.email || currentUser.uid}`,
        `Total: Rs. ${totalAmount.toLocaleString("en-LK")}`,
        "",
        "Items:",
        ...orderItems.map(
          (it, idx) =>
            `${idx + 1}. ${it.name} - Rs.${it.price} x ${
              it.quantity
            }` +
            `${it.size ? `, Size ${it.size}` : ""}` +
            `${it.color ? `, ${it.color}` : ""}`
        ),
      ];
      const text = encodeURIComponent(msgLines.join("\n"));
      // 94 is Sri Lanka country code; adjust if needed
      const whatsappUrl = `https://wa.me/94743035311?text=${text}`;
      window.open(whatsappUrl, "_blank");

      clearCart();
      alert("Order placed successfully!");
      navigate("/"); // or navigate("/orders");
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600">
      <NavBar />

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
        <header className="mb-12 border-b border-white/5 pb-8">
          <h1 className="text-4xl font-serif italic mb-2 tracking-tight">
            Your Cart
          </h1>
          <p className="text-neutral-500 text-xs uppercase tracking-[0.3em]">
            Majestic Shoe Palace • {items.length} Items
          </p>
        </header>

        {loadingCart ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isEmpty ? (
          <div className="text-center py-32 bg-[#0A0A0A] rounded-3xl border border-white/5 shadow-xl">
            <ShoppingBag
              className="mx-auto mb-6 text-neutral-800"
              size={48}
            />
            <h2 className="text-xl mb-6 font-light">
              Your shopping bag is empty
            </h2>
            <Link
              to="/shop"
              className="inline-block px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-bold uppercase text-xs tracking-widest active:scale-95"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Product List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => {
                const itemQty = item.quantity || 1;
                const itemSubtotal = Number(item.price) * itemQty;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all group shadow-lg"
                  >
                    <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-[#111] border border-white/5 flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex flex-col justify-between flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-1">
                            {item.size
                              ? `Size ${item.size}`
                              : "Standard"}{" "}
                            {item.color ? `• ${item.color}` : ""}
                          </p>
                          <h2 className="text-xl font-medium tracking-tight uppercase group-hover:text-red-500 transition-colors">
                            {item.name}
                          </h2>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center bg-[#151515] border border-white/10 rounded-full px-2 py-1 shadow-inner">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, itemQty - 1)
                            }
                            className="p-1 hover:text-red-500 transition disabled:opacity-20 disabled:cursor-not-allowed"
                            disabled={itemQty <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-bold font-mono">
                            {itemQty}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, itemQty + 1)
                            }
                            className="p-1 hover:text-red-500 transition"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-semibold text-white tracking-tighter">
                            Rs. {itemSubtotal.toLocaleString("en-LK")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/5 blur-3xl rounded-full" />

                <h3 className="text-lg font-medium mb-8 border-b border-white/5 pb-4 tracking-tight">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-neutral-400">
                    <span className="text-sm">
                      Subtotal ({items.length} items)
                    </span>
                    <span className="text-white font-medium">
                      Rs. {totalAmount.toLocaleString("en-LK")}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span className="text-sm font-light">Delivery Fee</span>
                    <span className="text-green-500 text-[10px] font-bold uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded">
                      Complimentary
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-10 pt-4 border-t border-white/5">
                  <span className="text-lg font-light text-neutral-300">
                    Total
                  </span>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white tracking-tighter">
                      Rs. {totalAmount.toLocaleString("en-LK")}
                    </p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                      LKR Net Amount
                    </p>
                  </div>
                </div>

                <button
                  className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-700 transition-all group active:scale-95 shadow-lg shadow-red-600/20"
                  onClick={handleCheckout}
                >
                  Checkout Now
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </button>

                {!currentUser && (
                  <p className="text-[11px] text-center mt-6 text-neutral-500 leading-relaxed italic">
                    <Link
                      to="/signin"
                      className="text-red-500 hover:underline font-bold not-italic"
                    >
                      Sign In
                    </Link>{" "}
                    to save your wardrobe and checkout faster.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
