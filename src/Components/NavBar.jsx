import React, { useMemo, useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Menu, X, Bell, ShoppingCart, User, LogOut } from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc,
  writeBatch
} from "firebase/firestore";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
];

export default function NavBar() {
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifOrder, setSelectedNotifOrder] = useState(null);
  const [loadingNotif, setLoadingNotif] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartCount } = useCart();

  const isAuthed = !!currentUser;
  const userName = currentUser?.displayName || currentUser?.email || "";

  // Real-time Notification Listener
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const q = query(collection(db, "notifications"), where("userId", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setNotifications(sorted);
    }, (error) => console.error("Notification listener error:", error));
    return () => unsub();
  }, [currentUser]);

  // Calculate unread notifications for the badge
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try { await updateDoc(doc(db, "notifications", notif.id), { read: true }); } 
      catch (err) { console.error(err); }
    }
    setLoadingNotif(true);
    try {
      const orderSnap = await getDoc(doc(db, "orders", notif.orderId));
      if (orderSnap.exists()) setSelectedNotifOrder(orderSnap.data());
    } catch (err) { console.error(err); } 
    finally { setLoadingNotif(false); }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0 || !window.confirm("Clear all notifications?")) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((notif) => batch.delete(doc(db, "notifications", notif.id)));
      await batch.commit();
      setNotifications([]); 
      setNotifOpen(false);
    } catch (err) { alert("Error clearing notifications."); }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAccountOpen(false);
      setMobileMenuOpen(false);
      navigate("/signin");
    } catch (err) { console.error(err); }
  };

  const closeAllMenus = () => {
    setAccountOpen(false);
    setNotifOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    // "fixed top-0 w-full" ensures the navbar stays at the top on both mobile and desktop
    <header className="fixed top-0 left-0 w-full z-[100] border-b border-white/10 bg-[#050505] shadow-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
        
        {/* BRAND */}
        <Link to="/" className="flex items-center gap-2 group" onClick={closeAllMenus}>
          <div className="relative overflow-hidden rounded-lg bg-white p-1">
            <img src="/logo.jpeg" alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-black text-white uppercase tracking-tighter">MAJESTIC</div>
            <div className="text-[9px] font-black uppercase text-red-600 tracking-widest">Shoe Palace</div>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} className={({ isActive }) => [
                "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                isActive ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-neutral-400 hover:text-white"
              ].join(" ")}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-1 md:gap-3">
          
          {/* NOTIFICATIONS */}
          {isAuthed && (
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setAccountOpen(false); setMobileMenuOpen(false); }} className="relative flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10">
                <Bell size={18} />
                {/* NOTIFICATION BADGE - Displays unread count */}
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-[#050505]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-[-40px] md:right-0 mt-3 w-64 md:w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl z-[110]">
                  <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Activity</span>
                    {notifications.length > 0 && !selectedNotifOrder && (
                      <button onClick={clearAllNotifications} className="text-[8px] text-red-500 font-black uppercase">Clear</button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {!selectedNotifOrder ? (
                       notifications.length === 0 ? <div className="p-8 text-center text-[10px] text-neutral-600">No activity</div> :
                       notifications.map(n => (
                         <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/[0.03] ${!n.read ? 'bg-red-600/[0.05]' : ''}`}>
                           <p className={`text-[11px] leading-snug ${!n.read ? 'text-white font-medium' : 'text-neutral-500'}`}>{n.message}</p>
                         </div>
                       ))
                    ) : (
                      <div className="p-3">
                        <button onClick={() => setSelectedNotifOrder(null)} className="text-[9px] text-white underline mb-3 uppercase font-bold">← Back</button>
                        {selectedNotifOrder.items?.map((item, i) => (
                           <div key={i} className="flex gap-2 items-center mb-2 bg-white/5 p-2 rounded-lg">
                             <img src={item.image} className="h-7 w-7 rounded object-cover" />
                             <span className="text-[9px] text-white truncate font-bold uppercase">{item.name}</span>
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CART */}
          <Link to="/cart" onClick={closeAllMenus} className="relative flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10">
            <ShoppingCart size={18} />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-[#050505]">
              {cartCount || 0}
            </span>
          </Link>

          {/* ACCOUNT */}
          <div className="relative">
            <button 
              onClick={() => {setAccountOpen(!accountOpen); setNotifOpen(false); setMobileMenuOpen(false);}} 
              className="flex items-center gap-2 rounded-full md:border md:border-white/10 md:bg-white/5 md:px-4 md:py-2 text-[10px] font-black uppercase text-white hover:bg-red-600 transition-all h-10 md:h-auto w-10 md:w-auto justify-center"
            >
              <User size={18} className="md:size-[14px]" /> 
              <span className="hidden md:block">{isAuthed ? userName.split('@')[0] : "Account"}</span>
            </button>
            
            {accountOpen && (
              <div className="absolute right-0 mt-3 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl z-[110]">
                <ul className="py-1 text-[10px] font-bold uppercase">
                  {isAuthed ? (
                    <>
                      <li><Link to="/profile" className="block px-4 py-3 text-neutral-400 hover:text-white" onClick={closeAllMenus}>Profile</Link></li>
                      <li><button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-600/10">Logout</button></li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/signin" className="block px-4 py-3 text-neutral-400 hover:text-white" onClick={closeAllMenus}>Sign In</Link></li>
                      <li><Link to="/register" className="block px-4 py-3 text-neutral-400 hover:text-white" onClick={closeAllMenus}>Register</Link></li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER */}
          <button 
            onClick={() => { setMobileMenuOpen(true); setNotifOpen(false); setAccountOpen(false); }} 
            className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* MOBILE NAV OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          
          <div className="absolute right-4 top-4 w-[180px] bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-red-600">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => [
                    "px-3 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all",
                    isActive ? "bg-red-600 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                  ].join(" ")}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}