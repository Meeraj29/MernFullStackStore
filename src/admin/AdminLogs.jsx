import { useState, useEffect } from "react";
import api from "../api/axios";
import { History, User, Activity, Clock, Search, X, Package, Tag, Eye } from "lucide-react";

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get("/logs");
            setLogs(response.data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchProductDetails = async (log) => {
        // If we have a snapshot in the log, use it immediately
        if (log.productData) {
            setSelectedProduct({ ...log.productData, _action: log.action });
            return;
        }

        // Fallback to fetching if no snapshot (for older logs)
        if (!log.productId) {
            alert("This is an older log entry. Product details were not captured for this action.");
            return;
        }

        setModalLoading(true);
        try {
            const response = await api.get(`/products/${log.productId}`);
            setSelectedProduct({ ...response.data, _action: log.action });
        } catch (error) {
            console.error("Error fetching product details:", error);
            alert("This product has been deleted and no snapshot was available in the logs.");
        } finally {
            setModalLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const searchStr = search.toLowerCase();
        return (
            (log.adminName || "").toLowerCase().includes(searchStr) ||
            (log.action || "").toLowerCase().includes(searchStr) ||
            (log.details || "").toLowerCase().includes(searchStr)
        );
    });

    if (loading && logs.length === 0) return <div className="p-10 text-center uppercase font-black text-xs tracking-widest text-gray-400">Loading System Logs...</div>;

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-gray-900">System <span className="text-indigo-600">Logs</span></h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Audit trail of administrative actions</p>
                        <button
                            onClick={fetchLogs}
                            className="p-1.5 bg-gray-50 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Refresh Logs"
                        >
                            <Activity size={14} className={loading ? "animate-pulse" : ""} />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="p-8">Timestamp</th>
                                <th className="p-8">Administrator</th>
                                <th className="p-8">Protocol</th>
                                <th className="p-8">Details</th>
                                <th className="p-8">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLogs.map((log) => (
                                <tr
                                    key={log._id}
                                    onClick={() => (log.action.includes('Product') || log.productId || log.productData) && fetchProductDetails(log)}
                                    className={`hover:bg-gray-50/50 transition-colors group ${(log.action.includes('Product') || log.productId || log.productData) ? 'cursor-pointer' : ''}`}
                                >
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-indigo-600 transition-colors">
                                                <Clock size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900">{new Date(log.timestamp).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                {log.adminName?.charAt(0) || "A"}
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">{log.adminName || "System Admin"}</p>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.action.includes('Added') ? 'bg-emerald-50 text-emerald-600' :
                                            log.action.includes('Updated') ? 'bg-indigo-50 text-indigo-600' :
                                                'bg-rose-50 text-rose-600'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <p className="text-xs font-bold text-gray-500 max-w-sm leading-relaxed truncate">
                                            {log.details}
                                        </p>
                                    </td>
                                    <td className="p-8 text-right">
                                        {(log.action.includes('Product') || log.productId || log.productData) && (
                                            <button 
                                                className="text-indigo-600 font-bold text-[11px] uppercase tracking-widest hover:text-indigo-900 transition-colors flex items-center gap-1 justify-end w-full"
                                            >
                                                Details <Eye size={12} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simple Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        {modalLoading ? (
                            <div className="p-20 text-center font-bold text-xs text-gray-400 animate-pulse">
                                FETCHING DATA...
                            </div>
                        ) : (
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                                        {selectedProduct._action || "Product Details"}
                                    </h2>
                                    <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-900">
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 shrink-0 overflow-hidden">
                                        <img 
                                            src={Array.isArray(selectedProduct.image) ? selectedProduct.image[0] : selectedProduct.image} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = "https://via.placeholder.com/150?text=No+Img"}
                                        />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedProduct.category || "General"}</p>
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{selectedProduct.title || "Unknown Product"}</h3>
                                        <p className="text-xl font-black text-gray-900">₹{selectedProduct.price?.toLocaleString() || "0"}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Quantity</span>
                                        <span className="font-bold text-gray-900">{selectedProduct.stock ?? 0} Units</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Log Event</span>
                                        <span className={`font-bold uppercase text-[10px] ${
                                            selectedProduct._action?.includes('Deleted') ? 'text-rose-600' : 'text-emerald-600'
                                        }`}>
                                            {selectedProduct._action || "Product Action"}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all shadow-lg"
                                >
                                    Dismiss View
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
