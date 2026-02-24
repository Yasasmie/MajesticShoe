// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Shop from "./Pages/Shop";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Cart from "./Pages/Cart";
import Login from "./Pages/SignIn";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import MapPage from "./Pages/MapPage";
import AddShoe from "./Admin/AddShoe";
import ShoeDetails from "./Pages/ShoeDetails";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./Admin/AdminDashboard";
import AllShoes from "./Admin/AllShoes";
import Orders from "./Admin/Orders";
import Checkout from "./Pages/Checkout";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shoes/:id" element={<ShoeDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add-shoe" element={<AddShoe />} />
        <Route path="/admin/shoes" element={<AllShoes />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin/orders" element={<Orders />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
