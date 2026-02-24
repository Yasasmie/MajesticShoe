// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      setLoadingCart(false);
      return;
    }

    const cartRef = collection(db, "carts", currentUser.uid, "items");
    const q = query(cartRef);

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(list);
        setLoadingCart(false);
      },
      () => {
        setItems([]);
        setLoadingCart(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (!currentUser || newQuantity < 1) return;
    try {
      const itemRef = doc(db, "carts", currentUser.uid, "items", itemId);
      await updateDoc(itemRef, {
        quantity: newQuantity,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!currentUser) return;
    try {
      const itemRef = doc(db, "carts", currentUser.uid, "items", itemId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Clear all items in this user's cart
  const clearCart = async () => {
    if (!currentUser) return;
    try {
      const cartRef = collection(db, "carts", currentUser.uid, "items");
      const snap = await getDocs(cartRef);
      const batchDeletes = snap.docs.map((d) =>
        deleteDoc(doc(db, "carts", currentUser.uid, "items", d.id))
      );
      await Promise.all(batchDeletes);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const cartCount = items.length;

  const value = {
    items,
    cartCount,
    loadingCart,
    updateQuantity,
    removeFromCart,
    clearCart, // exported for Checkout.jsx
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
