import { Link } from "react-router";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

export default function Wishlist() {
    const { wishlist, loading, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fcfcfd]">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-50 rounded-full mb-6 text-rose-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Wishlist Empty</h1>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Save your favorite hardware here and never lose track of what you love.</p>
                    <Link to="/" className="inline-block bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                        Explore Hardware
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfd] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black text-gray-900 tracking-tight uppercase"
                        >
                            Your <span className="text-rose-500">Wishlist</span>
                        </motion.h1>
                        <p className="text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-widest italic">Curated premium selection</p>
                    </div>
                    <div className="bg-rose-50 px-4 py-2 rounded-full text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-100">
                        {wishlist.products.length} Items Saved
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {wishlist.products.map((item) => {
                        const product = item.productId;
                        if (!product) return null;

                        return (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative bg-white rounded-3xl p-4 border border-gray-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col h-full"
                            >
                                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 mb-4">
                                    <Link to={`/product/${product._id}`}>
                                        <img
                                            src={product.image || "https://via.placeholder.com/400"}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleWishlist(product._id);
                                        }}
                                        className="absolute top-3 right-3 h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white shadow-sm border border-white transition-all z-10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex flex-col flex-1">
                                    <Link to={`/product/${product._id}`}>
                                        <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    <div className=" flex items-end justify-between mt-auto">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</p>
                                            <p className="text-xl font-black text-gray-900">
                                                ₹{parseFloat(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => addToCart(product._id, 1)}
                                            className="bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
