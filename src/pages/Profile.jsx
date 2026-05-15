import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Profile() {
    const { user, logout, loading, updateUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [status, setStatus] = useState({ message: "", type: "" });

    // Order Detail Modal State
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Address Management State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetailAddress, setSelectedDetailAddress] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackOrderId, setFeedbackOrderId] = useState(null);
    const [rating, setRating] = useState(5);
    const [feedbackText, setFeedbackText] = useState("");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    // Reactivation state
    const [reactivating, setReactivating] = useState(false);
    const [reactivationMethod, setReactivationMethod] = useState("COD"); // "COD" | "Online"
    const [showReactivationModal, setShowReactivationModal] = useState(false);

    // Pay Now (unpaid orders)
    const [payingOrderId, setPayingOrderId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        landmark: "",
        isDefault: false
    });

    const fetchOrders = async () => {
        try {
            const response = await api.get("orders/my-orders");
            setOrders(response.data);
        } catch (error) {
            console.error("Fetch orders error:", error);
        } finally {
            setLoadingOrders(false);
        }
    };



    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setSubmittingFeedback(true);
        try {
            await api.put(`orders/feedback/${feedbackOrderId}`, { rating, feedback: feedbackText });
            alert("Thank you for your feedback!");
            setShowFeedbackModal(false);
            setFeedbackText("");
            setRating(5);
            fetchOrders();
        } catch (error) {
            alert("Failed to submit feedback");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await api.put(`orders/cancel/${orderId}`);
            alert("Order cancelled successfully");
            if (selectedOrder && selectedOrder._id === orderId) {
                setShowOrderModal(false);
            }
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to cancel order");
        }
    };

    const handleReactivateCOD = async () => {
        if (!window.confirm("Reactivate this order with Cash on Delivery?")) return;
        setReactivating(true);
        try {
            await api.put(`orders/reactivate/${selectedOrder._id}`);
            alert("Order reactivated with COD! Your order is now active.");
            setShowReactivationModal(false);
            setShowOrderModal(false);
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to reactivate order");
        } finally {
            setReactivating(false);
        }
    };

    const handleReactivateOnline = async () => {
        setReactivating(true);
        try {
            const { data: rzpOrder } = await api.post("payment/create-order", {
                amount: selectedOrder.totalAmount,
                currency: "INR"
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                order_id: rzpOrder.id,
                description: `Reactivate Order #${selectedOrder._id.slice(-8).toUpperCase()}`,
                handler: async (response) => {
                    try {
                        await api.post("payment/verify-reactivation", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: selectedOrder._id
                        });
                        setShowReactivationModal(false);
                        setShowOrderModal(false);
                        navigate("/order-success", { state: { orderId: selectedOrder._id } });
                    } catch (err) {
                        alert("Payment verification failed. Please contact support.");
                    } finally {
                        setReactivating(false);
                    }
                },
                prefill: { name: user.name, email: user.email },
                theme: { color: "#4f46e5" },
                modal: { ondismiss: () => setReactivating(false) }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            alert("Failed to initiate payment.");
            setReactivating(false);
        }
    };

    const handlePayUnpaidOrder = async (e, order) => {
        e.stopPropagation();
        setPayingOrderId(order._id);
        try {
            const { data: rzpOrder } = await api.post("payment/create-order", {
                amount: order.totalAmount,
                currency: "INR"
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                order_id: rzpOrder.id,
                description: `Payment for Order #${order._id.slice(-8).toUpperCase()}`,
                handler: async (response) => {
                    try {
                        await api.post("payment/verify-reactivation", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: order._id
                        });
                        navigate("/order-success", { state: { orderId: order._id } });
                    } catch (err) {
                        alert("Payment verification failed. Please contact support.");
                    } finally {
                        setPayingOrderId(null);
                    }
                },
                prefill: { name: user.name, email: user.email },
                theme: { color: "#4f46e5" },
                modal: { ondismiss: () => setPayingOrderId(null) }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            alert("Failed to initiate payment.");
            setPayingOrderId(null);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else if (!loading) {
            navigate("/login");
        }
    }, [user, loading]);

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setStatus({ message: "", type: "" });
        try {
            let response;
            if (editingAddressId) {
                response = await api.put(`auth/update-address/${editingAddressId}`, addressForm);
                setStatus({ message: "Address updated", type: "success" });
            } else {
                response = await api.post("auth/add-address", addressForm);
                setStatus({ message: "Address saved", type: "success" });
            }
            updateUser({ ...user, addresses: response.data.addresses });
            resetAddressForm();
        } catch (error) {
            setStatus({ message: error.response?.data?.message || "Error saving address", type: "error" });
        }
    };

    const resetAddressForm = () => {
        setShowAddressForm(false);
        setEditingAddressId(null);
        setAddressForm({
            name: "", phone: "", street: "", city: "", state: "", zipCode: "", landmark: "", isDefault: false
        });
    };

    const handleEditAddress = (addr) => {
        setEditingAddressId(addr._id);
        setAddressForm({
            name: addr.name, phone: addr.phone, street: addr.street, city: addr.city,
            state: addr.state, zipCode: addr.zipCode, landmark: addr.landmark || "", isDefault: addr.isDefault
        });
        setShowAddressForm(true);
        setShowDetailModal(false);
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Delete this address?")) return;
        try {
            const response = await api.delete(`auth/delete-address/${id}`);
            updateUser({ ...user, addresses: response.data.addresses });
            setStatus({ message: "Address removed", type: "success" });
            setShowDetailModal(false);
        } catch (error) {
            setStatus({ message: "Failed to remove address", type: "error" });
        }
    };

    const downloadInvoice = (order) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.text("INVOICE", 105, 25, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("STORE PURCHASE RECEIPT", 20, 40);
        doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 40);
        doc.text(`Order ID: #${order._id.slice(-8).toUpperCase()}`, 140, 45);

        // Horizontal Line
        doc.setDrawColor(226, 232, 240);
        doc.line(20, 50, 190, 50);

        // Customer Info
        doc.setFontSize(10);
        doc.setTextColor(79, 70, 229); // Indigo 600
        doc.text("BILL TO:", 20, 60);

        doc.setTextColor(30, 41, 59);
        doc.setFont(undefined, 'bold');
        doc.text(user.name, 20, 67);
        doc.setFont(undefined, 'normal');
        doc.text(user.email, 20, 72);

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(order.address, 20, 78, { maxWidth: 80 });
        doc.text(`Phone: ${order.phone}`, 20, 90);

        // Products Table
        const tableData = order.products.map((item, index) => [
            index + 1,
            item.productId?.title || "Unknown Product",
            `INR ${item.price.toLocaleString()}`,
            item.quantity,
            `INR ${(item.price * item.quantity).toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: 100,
            head: [['#', 'Description', 'Unit Price', 'Qty', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 5 },
            columnStyles: {
                0: { cellWidth: 10 },
                2: { halign: 'right' },
                3: { halign: 'center' },
                4: { halign: 'right' }
            }
        });

        // Summary
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`Grand Total: INR ${order.totalAmount.toLocaleString()}`, 140, finalY);

        // Footer
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(150);
        doc.text("Thank you for your purchase!", 105, 270, { align: "center" });
        doc.text("This is a computer generated invoice and does not require a signature.", 105, 280, { align: "center" });

        doc.save(`Invoice_${order._id.slice(-8).toUpperCase()}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Order Details Popup Modal */}
                <AnimatePresence>
                    {showOrderModal && selectedOrder && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] text-gray-400 mb-1">Order Summary</h3>
                                        <p className="text-xl font-black">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <button onClick={() => setShowOrderModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto max-h-[70vh]">
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Shipping Information</h4>
                                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                                <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                                                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{selectedOrder.address}</p>
                                                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                    {selectedOrder.phone}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Order Status</h4>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                        (selectedOrder.paymentStatus === 'paid' || selectedOrder.status === 'Paid' || selectedOrder.status === 'Delivered' || selectedOrder.paymentId) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {selectedOrder.status === 'Cancelled' ? 'Cancelled' :
                                                        (selectedOrder.paymentStatus === 'paid' || selectedOrder.status === 'Paid' || selectedOrder.status === 'Delivered' || selectedOrder.paymentId)
                                                            ? (selectedOrder.status === 'Delivered' ? 'Delivered' : 'Paid')
                                                            : 'Unpaid'}
                                                </span>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                            </div>

                                            {selectedOrder.feedback && (
                                                <div className="mt-8">
                                                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">Your Review</h4>
                                                    <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100 flex flex-col gap-3">
                                                        <div className="flex items-center gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <svg key={star} className={`w-3.5 h-3.5 ${selectedOrder.rating >= star ? 'text-amber-400 fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            ))}
                                                            <span className="text-[10px] font-black text-amber-600 ml-1">({selectedOrder.rating.toFixed(1)})</span>
                                                        </div>
                                                        <p className="text-xs text-amber-900 font-medium leading-relaxed italic">"{selectedOrder.feedback}"</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Items Ordered</h4>
                                        <div className="space-y-3">
                                            {selectedOrder.products.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                                    <img src={item.productId?.image} className="w-14 h-14 object-cover rounded-xl bg-gray-50" alt="" />
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.productId?.title}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold mt-1">₹{item.price.toLocaleString()} × {item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total</p>
                                            <p className="text-2xl font-black text-gray-900">₹{selectedOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </div>


                                <div className="p-8 bg-gray-50 flex justify-between items-center">
                                    {(selectedOrder.paymentStatus === 'paid' || selectedOrder.status === 'Paid' || selectedOrder.paymentId) && (
                                        <button
                                            onClick={() => downloadInvoice(selectedOrder)}
                                            className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:underline"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            Download Invoice
                                        </button>
                                    )}
                                    <div className="flex gap-4">
                                        {selectedOrder.status === "Cancelled" && (
                                            <button
                                                onClick={() => {
                                                    setReactivationMethod("COD");
                                                    setShowReactivationModal(true);
                                                }}
                                                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                Reactivate Order
                                            </button>
                                        )}
                                        {/* Pay Now — visible for unpaid active orders */}
                                        {selectedOrder.status !== "Cancelled" && selectedOrder.status !== "Delivered" && !(selectedOrder.paymentStatus === 'paid' || selectedOrder.status === 'Paid' || selectedOrder.paymentId) && (
                                            <button
                                                onClick={(e) => handlePayUnpaidOrder(e, selectedOrder)}
                                                disabled={payingOrderId === selectedOrder._id}
                                                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-60"
                                            >
                                                {payingOrderId === selectedOrder._id ? (
                                                    <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span> Processing…</>
                                                ) : (
                                                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> Pay Now</>
                                                )}
                                            </button>
                                        )}
                                        {selectedOrder.status !== "Delivered" && selectedOrder.status !== "Shipped" && selectedOrder.status !== "Cancelled" && (
                                            <button
                                                onClick={() => handleCancelOrder(selectedOrder._id)}
                                                className="bg-red-50 text-red-600 border border-red-100 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                        <button onClick={() => setShowOrderModal(false)} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-colors">
                                            Dismiss Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Reactivation Payment Modal ── */}
                <AnimatePresence>
                    {showReactivationModal && selectedOrder && (
                        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                {/* Header */}
                                <div className="relative bg-linear-to-br from-indigo-600 to-purple-600 p-8 text-white">
                                    <button
                                        onClick={() => setShowReactivationModal(false)}
                                        className="absolute top-5 right-5 bg-white/15 hover:bg-white/25 p-2 rounded-full transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">Reactivate Order</h3>
                                    <p className="text-indigo-200 text-xs mt-1">Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                                    <div className="mt-4 bg-white/15 rounded-2xl px-4 py-3 flex justify-between items-center">
                                        <span className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Order Total</span>
                                        <span className="text-white text-lg font-black">₹{selectedOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                {/* Payment Method Selection */}
                                <div className="p-8 space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Choose Payment Method</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* COD Option */}
                                            <button
                                                onClick={() => setReactivationMethod("COD")}
                                                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${reactivationMethod === "COD"
                                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100"
                                                        : "bg-gray-50 text-gray-500 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50"
                                                    }`}
                                            >
                                                {reactivationMethod === "COD" && (
                                                    <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                    </div>
                                                )}
                                                <span className="text-3xl">💵</span>
                                                <div className="text-center">
                                                    <p className="font-black text-[10px] uppercase tracking-widest">Cash on</p>
                                                    <p className="font-black text-[10px] uppercase tracking-widest">Delivery</p>
                                                </div>
                                            </button>

                                            {/* UPI / Online Option */}
                                            <button
                                                onClick={() => setReactivationMethod("Online")}
                                                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${reactivationMethod === "Online"
                                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100"
                                                        : "bg-gray-50 text-gray-500 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50"
                                                    }`}
                                            >
                                                {reactivationMethod === "Online" && (
                                                    <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                    </div>
                                                )}
                                                <span className="text-3xl">📱</span>
                                                <div className="text-center">
                                                    <p className="font-black text-[10px] uppercase tracking-widest">UPI /</p>
                                                    <p className="font-black text-[10px] uppercase tracking-widest">Online</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description of selected method */}
                                    <div className={`rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed transition-all ${reactivationMethod === "COD"
                                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                                            : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                        }`}>
                                        {reactivationMethod === "COD"
                                            ? "💵 Pay in cash when your order is delivered. No advance payment needed."
                                            : "📱 Pay securely via UPI, Net Banking, or Debit/Credit card through Razorpay."}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowReactivationModal(false)}
                                            className="flex-1 px-6 py-4 rounded-2xl font-bold text-xs text-gray-400 uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={reactivating}
                                            onClick={reactivationMethod === "COD" ? handleReactivateCOD : handleReactivateOnline}
                                            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {reactivating ? (
                                                <><span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full inline-block"></span> Processing…</>
                                            ) : (
                                                `Confirm ${reactivationMethod === "COD" ? "COD" : "& Pay"}`
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Feedback Modal */}
                <AnimatePresence>
                    {showFeedbackModal && (
                        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <div className="bg-indigo-600 p-8 text-white text-center">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">How was your order?</h3>
                                    <p className="text-indigo-100 text-sm mt-1">We value your feedback!</p>
                                </div>

                                <form onSubmit={handleFeedbackSubmit} className="p-8 space-y-6">
                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate your experience</p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className={`p-1 transition-all hover:scale-110 ${rating >= star ? 'text-amber-400' : 'text-gray-200'}`}
                                                >
                                                    <svg className="w-10 h-10 fill-current" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Share your thoughts</label>
                                        <textarea
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            placeholder="Tell us what you liked or how we can improve..."
                                            className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-medium focus:border-indigo-600 outline-none min-h-[120px] transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowFeedbackModal(false)}
                                            className="flex-1 px-6 py-4 rounded-2xl font-bold text-xs text-gray-400 uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all"
                                        >
                                            Skip
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submittingFeedback}
                                            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                        >
                                            {submittingFeedback ? "Sending..." : "Submit Review"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Details Popup Modal */}
                <AnimatePresence>
                    {showDetailModal && selectedDetailAddress && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                            >
                                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                                    <h3 className="font-bold uppercase tracking-widest text-xs">Address Information</h3>
                                    <button onClick={() => setShowDetailModal(false)} className="hover:rotate-90 transition-transform">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Receiver Name</p>
                                            <p className="font-bold text-gray-900">{selectedDetailAddress.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Phone</p>
                                            <p className="font-bold text-gray-900">{selectedDetailAddress.phone}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Location</p>
                                        <p className="font-bold text-gray-900 leading-relaxed">{selectedDetailAddress.street}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">City, State</p>
                                            <p className="font-bold text-gray-900">{selectedDetailAddress.city}, {selectedDetailAddress.state}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Zip Code</p>
                                            <p className="font-bold text-gray-900">{selectedDetailAddress.zipCode}</p>
                                        </div>
                                    </div>
                                    {selectedDetailAddress.landmark && (
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Landmark</p>
                                            <p className="font-bold text-gray-900">{selectedDetailAddress.landmark}</p>
                                        </div>
                                    )}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => handleEditAddress(selectedDetailAddress)}
                                            className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
                                        >
                                            Update Address
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(selectedDetailAddress._id)}
                                            className="px-6 py-4 rounded-2xl font-bold text-xs text-red-500 uppercase tracking-widest border border-red-50 hover:bg-red-50 transition-all"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Account</h1>
                        <p className="text-gray-500 text-sm">Manage your profile, addresses and orders.</p>
                    </div>
                    <button onClick={logout} className="bg-white text-red-600 px-6 py-2.5 rounded-xl font-bold text-sm border border-gray-200 hover:bg-red-50 transition-colors shadow-sm">
                        Sign Out
                    </button>
                </motion.header>

                {status.message && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`mb-8 p-4 rounded-xl text-sm font-bold border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}
                    >
                        {status.message}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: User Info & Addresses */}
                    <div className="space-y-6">
                        {/* Identity Box */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-14 w-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">{user.name}</h2>
                                    <p className="text-xs text-gray-400">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                    {user.role} Account
                                </div>
                            </div>
                        </div>

                        {/* Address Box */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900">Addresses</h3>
                                <button
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="text-xs font-bold text-indigo-600 hover:underline"
                                >
                                    {showAddressForm ? "Cancel" : "+ Add New"}
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {showAddressForm ? (
                                    <motion.form
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        onSubmit={handleAddressSubmit} className="space-y-3"
                                    >
                                        <input type="text" placeholder="Name" required value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none" />
                                        <input type="text" placeholder="Phone" required value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none" />
                                        <input type="text" placeholder="Street Address" required value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} className="w-full border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" placeholder="City" required value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none" />
                                            <input type="text" placeholder="State" required value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none" />
                                        </div>
                                        <input type="text" placeholder="Zip Code" required value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} className="w-full border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none" />
                                        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
                                            {editingAddressId ? "Update" : "Save Address"}
                                        </button>
                                    </motion.form>
                                ) : (
                                    <div className="space-y-3">
                                        {user.addresses?.map((addr) => (
                                            <div key={addr._id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 group relative">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-sm font-bold text-gray-900">{addr.name}</span>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDetailAddress(addr);
                                                            setShowDetailModal(true);
                                                        }}
                                                        className="text-[10px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest hover:underline"
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                                                    {addr.street}, {addr.city}<br />{addr.zipCode}
                                                </p>
                                                <div className="flex gap-4">
                                                    <button onClick={() => handleEditAddress(addr)} className="text-[10px] font-bold text-indigo-600 hover:underline">Edit</button>
                                                    <button onClick={() => handleDeleteAddress(addr._id)} className="text-[10px] font-bold text-red-500 hover:underline">Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!user.addresses || user.addresses.length === 0) && (
                                            <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                                                <p className="text-xs text-gray-400">No addresses yet</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: Orders History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[500px]">
                            <h3 className="text-lg font-bold text-gray-900 mb-8">Order History</h3>

                            {loadingOrders ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-4"></div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading...</p>
                                </div>
                            ) : orders.length > 0 ? (
                                <div className="space-y-6">
                                    {orders.map((order) => (
                                        <motion.div
                                            key={order._id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowOrderModal(true);
                                            }}
                                            className="border border-gray-100 rounded-2xl p-6 bg-gray-50/30 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID: {order._id.slice(-8)}</p>
                                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                            (order.paymentStatus === 'paid' || order.status === 'Paid' || order.status === 'Delivered' || order.paymentId) ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' : 'bg-amber-100 text-amber-700'}`}>
                                                        {order.status === 'Cancelled' ? 'Cancelled' :
                                                            (order.paymentStatus === 'paid' || order.status === 'Paid' || order.status === 'Delivered' || order.paymentId) ? (order.status === 'Delivered' ? 'Delivered' : 'Paid') : 'Unpaid'}
                                                    </span>
                                                    {/* Pay Now button for Unpaid orders */}
                                                    {order.status !== 'Cancelled' && order.status !== 'Delivered' && !(order.paymentStatus === 'paid' || order.status === 'Paid' || order.paymentId) && (
                                                        <button
                                                            onClick={(e) => handlePayUnpaidOrder(e, order)}
                                                            disabled={payingOrderId === order._id}
                                                            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 disabled:opacity-60"
                                                        >
                                                            {payingOrderId === order._id ? (
                                                                <><span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin inline-block"></span> Processing</>
                                                            ) : (
                                                                <><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> Pay Now</>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="md:text-right">
                                                    <p className="text-xs text-gray-400 mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-xl font-bold text-gray-900">₹{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                {order.products.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-gray-50 shadow-sm">
                                                        <img src={item.productId?.image} className="w-10 h-10 object-cover rounded-lg" alt="" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-900 line-clamp-1 max-w-[120px]">{item.productId?.title}</p>
                                                            <p className="text-[9px] text-gray-400 font-bold">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    {order.status === "Delivered" && !order.rating && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFeedbackOrderId(order._id);
                                                                setShowFeedbackModal(true);
                                                            }}
                                                            className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-lg shadow-amber-100"
                                                        >
                                                            Rate Order
                                                        </button>
                                                    )}
                                                    {order.rating && (
                                                        <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                                                            <svg className="w-3 h-3 text-amber-500 fill-current" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            <span className="text-[10px] font-black text-amber-600">{order.rating.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                    {order.status !== "Delivered" && order.status !== "Shipped" && order.status !== "Cancelled" && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancelOrder(order._id);
                                                            }}
                                                            className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors shadow-sm border border-red-100"
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">View Summary →</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-32">
                                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-400 font-bold text-sm">No orders found yet.</p>
                                    <Link to="/" className="text-indigo-600 text-sm font-bold mt-4 inline-block hover:underline">Start Shopping</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
