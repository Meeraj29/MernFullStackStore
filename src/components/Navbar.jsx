import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useNotifications } from "../context/NotificationContext";
import { useTheme } from "../context/ThemeContext";
import { Bell, Check, Trash2, Clock, Sun, Moon } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();
    const { user } = useAuth();
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
    const { theme, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    const handleNotificationClick = (n) => {
        markAsRead(n.id);
        if (n.type === "product" && n.id !== "welcome") {
            navigate(`/product/${n.id}`);
            setShowNotifications(false);
        }
    };

    return (
        <motion.nav
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="sticky top-0 z-50 border-b border-indigo-100/70 bg-white/90 shadow-lg shadow-indigo-100/40 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/80 dark:shadow-none"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 py-3 sm:flex-nowrap sm:gap-6">
                    {/* Brand Logo */}
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                        <Link to="/" className="group flex shrink-0 items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 via-fuchsia-500 to-rose-500 text-lg font-black text-white shadow-lg shadow-indigo-200 transition-transform duration-300 group-hover:rotate-6">
                                S
                            </span>
                            <span className="bg-linear-to-r from-gray-950 via-indigo-700 to-fuchsia-600 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent dark:from-white dark:via-indigo-400 dark:to-fuchsia-400">
                                Store
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden items-center rounded-full bg-indigo-50/80 p-1 text-sm font-bold text-gray-500 lg:flex dark:bg-white/5 dark:text-gray-400">
                        <Link
                            to="/"
                            className="rounded-full px-5 py-2 text-indigo-700 transition-all duration-300 hover:bg-white hover:text-fuchsia-600 hover:shadow-sm dark:text-indigo-300 dark:hover:bg-white/10 dark:hover:text-fuchsia-400"
                        >
                            Home
                        </Link>
                    </div>

                    {/* Action Group */}
                    <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-4">
                        {/* Cart icon in Navbar */}
                        <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/cart" className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-gray-700 transition-all duration-300 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:-rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <motion.span
                                    key={cartCount}
                                    initial={{ scale: 0.75 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black text-white shadow-md"
                                >
                                    {cartCount}
                                </motion.span>
                            </Link>
                        </motion.div>

                        {/* Wishlist icon in Navbar */}
                        <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/wishlist" className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition-all duration-300 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {wishlist?.products?.length > 0 && (
                                    <motion.span
                                        initial={{ scale: 0.75 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 px-1 text-[10px] font-black text-white shadow-md"
                                    >
                                        {wishlist.products.length}
                                    </motion.span>
                                )}
                            </Link>
                        </motion.div>

                        {/* Notification Bell */}
                        <div className="relative">
                            <motion.button
                                whileHover={{ y: -2, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ${
                                    showNotifications ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-indigo-600/20"
                                }`}
                            >
                                <Bell className={`h-6 w-6 transition-transform duration-300 ${showNotifications ? "rotate-12" : "group-hover:rotate-12"}`} />
                                {unreadCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black text-white shadow-md"
                                    >
                                        {unreadCount}
                                    </motion.span>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div key="notifications-container">
                                        <motion.div
                                            key="notifications-backdrop"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setShowNotifications(false)}
                                            className="fixed inset-0 z-40"
                                        />
                                        <motion.div
                                            key="notifications-dropdown"
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-80 z-50 overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900"
                                        >
                                            <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/5">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Notifications</h3>
                                                <button 
                                                    onClick={clearAll}
                                                    className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map((n) => (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => handleNotificationClick(n)}
                                                            className={`relative flex flex-col gap-1 border-b border-gray-50 p-4 transition-colors hover:bg-gray-50 cursor-pointer dark:border-white/5 dark:hover:bg-white/5 ${
                                                                !n.read ? "bg-indigo-50/30 dark:bg-indigo-500/10" : ""
                                                            }`}
                                                        >
                                                            {!n.read && (
                                                                <div className="absolute left-2 top-5 h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                                                            )}
                                                            <div className="flex items-center justify-between gap-2 pl-2">
                                                                <p className="text-xs font-black uppercase italic text-gray-900 dark:text-white">{n.title}</p>
                                                                <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                                                                    <Clock size={10} />
                                                                    {n.time}
                                                                </div>
                                                            </div>
                                                            <p className="pl-2 text-[11px] font-medium leading-relaxed text-gray-500 line-clamp-2">
                                                                {n.description}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                                                            <Bell size={32} />
                                                        </div>
                                                        <p className="text-xs font-black uppercase italic text-gray-400">All caught up!</p>
                                                        <p className="mt-1 text-[10px] font-bold text-gray-300 uppercase tracking-tight">No new notifications at this time.</p>
                                                    </div>
                                                )}
                                            </div>
                                            {notifications.length > 0 && (
                                                <div className="bg-gray-50/50 p-3 text-center border-t border-gray-50">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">End of transmission</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        {/* Theme Toggle Button */}
                        <motion.button
                            whileHover={{ y: -2, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTheme}
                            className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 text-gray-700 transition-all duration-300 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-indigo-600 dark:hover:text-white"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
                            ) : (
                                <Sun className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                            )}
                        </motion.button>

                        {user ? (
                            <>

                                <Link to={(user.role === "admin" || user.role === "superadmin") ? "/admin/profile" : "/profile"} className="group flex min-w-0 items-center gap-3 border-l border-indigo-100 pl-3 sm:pl-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {(user.role === "admin" || user.role === "superadmin") ? "Admin Account" : "Customer Account"}
                                        </p>
                                        <p className="max-w-36 truncate text-sm font-black text-gray-900 transition-colors group-hover:text-fuchsia-600 dark:text-white">{user.name}</p>
                                    </div>
                                    <motion.div whileHover={{ rotate: 8, scale: 1.08 }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-100 to-fuchsia-100 font-black text-indigo-700 shadow-sm transition-all duration-300 group-hover:from-indigo-600 group-hover:to-fuchsia-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200 dark:from-white/10 dark:to-white/5 dark:text-indigo-400">
                                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </motion.div>
                                </Link>
                            </>
                        ) : (
                            <>
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                                    <Link to="/login" className="rounded-2xl px-3 py-2 text-sm font-bold text-gray-700 transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-700 sm:px-4 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-indigo-400">
                                        Log in
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                                    <Link to="/signup" className="rounded-2xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:from-indigo-700 hover:to-rose-500 hover:shadow-fuchsia-200 sm:px-6">
                                        Sign up
                                    </Link>
                                </motion.div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
