import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, useParams } from "react-router";

export default function EditProduct() {
    const { id } = useParams();
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
        camera: ""
    });
    const [status, setStatus] = useState({ message: "", type: "" });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/view`);
                const product = response.data.find(p => p._id === id);
                if (product) {
                    setForm({
                        title: product.title,
                        description: product.description,
                        price: product.price,
                        stock: product.stock,
                        category: product.category,
                        image: product.image,
                        warranty: product.warranty || "",
                        ram: product.ram || "",
                        storage: product.storage || "",
                        battery: product.battery || "",
                        camera: product.camera || ""
                    });
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await api.put(`/products/update/${id}`, form);
            setStatus({ message: "Product updated successfully!", type: "success" });
            setTimeout(() => navigate("/admin/products"), 1000);
        } catch (error) {
            setStatus({ message: error.response?.data?.message || "Update failed", type: "error" });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-10 text-center uppercase font-black text-xs tracking-widest text-gray-400">Loading Product Node...</div>;

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 italic uppercase tracking-tight">Edit Product Entity</h2>

            {status.message && (
                <div className={`mb-6 p-4 rounded-xl text-xs font-bold border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-full space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Title</label>
                        <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-indigo-600 outline-none transition-all font-medium text-sm" placeholder="Title" required />
                    </div>

                    <div className="col-span-full space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows="4" className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-indigo-600 outline-none transition-all font-medium text-sm" placeholder="Description" required></textarea>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price (INR)</label>
                        <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-indigo-600 outline-none transition-all font-medium text-sm" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Inventory Stock</label>
                        <input type="number" name="stock" value={form.stock} onChange={handleChange} className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-indigo-600 outline-none transition-all font-medium text-sm" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                        <input type="text" name="category" value={form.category} onChange={handleChange} className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-indigo-600 outline-none transition-all font-medium text-sm" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Image URL</label>
                        <input type="text" name="image" value={form.image} onChange={handleChange} className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-indigo-600 outline-none transition-all font-medium text-sm" required />
                    </div>
                </div>

                <div className="pt-6">
                    <button type="submit" disabled={updating} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                        {updating ? "Updating Entity..." : "Save System Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
