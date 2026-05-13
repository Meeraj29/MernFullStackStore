import { Link } from "react-router";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

export default function Navbar() {
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();
    const { user } = useAuth();

    return (
        <motion.nav
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="sticky top-0 z-50 border-b border-indigo-100/70 bg-white/90 shadow-lg shadow-indigo-100/40 backdrop-blur-xl"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 py-3 sm:flex-nowrap sm:gap-6">
                    {/* Brand Logo */}
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                        <Link to="/" className="group flex shrink-0 items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-fuchsia-500 to-rose-500 text-lg font-black text-white shadow-lg shadow-indigo-200 transition-transform duration-300 group-hover:rotate-6">
                                S
                            </span>
                            <span className="bg-gradient-to-r from-gray-950 via-indigo-700 to-fuchsia-600 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent">
                                Store
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden items-center rounded-full bg-indigo-50/80 p-1 text-sm font-bold text-gray-500 lg:flex">
                        <Link
                            to="/"
                            className="rounded-full px-5 py-2 text-indigo-700 transition-all duration-300 hover:bg-white hover:text-fuchsia-600 hover:shadow-sm"
                        >
                            Home
                        </Link>
                    </div>

                    {/* Action Group */}
                    <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-4">
                        {/* Cart icon in Navbar */}
                        <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/cart" className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-gray-700 transition-all duration-300 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200">
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
                            <Link to="/wishlist" className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition-all duration-300 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-200">
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

                        {user ? (
                            <>

                                <Link to={(user.role === "admin" || user.role === "superadmin") ? "/admin/profile" : "/profile"} className="group flex min-w-0 items-center gap-3 border-l border-indigo-100 pl-3 sm:pl-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {(user.role === "admin" || user.role === "superadmin") ? "Admin Account" : "Customer Account"}
                                        </p>
                                        <p className="max-w-36 truncate text-sm font-black text-gray-900 transition-colors group-hover:text-fuchsia-600">{user.name}</p>
                                    </div>
                                    <motion.div whileHover={{ rotate: 8, scale: 1.08 }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-fuchsia-100 font-black text-indigo-700 shadow-sm transition-all duration-300 group-hover:from-indigo-600 group-hover:to-fuchsia-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200">
                                        {user.name.charAt(0).toUpperCase()}
                                    </motion.div>
                                </Link>
                            </>
                        ) : (
                            <>
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                                    <Link to="/login" className="rounded-2xl px-3 py-2 text-sm font-bold text-gray-700 transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-700 sm:px-4">
                                        Log in
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                                    <Link to="/signup" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:from-indigo-700 hover:to-rose-500 hover:shadow-fuchsia-200 sm:px-6">
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
