import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { motion } from "framer-motion";

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, fetchCart, loading, clearCart } = useCart();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isPlacing, setIsPlacing] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("Online"); // "Online" or "COD"
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
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

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        if (user?.addresses?.length > 0) {
            const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
            setSelectedAddressId(defaultAddr._id);
        }
    }, [user]);

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editingAddressId) {
                response = await api.put(`auth/update-address/${editingAddressId}`, addressForm);
            } else {
                response = await api.post("auth/add-address", addressForm);
            }
            const updatedAddresses = response.data.addresses;
            updateUser({ ...user, addresses: updatedAddresses });
            if (editingAddressId) setSelectedAddressId(editingAddressId);
            else setSelectedAddressId(updatedAddresses[updatedAddresses.length - 1]._id);
            resetAddressForm();
        } catch (error) {
            console.error("Address error:", error);
            alert("Failed to save address");
        }
    };

    const resetAddressForm = () => {
        setShowAddressForm(false);
        setEditingAddressId(null);
        setAddressForm({ name: "", phone: "", street: "", city: "", state: "", zipCode: "", landmark: "", isDefault: false });
    };

    const handleEditAddress = (addr) => {
        setEditingAddressId(addr._id);
        setAddressForm({
            name: addr.name, phone: addr.phone, street: addr.street, city: addr.city,
            state: addr.state, zipCode: addr.zipCode, landmark: addr.landmark || "", isDefault: addr.isDefault
        });
        setShowAddressForm(true);
    };
    const handleCheckout = () => {
        try {
            const selectedAddr = user.addresses.find(a => a._id === selectedAddressId);
            if (!selectedAddr) {
                alert("Please select a shipping address.");
                return;
            }

            if (!cart?.products || cart.products.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            const subtotal = cart.products.reduce((acc, item) => {
                const price = item.productId?.price || 0;
                return acc + (price * item.quantity);
            }, 0);

            if (subtotal <= 0) {
                alert("Invalid cart total. Please check your items.");
                return;
            }

            const gstAmount = subtotal * 0.18;
            const grandTotal = Math.round((subtotal + gstAmount) * 100) / 100;

            console.log("Proceeding to payment:", { subtotal, grandTotal, paymentMethod });

            navigate("/payment", {
                state: {
                    selectedAddr,
                    products: cart.products.map(item => ({
                        productId: item.productId?._id || item.productId,
                        quantity: item.quantity,
                        price: item.productId?.price || 0
                    })),
                    totalAmount: grandTotal,
                    paymentMethod: paymentMethod
                }
            });
        } catch (error) {
            console.error("Checkout error:", error);
            alert("An error occurred during checkout. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!cart || cart.products.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50/50">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Cart is empty</h1>
                    <p className="text-gray-500 mb-8">Add something to your cart to get started.</p>
                    <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                        Go Shopping
                    </Link>
                </motion.div>
            </div>
        );
    }

    const subtotal = cart?.products?.reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0) || 0;
    const gstAmount = subtotal * 0.18;
    const grandTotal = subtotal + gstAmount;

    return (
        <div className="min-h-screen bg-gray-50/30 py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-gray-900 mb-10"
                >
                    Your Cart
                </motion.h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.products.map((item) => (
                            <motion.div
                                key={item.productId._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow"
                            >
                                <img src={item.productId.image} alt={item.productId.title} className="w-20 h-20 object-contain rounded-lg bg-gray-50 p-1" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 leading-tight">{item.productId.title}</h3>
                                    <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">{item.productId.category}</p>
                                    <div className="flex items-center gap-4 mt-4">
                                        <div className="flex items-center border rounded-lg bg-gray-50/50">
                                            <button onClick={() => updateQuantity(item.productId._id, item.quantity - 1)} className="px-3 py-1 hover:text-indigo-600">-</button>
                                            <span className="px-3 font-bold text-sm w-10 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId._id, item.quantity + 1)} className="px-3 py-1 hover:text-indigo-600">+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.productId._id)} className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 text-lg">₹{(item.productId.price * item.quantity).toLocaleString()}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Summary & Address */}
                    <div className="space-y-6">
                        {/* Address Selection */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">Shipping</h3>
                                <button onClick={() => setShowAddressForm(true)} className="text-xs font-bold text-indigo-600 hover:underline">+ New</button>
                            </div>

                            {showAddressForm ? (
                                <form onSubmit={handleAddressSubmit} className="space-y-3">
                                    <input type="text" placeholder="Name" required value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none transition-colors" />
                                    <input type="text" placeholder="Phone" required value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none transition-colors" />
                                    <input type="text" placeholder="Address" required value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} className="w-full border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none transition-colors" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="City" required value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none transition-colors" />
                                        <input type="text" placeholder="State" required value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none transition-colors" />
                                    </div>
                                    <input type="text" placeholder="Zip Code" required value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} className="w-full border p-3 rounded-xl text-sm focus:border-indigo-600 outline-none transition-colors" />
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100">Save</button>
                                        <button type="button" onClick={resetAddressForm} className="px-4 py-3 text-sm font-bold text-gray-400">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    {user?.addresses?.map(addr => (
                                        <div
                                            key={addr._id}
                                            onClick={() => setSelectedAddressId(addr._id)}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                                        >
                                            <p className="text-sm font-bold text-gray-900">{addr.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{addr.street}, {addr.city}</p>
                                        </div>
                                    ))}
                                    {(!user?.addresses || user.addresses.length === 0) && (
                                        <div className="text-center py-6 border-2 border-dashed rounded-xl border-gray-100">
                                            <p className="text-xs text-gray-400">No address saved</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* Payment Method Selection */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6">Payment Method</h3>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => setPaymentMethod("Online")}
                                    className={`w-full py-4 rounded-xl font-bold text-sm border flex items-center justify-between px-5 transition-all ${paymentMethod === 'Online' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                                >
                                    <span>Online (UPI / Card / NetBanking)</span>
                                    {paymentMethod === 'Online' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod("COD")}
                                    className={`w-full py-4 rounded-xl font-bold text-sm border flex items-center justify-between px-5 transition-all ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                                >
                                    <span>Cash on Delivery (COD)</span>
                                    {paymentMethod === 'COD' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                                </button>
                            </div>
                        </motion.div>

                        {/* Order Summary */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6">Summary</h3>
                            <div className="space-y-3 pb-6 border-b border-gray-50">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>GST (18%)</span>
                                    <span>₹{gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600 font-bold mt-2">
                                    <span>Delivery</span>
                                    <span>Free</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-6 mb-8">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-gray-900">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {!selectedAddressId && user?.addresses?.length > 0 && (
                                <p className="text-[10px] font-bold text-amber-600 mb-4 bg-amber-50 p-2 rounded-lg text-center uppercase tracking-wider">
                                     Please click an address above to select it
                                 </p>
                            )}
                            <button
                                onClick={handleCheckout}
                                disabled={isPlacing || !selectedAddressId}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
                            >
                                {isPlacing ? "Placing Order..." : (!selectedAddressId ? "Select Address to Continue" : "Place Order")}
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
