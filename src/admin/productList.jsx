import api from "../api/axios";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function ProductList() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const canEdit = user?.role === "superadmin" || 
                    user?.permissions?.find(p => p.section === "Products")?.access === "edit";

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("/products/view");
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.delete(`/products/delete/${id}`);
                setProducts(products.filter(product => product._id !== id));
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };

    if (loading) {
        return <div className="p-10 text-center">Loading products...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Inventory Matrix</h2>
                {canEdit && (
                    <Link to="/admin/add-product" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
                        Initialize New Node
                    </Link>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                            <th className="py-4 px-4">Image</th>
                            <th className="py-4 px-4">Title</th>
                            <th className="py-4 px-4">Category</th>
                            <th className="py-4 px-4">Price</th>
                            <th className="py-4 px-4">Stock</th>
                            <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-4">
                                    <img src={product.image} className="w-12 h-12 object-cover rounded-lg bg-gray-50" alt="" />
                                </td>
                                <td className="py-4 px-4">
                                    <p className="font-bold text-gray-900 text-sm">{product.title}</p>
                                </td>
                                <td className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {product.category}
                                </td>
                                <td className="py-4 px-4 font-bold text-gray-900 text-sm">
                                    ₹{product.price.toLocaleString()}
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {product.stock} Units
                                    </span>
                                </td>
                                {canEdit && (
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


