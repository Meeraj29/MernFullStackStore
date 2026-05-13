import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { motion } from "framer-motion";

export default function Home() {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    const categor = ["All", "Tablet", "Apple", "Laptop", "Mac"];

    const loadProducts = async () => {
        try {
            const response = await api.get(`/products/view?search=${search}&category=${category === "All" ? "" : category}`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadProducts();
        }, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [search, category]);

    return (
        <div className="min-h-screen bg-[#fcfcfd]">
            {/* Ultra-Modern Hero Section */}
            <section className="relative overflow-hidden bg-white pt-24 pb-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent rounded-full blur-[120px] -z-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-100 shadow-sm">
                            <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-ping"></span>
                            New Arrivals 2026
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8 uppercase">
                            The Future of <br />
                            <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">Hardware</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-slate-500 text-lg font-medium leading-relaxed mb-12">
                            Discover premium technology designed to elevate your creative and professional workflow.
                            Limited inventory, unlimited potential.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => document.getElementById('shop-now').scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all"
                            >
                                Shop Collection
                            </motion.button>

                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Filter Section */}
            <div id="shop-now" className="bg-white border-y border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-1 max-w-2xl w-full items-center bg-slate-100 rounded-4xl p-1.5 border border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all duration-300 shadow-inner">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-white text-slate-700 text-sm font-bold px-6 py-2.5 rounded-2xl border-none focus:ring-0 cursor-pointer hover:bg-slate-50 transition-colors hidden sm:block shadow-sm"
                            >
                                {categor.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <div className="h-6 w-px bg-slate-300 mx-3 hidden sm:block"></div>

                            <input
                                type="text"
                                placeholder="Search premium tech..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-sm text-slate-900 placeholder-slate-400 font-bold"
                            />

                            <button className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Featured <span className="text-indigo-600">Hardware</span></h2>
                        <p className="text-slate-500 mt-2 font-bold text-[10px] uppercase tracking-widest italic">Discover our curated selection of premium technology.</p>
                    </div>
                    <div className="bg-slate-900 px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                        {products.length} Units Found
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <div className="bg-slate-100 aspect-[4/3] rounded-4xl mb-6"></div>
                                <div className="h-6 bg-slate-100 rounded-full w-3/4 mb-4"></div>
                                <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="group relative bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:border-indigo-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] transition-all duration-500 flex flex-col h-full"
                            >
                                <Link to={`/product/${product._id}`} className="block relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-slate-50">
                                    <img
                                        src={product.image || "https://via.placeholder.com/400"}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm border border-white/50">
                                            {product.category}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleWishlist(product._id);
                                        }}
                                        className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm border border-white/50 transition-all z-10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isInWishlist(product._id) ? "fill-rose-500 text-rose-500" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </Link>

                                <div className="p-6 flex flex-col flex-1">
                                    <Link to={`/product/${product._id}`}>
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tight">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-slate-400 mt-2 line-clamp-2 min-h-[40px] font-medium leading-relaxed">
                                        {product.description}
                                    </p>

                                    <div className="mt-8 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Price</span>
                                            <span className="text-2xl font-black text-slate-900 tracking-tighter">
                                                ₹{parseFloat(product.price).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(product._id, 1);
                                                }}
                                                className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all text-slate-400 shadow-sm group-hover:bg-indigo-50 group-hover:text-indigo-600"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(product._id, 1);
                                                    navigate("/cart");
                                                }}
                                                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-[2.5rem] mb-6 text-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No products detected</h3>
                        <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium leading-relaxed">Try adjusting your filters or search terms to find what you're looking for.</p>
                        <button
                            onClick={() => { setSearch(""); setCategory("All"); }}
                            className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
                        >
                            Reset Search
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
