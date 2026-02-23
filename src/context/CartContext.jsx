import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc,
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

  // --- New Function: Update Quantity in Firestore ---
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

  // --- New Function: Remove Item from Firestore ---
  const removeFromCart = async (itemId) => {
    if (!currentUser) return;
    try {
      const itemRef = doc(db, "carts", currentUser.uid, "items", itemId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const cartCount = items.length;

  const value = {
    items,
    cartCount,
    loadingCart,
    updateQuantity, // Exported to be used in Cart.jsx
    removeFromCart, // Exported to be used in Cart.jsx
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}