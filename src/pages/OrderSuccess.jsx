import { Link, useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import api from "../api/axios";

export default function OrderSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const orderId = location.state?.orderId;

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await api.put(`orders/cancel/${orderId}`);
            alert("Order cancelled successfully");
            navigate("/profile");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to cancel order");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 100 }}
                className="relative mb-12"
            >
                {/* Decorative Rings */}
                <div className="absolute inset-0 scale-150 bg-green-50 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 scale-125 bg-green-100/50 rounded-full animate-ping"></div>

                {/* Success Icon */}
                <div className="relative h-48 w-48 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-200">
                    <motion.svg 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-28 w-28 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth={3}
                    >
                        <motion.path 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M5 13l4 4L19 7" 
                        />
                    </motion.svg>
                </div>
            </motion.div>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6 max-w-xl"
            >
                <div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase italic">
                        Success!
                    </h1>
                    <div className="h-2 w-24 bg-green-500 mx-auto mt-2 rounded-full"></div>
                </div>

                <div className="space-y-4">
                    <p className="text-2xl font-bold text-gray-800">
                        Order Placed Successfully
                    </p>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        Thank you for your purchase. We've received your order and are currently preparing it for shipment.
                    </p>
                </div>

                {orderId && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm inline-block"
                    >
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                        <p className="text-lg font-mono font-bold text-indigo-600">#{orderId.slice(-8).toUpperCase()}</p>
                    </motion.div>
                )}

                <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/profile" className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
                        View Order
                    </Link>
                    <Link to="/" className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200">
                        Continue Shopping
                    </Link>
                    {orderId && (
                        <button onClick={handleCancel} className="bg-red-50 text-red-600 border-2 border-red-100 px-10 py-4 rounded-2xl font-bold hover:bg-red-100 transition-all active:scale-95 shadow-sm">
                            Cancel Order
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
