import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import {
    ShoppingBag,
    TrendingUp,
    Package,
    Activity,
    CheckCircle,
    Truck,
    Trash2,
    AlertTriangle,
    PieChart as PieIcon,
    BarChart3
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from "recharts";

export default function AdminProfile() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const prodRes = await api.get("/products/view");
                const orderRes = await api.get("/orders/all-orders");
                setStats({
                    products: prodRes.data.length,
                    orders: orderRes.data.length,
                    revenue: orderRes.data.reduce((acc, order) => acc + (order.totalAmount || 0), 0)
                });
                setOrders(orderRes.data);
                setProducts(prodRes.data);
                setLowStockProducts(prodRes.data.filter(p => p.stock < 10));
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Process data for charts
    const salesData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const dataMap = orders.reduce((acc, order) => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + (order.totalAmount || 0);
            return acc;
        }, {});

        return last7Days.map(date => ({
            name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: dataMap[date] || 0
        }));
    }, [orders]);

    const categoryData = useMemo(() => {
        const map = products.reduce((acc, prod) => {
            acc[prod.category] = (acc[prod.category] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [products]);

    const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

    const handleUpdateStatus = async (orderId, updateType) => {
        try {
            const payload = updateType === 'paid' ? { paymentStatus: 'paid' } : { status: updateType };
            await api.put(`/orders/update/${orderId}`, payload);
            const res = await api.get("/orders/all-orders");
            setOrders(res.data);
            alert(`Order updated: ${updateType}`);
        } catch (error) {
            alert("Error updating order status");
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Delete this order record permanently?")) {
            try {
                await api.delete(`/orders/delete/${orderId}`);
                setOrders(orders.filter(o => o._id !== orderId));
            } catch (error) {
                alert("Error deleting order");
            }
        }
    };

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Syncing Matrix Data...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Global Control</h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Neural link active • System diagnostics online
                    </p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Admin</p>
                        <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic">
                        {user?.name?.charAt(0)}
                    </div>
                </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-8 space-y-4">
                    <div className="flex items-center gap-3 text-rose-600">
                        <AlertTriangle size={24} />
                        <h2 className="text-lg font-black uppercase tracking-tighter italic">Critical Inventory Alerts</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lowStockProducts.map(product => (
                            <div key={product._id} className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
                                <img src={product.image} className="w-12 h-12 rounded-lg object-cover bg-gray-50" alt="" />
                                <div>
                                    <p className="text-xs font-black text-gray-900 truncate max-w-[150px]">{product.title}</p>
                                    <p className="text-[10px] font-bold text-rose-500 uppercase">Stock: {product.stock} Units Remaining</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Order Volume", value: stats.orders, icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Inventory Nodes", value: stats.products, icon: Package, color: "text-amber-500", bg: "bg-amber-50" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:border-indigo-100 transition-all hover:shadow-xl hover:shadow-indigo-50/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight italic">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black italic uppercase tracking-tight text-gray-900 flex items-center gap-2">
                            <TrendingUp className="text-indigo-600" size={20} />
                            Revenue Stream (7D)
                        </h3>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                            <span className="text-[10px] font-black uppercase text-gray-400">Earnings</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                    tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '20px',
                                        border: 'none',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category & Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="font-black italic uppercase tracking-tight text-gray-900 flex items-center gap-2 mb-8">
                        <PieIcon className="text-purple-600" size={20} />
                        Category Distribution
                    </h3>
                    <div className="flex-1 flex flex-col md:flex-row items-center justify-between">
                        <div className="h-[250px] w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-3">
                            {categoryData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-[10px] font-black uppercase text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-900">{item.value} Nodes</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Section */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h2 className="text-xl font-black italic tracking-tight uppercase flex items-center gap-2">
                        <ShoppingBag className="text-indigo-600" size={20} />
                        Logistics Feed
                    </h2>
                    <button className="bg-gray-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">
                        Export Logs
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="p-8">Order ID</th>
                                <th className="p-8">Node Identifier</th>
                                <th className="p-8">Valuation</th>
                                <th className="p-8">Auth Status</th>
                                <th className="p-8">Logistics Status</th>
                                <th className="p-8 text-right">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-8 font-mono text-[10px] text-gray-400">#{order._id.slice(-8).toUpperCase()}</td>
                                    <td className="p-8">
                                        <p className="font-black text-gray-900 text-sm uppercase italic">{order.user?.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{order.user?.email}</p>
                                    </td>
                                    <td className="p-8 font-black text-gray-900 text-sm italic">₹{order.totalAmount?.toLocaleString()}</td>
                                    <td className="p-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${order.paymentStatus === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                                            {order.paymentStatus === 'paid' ? 'Secured' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${order.status === 'Delivered' ? 'bg-indigo-600 text-white' : 'bg-rose-50 text-rose-600'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            {order.paymentStatus !== 'paid' && (
                                                <button onClick={() => handleUpdateStatus(order._id, 'paid')} className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all" title="Mark as Paid">
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            {order.status !== 'Delivered' && (
                                                <button onClick={() => handleUpdateStatus(order._id, 'Delivered')} className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all" title="Mark as Delivered">
                                                    <Truck size={18} />
                                                </button>
                                            )}
                                            <button onClick={() => handleDeleteOrder(order._id)} className="p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all" title="Purge Record">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

