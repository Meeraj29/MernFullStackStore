import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import { motion } from "framer-motion";

export default function Payment() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { clearCart } = useCart();
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        if (!state || !state.totalAmount || !state.selectedAddr) {
            navigate("/cart");
        }
    }, [state, navigate]);

    if (!state) return null;

    const { totalAmount, selectedAddr, products } = state;

    const handlePayment = async () => {
        setIsPaying(true);
        try {
            const fullAddressString = `${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} ${selectedAddr.zipCode}`;

            if (state.paymentMethod === "COD") {
                console.log("Placing COD order...");
                // Direct Order Placement for COD
                const { data } = await api.post("orders/place", {
                    address: fullAddressString,
                    phone: selectedAddr.phone,
                    paymentMethod: "COD"
                });

                console.log("COD Order Response:", data);
                if (clearCart) await clearCart();
                navigate("/order-success", { state: { orderId: data.order._id } });
                return;
            }

            // Online Flow (Razorpay)
            const { data: order } = await api.post("payment/create-order", {
                amount: totalAmount,
                currency: "INR"
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                order_id: order.id,
                description: "Purchase Payment",

                handler: async (response) => {
                    try {
                        const { data: verifyData } = await api.post("payment/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            products: products,
                            totalAmount: totalAmount,
                            address: fullAddressString,
                            phone: selectedAddr.phone
                        });

                        if (clearCart) await clearCart();
                        navigate("/order-success", { state: { orderId: verifyData.orderId } });
                    } catch (err) {
                        console.error("Verification failed:", err);
                        const errMsg = err.response?.data?.message || err.message || "Unknown Error";
                        alert(`Payment verification failed: ${errMsg}`);
                    } finally {
                        setIsPaying(false);
                    }
                },

                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: selectedAddr.phone
                },
                theme: {
                    color: "#2563eb"
                },
                modal: {
                    ondismiss: () => setIsPaying(false)
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error("Payment error:", error);
            setIsPaying(false);
            alert(state.paymentMethod === "COD" ? "Order placement failed." : "Payment initiation failed.");
        }
    };

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
                {/* Left Side: Summary (Inspired by Image) */}
                <div className="bg-[#2563eb] md:w-[40%] p-10 text-white flex flex-col justify-between">
                    <div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                            <p className="text-white/60 text-sm font-medium mb-1">Price Summary</p>

                            <h3 className="text-4xl font-bold">₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>

                        </div>

                        <div className="mt-6 flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div className="text-sm">
                                <p className="text-white/60">Using as</p>
                                <p className="font-bold">+{selectedAddr.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center gap-2 text-white/40 text-xs">
                        <span>{state.paymentMethod === "COD" ? "Order Method" : "Secured by"}</span>
                        <span className="font-bold text-white/60 underline">{state.paymentMethod === "COD" ? "COD" : "Razorpay"}</span>
                    </div>
                </div>

                {/* Right Side: Actions */}
                <div className="md:w-[60%] p-10 bg-white flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Final Step</h3>
                        <p className="text-gray-500 mb-8">Confirm your order and proceed to the secure payment gateway.</p>

                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Shipping to</span>
                                <span className="font-bold text-gray-900">{selectedAddr.city}, {selectedAddr.state}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Total Items</span>
                                <span className="font-bold text-gray-900">{products.length} Items</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Method</span>
                                <span className="font-bold text-indigo-600 uppercase">{state.paymentMethod}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={isPaying}
                            className="w-full bg-[#2563eb] text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isPaying ? "Processing..." : (state.paymentMethod === "COD" ? "Confirm Order (COD)" : "Complete Payment")}
                        </button>

                        <button
                            onClick={() => navigate("/cart")}
                            className="w-full mt-6 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
                        >
                            Back to Checkout
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
