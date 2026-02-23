// src/Components/AdminSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const adminLinks = [
  { label: "Dashboard", path: "/admin", icon: DashboardIcon },
  { label: "All Shoes", path: "/admin/shoes", icon: ShoesIcon },
  { label: "Add Shoe", path: "/admin/add-shoe", icon: AddIcon },
  { label: "Orders", path: "/admin/orders", icon: OrdersIcon },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (err) {
      console.error("Admin logout error:", err);
    }
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-[#070707] border-r border-white/10 text-white min-h-screen fixed left-0 top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="relative overflow-hidden rounded-lg bg-white p-1">
          <img
            src="/logo.jpeg"
            alt="Majestic Shoe Palace"
            className="h-9 w-auto object-contain"
          />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tighter text-white">
            MAJESTIC
          </div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600">
            Admin Panel
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {adminLinks.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold tracking-wide transition-all",
                isActive
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "text-neutral-400 hover:text-white hover:bg-white/5",
              ].join(" ")
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="uppercase tracking-[0.18em]">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 px-4 py-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300 hover:bg-red-600 hover:text-white transition-all"
        >
          <LogoutIcon className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

/** Simple SVG Icons **/

function DashboardIcon({ className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 13h8V3H3z" />
      <path d="M13 21h8v-8h-8z" />
      <path d="M13 3v6h8V3z" />
      <path d="M3 15v6h8v-6z" />
    </svg>
  );
}

function ShoesIcon({ className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19h16l-1-5-5-2-3 2-4-3-3 1z" />
      <path d="M4 19v-6" />
    </svg>
  );
}

function AddIcon({ className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function OrdersIcon({ className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10" />
      <path d="M7 12h6" />
    </svg>
  );
}

function LogoutIcon({ className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
