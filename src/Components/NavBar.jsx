// src/Components/NavBar.jsx
import React, { useMemo, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartCount } = useCart();

  const isAuthed = !!currentUser;
  const userName =
    currentUser?.displayName || currentUser?.email || "";

  const authLinks = useMemo(() => {
    if (isAuthed) {
      return [
        { label: "Profile", path: "/profile", type: "link" },
        { label: "Logout", path: "#logout", type: "logout" },
      ];
    }
    return [
      { label: "Sign in", path: "/signin", type: "link" },
      { label: "Register", path: "/register", type: "link" },
    ];
  }, [isAuthed]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAccountOpen(false);
      setOpen(false);
      navigate("/signin");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505] backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* BRAND */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative overflow-hidden rounded-lg bg-white p-1 transition-transform group-hover:scale-105">
            <img
              src="/logo.jpeg"
              alt="Majestic Shoe Palace"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tighter text-white">
              MAJESTIC
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
              Shoe Palace
            </div>
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <ul className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  [
                    "rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition-all",
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-neutral-400 hover:text-white hover:bg-white/5",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {/* CART */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-white transition-all hover:bg-white/10 hover:text-red-500"
            aria-label="View Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg ring-2 ring-[#050505]">
              {cartCount || 0}
            </span>
          </Link>

          {/* ACCOUNT (desktop) */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-red-600"
            >
              {isAuthed && userName ? `Hi, ${userName}` : "Account"}
              <svg
                className={`h-3 w-3 transition-transform ${
                  accountOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {accountOpen && (
              <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
                <ul className="py-2 text-[11px] font-bold uppercase tracking-widest">
                  {authLinks.map((item) => (
                    <li key={item.label}>
                      {item.type === "logout" ? (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="block w-full px-5 py-3 text-left text-neutral-400 transition-colors hover:bg:white/5 hover:text-white"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            [
                              "block px-5 py-3 transition-colors",
                              isActive
                                ? "bg-red-600 text-white"
                                : "text-neutral-400 hover:bg-white/5 hover:text-white",
                            ].join(" ")
                          }
                          onClick={() => setAccountOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text:white hover:bg-red-600 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {open && (
        <div className="border-t border-white/10 bg-[#0A0A0A] md:hidden">
          <div className="px-6 py-8">
            <ul className="flex flex-col gap-4">
              {NAV_LINKS.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      [
                        "block text-lg font-serif italic transition-all",
                        isActive
                          ? "text-red-500 translate-x-2"
                          : "text-white",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}

              <li className="mt-6 border-t border-white/5 pt-6">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-red-600">
                  Member Access
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {authLinks.map((item) =>
                    item.type === "logout" ? (
                      <button
                        key={item.label}
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg bg-white/5 px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-red-600"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className="rounded-lg bg:white/5 px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-red-600"
                      >
                        {item.label}
                      </NavLink>
                    )
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
