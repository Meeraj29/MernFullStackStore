import { useState, useEffect } from "react";
import api from "../api/axios";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Package, Search, Filter, ChevronRight, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "../context/AuthContext";

export default function AdminOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Check if user has edit permissions for Orders
    const canEdit = user?.role === "superadmin" || 
                    user?.permissions?.find(p => p.section === "Orders")?.access === "edit";

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get("orders/all-orders");
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.put(`orders/update/${orderId}`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'Shipped': return <Truck className="w-3.5 h-3.5" />;
            case 'Cancelled': return <XCircle className="w-3.5 h-3.5" />;
            default: return <Clock className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase italic">Manage Orders</h1>
                <p className="text-muted-foreground text-sm font-medium">Monitor and update customer orders across the platform.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                        placeholder="Search by Order ID or Customer Name..." 
                        className="pl-11 h-12 rounded-2xl border-none shadow-xl shadow-gray-100"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px] h-12 rounded-2xl border-none shadow-xl shadow-gray-100">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-indigo-600" />
                            <SelectValue placeholder="Status Filter" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Paid">Paid / Pending</SelectItem>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Orders...</p>
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {filteredOrders.map((order) => (
                                <div key={order._id} className="p-8 hover:bg-gray-50/50 transition-all group">
                                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                                        <div className="flex items-start gap-5">
                                            <Avatar className="h-14 w-14 rounded-2xl border-2 border-gray-100">
                                                <AvatarFallback className="bg-indigo-50 text-indigo-700 font-black uppercase">
                                                    {order.userId?.name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                                                        {order.userId?.name || "Unknown Customer"}
                                                    </h3>
                                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 font-medium font-mono uppercase tracking-widest">
                                                    Order ID: #{order._id.slice(-8).toUpperCase()}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex -space-x-3">
                                                        {order.products.slice(0, 3).map((item, idx) => (
                                                            <Avatar key={idx} className="h-8 w-8 border-2 border-white ring-2 ring-gray-50">
                                                                <AvatarFallback className="text-[8px] bg-gray-100">{idx + 1}</AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                        {order.products.length > 3 && (
                                                            <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-[8px] font-bold border-2 border-white">
                                                                +{order.products.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {order.products.length} Items • ₹{order.totalAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-4 lg:self-center">
                                            <div className="w-full sm:w-[180px]">
                                                <Select 
                                                    value={order.status} 
                                                    onValueChange={(val) => handleStatusUpdate(order._id, val)}
                                                >
                                                    <SelectTrigger className="h-10 rounded-xl border-gray-100 text-[10px] font-black uppercase tracking-widest">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                                                        <SelectItem value="Paid">Paid</SelectItem>
                                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button variant="ghost" className="rounded-xl text-indigo-600 hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest">
                                                View Summary <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32">
                            <Package className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">No Orders Found</h3>
                            <p className="text-gray-400 font-medium text-sm">No orders match your current filters.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
