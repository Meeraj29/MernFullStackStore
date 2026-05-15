import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

export default function Productdetails() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();

    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ message: "", type: "" });

    // Sharing states
    const [showShare, setShowShare] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState("");
    const [sharing, setSharing] = useState(false);
    const [shareStatus, setShareStatus] = useState("");

    const handleEmailShare = async () => {
        if (!recipientEmail) return setShareStatus("Please enter an email");
        setSharing(true);
        setShareStatus("Connecting to SMTP server...");
        try {
            await api.post("/products/share-email", {
                productId: product._id,
                recipientEmail,
                senderName: user?.name || "A Nexus User"
            });
            setShareStatus("Success! Product shared via email.");
            setRecipientEmail("");
            setTimeout(() => {
                setShareStatus("");
                setShowShare(false);
            }, 3000);
        } catch (error) {
            setShareStatus("Sharing failed. Check your server config.");
        } finally {
            setSharing(false);
        }
    };
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message;
                setStatus({ message: errorMsg, type: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);
    if (loading) {
        return <div>Loading...</div>;
    }
    if (status.type === "error") {
        return <div>{status.message}</div>;
    }
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className="mb-8 flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Store
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-1/2 relative bg-gray-100 flex items-center justify-center p-8">
                        <div className="absolute top-6 left-6">
                            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                {product.category}
                            </span>
                        </div>
                        <img
                            src={product.image || "https://via.placeholder.com/600"}
                            alt={product.title}
                            className="max-h-[500px] w-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                    {product.title}
                                </h1>
                                <button
                                    onClick={() => toggleWishlist(product._id)}
                                    className={`p-3 rounded-full  shrink-0 transition-all ${isInWishlist(product._id) ? "bg-rose-50 text-rose-500" : "bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50"}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${isInWishlist(product._id) ? "fill-current" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>



                            <div className="mb-8">
                                <span className="text-4xl font-black text-indigo-600">₹{parseFloat(product.price).toFixed(2)}</span>
                                <span className="ml-4 text-sm font-bold text-green-500 uppercase tracking-wide">In Stock ({product.stock})</span>
                            </div>

                            <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Description</h3>
                                <p className="leading-relaxed">
                                    {product.description || "No description available for this product."}
                                </p>
                            </div>

                            {/* Tech Specs Section */}
                            {(product.ram || product.storage || product.battery || product.camera || product.processor || product.graphics) && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Technical Specifications</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {product.processor && (
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Processor</p>
                                                <p className="text-sm font-bold text-gray-900">{product.processor}</p>
                                            </div>
                                        )}
                                        {product.ram && (
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">RAM</p>
                                                <p className="text-sm font-bold text-gray-900">{product.ram}</p>
                                            </div>
                                        )}
                                        {product.storage && (
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Storage</p>
                                                <p className="text-sm font-bold text-gray-900">{product.storage}</p>
                                            </div>
                                        )}
                                        {product.battery && (
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Battery</p>
                                                <p className="text-sm font-bold text-gray-900">{product.battery}</p>
                                            </div>
                                        )}
                                        {product.camera && (
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Camera</p>
                                                <p className="text-sm font-bold text-gray-900">{product.camera}</p>
                                            </div>
                                        )}
                                        {product.graphics && (
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Graphics</p>
                                                <p className="text-sm font-bold text-gray-900">{product.graphics}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {product.warranty && (
                                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Protection Plan</p>
                                        <p className="text-sm font-bold text-gray-900">{product.warranty}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 mt-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => addToCart(product._id, 1)}
                                    className="flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Add to Cart
                                </button>

                                <button
                                    onClick={() => setShowShare(!showShare)}
                                    className="flex items-center justify-center bg-white border-2 border-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Share Email
                                </button>
                            </div>

                            {showShare && (
                                <div className="mt-4 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 animate-in slide-in-from-top duration-300">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Send directly to email</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            placeholder="Recipient email..."
                                            className="flex-1 bg-white border border-indigo-100 px-4 py-3 rounded-xl text-sm outline-none focus:border-indigo-600 transition-all"
                                            value={recipientEmail}
                                            onChange={(e) => setRecipientEmail(e.target.value)}
                                        />
                                        <button
                                            disabled={sharing}
                                            onClick={handleEmailShare}
                                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
                                        >
                                            {sharing ? "Sending..." : "Send"}
                                        </button>
                                    </div>
                                    {shareStatus && (
                                        <p className={`mt-2 text-[10px] font-black uppercase tracking-tight ${shareStatus.includes('failed') ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {shareStatus}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}