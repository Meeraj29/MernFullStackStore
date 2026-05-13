import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router";

export default function AddProduct() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        image: "",
        warranty: "",
        ram: "",
        storage: "",
        battery: "",
        camera: "",
        processor: "",
        graphics: ""
    });
    const [status, setStatus] = useState({ message: "", type: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ message: "", type: "" });

        try {
            await api.post("/products/add", form);
            setStatus({ message: "Product added successfully! Redirecting...", type: "success" });
            setTimeout(() => navigate("/admin/products"), 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            setStatus({ message: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-gray-500">Enter the details of the product to add it to your inventory.</p>
                </div>

                {status.message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Title</label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g. Wireless Noise Cancelling Headphones"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="Provide a detailed description of the product..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                required
                                step="0.01"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder=""
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g. Electronics"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                            <input
                                type="text"
                                name="image"
                                value={form.image}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Warranty Information</label>
                            <input
                                type="text"
                                name="warranty"
                                value={form.warranty}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g. 1 Year Limited Warranty"
                            />
                        </div>

                        {/* Mobile Specific Fields */}
                        {(form.category.toLowerCase().includes("mobile") || form.category.toLowerCase().includes("phone")) && (
                            <>
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">RAM</label>
                                    <input type="text" name="ram" value={form.ram} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 8GB" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Internal Storage</label>
                                    <input type="text" name="storage" value={form.storage} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 128GB" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Battery (mAh)</label>
                                    <input type="text" name="battery" value={form.battery} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 5000mAh" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Camera (MP)</label>
                                    <input type="text" name="camera" value={form.camera} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 108MP" />
                                </div>
                            </>
                        )}

                        {/* Laptop Specific Fields */}
                        {(form.category.toLowerCase().includes("laptop") || form.category.toLowerCase().includes("mac")) && (
                            <>
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Processor</label>
                                    <input type="text" name="processor" value={form.processor} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Intel i7 / Apple M2" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">RAM</label>
                                    <input type="text" name="ram" value={form.ram} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 16GB" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">SSD/HDD Storage</label>
                                    <input type="text" name="storage" value={form.storage} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 512GB SSD" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Graphics Card</label>
                                    <input type="text" name="graphics" value={form.graphics} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. RTX 3050 / Integrated" />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/products")}
                            className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2.5 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? "Adding Product..." : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
