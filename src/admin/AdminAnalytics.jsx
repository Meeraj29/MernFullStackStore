import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Award,
    Calendar,
    CreditCard,
    DollarSign,
    Loader2,
    MousePointer2,
    RefreshCw,
    ShoppingBag,
    Target,
    TrendingUp,
    Users
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const COLORS = ["#4f46e5", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

const statStyles = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    cyan: "bg-cyan-50 text-cyan-600",
    violet: "bg-violet-50 text-violet-600"
};

const formatCurrency = (value = 0) =>
    `INR ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatNumber = (value = 0) => Number(value || 0).toLocaleString("en-IN");

function EmptyState({ title }) {
    return (
        <div className="flex h-full min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</p>
        </div>
    );
}

export default function AdminAnalytics() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/analytics/summary");
            setData(response.data);
        } catch (err) {
            console.error("Error fetching analytics:", err);
            setError(err.response?.data?.message || err.message || "Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        api.get("/analytics/summary")
            .then((response) => {
                if (mounted) setData(response.data);
            })
            .catch((err) => {
                console.error("Error fetching analytics:", err);
                if (mounted) setError(err.response?.data?.message || err.message || "Failed to connect to server");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const analytics = useMemo(() => ({
        summary: data?.summary || {},
        dailySales: data?.dailySales || [],
        trafficData: data?.trafficData || [],
        growthChart: data?.growthChart || [],
        topProducts: data?.topProducts || [],
        paymentStats: data?.paymentStats || [],
        weeklyReports: data?.weeklyReports || [],
        monthlyReports: data?.monthlyReports || [],
        eventStats: data?.eventStats || [],
        categoryRevenue: data?.categoryRevenue || [],
        growth: data?.growth || { weekly: 0 }
    }), [data]);

    if (loading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={42} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading analytics</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex min-h-[420px] flex-col items-center justify-center space-y-4 text-gray-500">
                <div className="rounded-2xl bg-rose-50 p-4 text-rose-600">
                    <TrendingUp size={44} className="opacity-60" />
                </div>
                <div className="text-center">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Analytics Error</p>
                    <p className="font-bold text-gray-900">{error || "Data stream interrupted"}</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95"
                >
                    <RefreshCw size={14} />
                    Retry
                </button>
            </div>
        );
    }

    const { summary, dailySales, trafficData, growthChart, topProducts, paymentStats, weeklyReports, monthlyReports, eventStats, categoryRevenue, growth } = analytics;
    const weeklyGrowth = parseFloat(growth?.weekly || 0);

    const stats = [
        { name: "Total Users", value: formatNumber(summary.totalUsers), icon: Users, detail: "Registered accounts", color: "indigo" },
        { name: "Active Users", value: formatNumber(summary.activeUsers), icon: Activity, detail: "Seen in last 24h", color: "emerald" },
        { name: "Orders", value: formatNumber(summary.totalOrders), icon: ShoppingBag, detail: `${formatCurrency(summary.totalRevenue)} sales`, color: "amber" },
        { name: "Traffic", value: formatNumber(summary.totalVisits), icon: MousePointer2, detail: "Tracked visits", color: "cyan" },
        { name: "Conversion", value: `${summary.conversionRate || 0}%`, icon: Target, detail: "Orders per visit", color: "rose" },
        { name: "Avg Order", value: formatCurrency(summary.averageOrderValue), icon: DollarSign, detail: "Paid order value", color: "violet" }
    ];

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 md:text-5xl">Analytics Dashboard</h1>
                    <p className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                        <TrendingUp size={14} className="text-indigo-600" />
                        Users, sales, traffic, payments, products, and growth reports
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest ${weeklyGrowth >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        {weeklyGrowth >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                        Weekly Growth {weeklyGrowth}%
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm">
                        <Calendar size={15} className="text-gray-400" />
                        Last 7 Days
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/60">
                        <div className="mb-4 flex items-center justify-between">
                            <div className={`rounded-2xl p-3 ${statStyles[stat.color]}`}>
                                <stat.icon size={19} />
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.name}</p>
                        <h3 className="mt-1 text-2xl font-black italic tracking-tight text-gray-900">{stat.value}</h3>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">{stat.detail}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black italic uppercase text-gray-900">Sales Growth</h2>
                            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">Revenue and order movement</p>
                        </div>
                    </div>
                    <div className="h-[330px]">
                        {dailySales.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailySales}>
                                    <defs>
                                        <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.22} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                                    <Tooltip formatter={(value, name) => name === "sales" ? formatCurrency(value) : formatNumber(value)} />
                                    <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fill="url(#salesFill)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <EmptyState title="No sales data yet" />}
                    </div>
                </section>

                <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black italic uppercase text-gray-900">Traffic Data</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">Daily visits</p>
                    <div className="mt-6 h-[330px]">
                        {trafficData.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trafficData}>
                                    <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} />
                                    <YAxis hide />
                                    <Tooltip formatter={(value) => formatNumber(value)} cursor={{ fill: "#f8fafc" }} />
                                    <Bar dataKey="visits" fill="#0891b2" radius={[7, 7, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState title="No traffic data yet" />}
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black italic uppercase text-gray-900">Top Products</h2>
                            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">Best-selling items</p>
                        </div>
                        <Award className="text-amber-500" size={24} />
                    </div>
                    <div className="space-y-4">
                        {topProducts.length ? topProducts.map((product, index) => (
                            <div key={product._id || product.name} className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-indigo-600 shadow-sm">{index + 1}</div>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-black uppercase text-gray-900">{product.name || "Untitled product"}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{formatNumber(product.salesCount)} sold</p>
                                    </div>
                                </div>
                                <p className="shrink-0 text-xs font-black italic text-indigo-600">{formatCurrency(product.revenue)}</p>
                            </div>
                        )) : <EmptyState title="No product sales yet" />}
                    </div>
                </section>

                <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
                    <h2 className="text-xl font-black italic uppercase text-gray-900">Growth Chart</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">Sales, orders, and visits together</p>
                    <div className="mt-6 h-[300px]">
                        {growthChart.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={growthChart}>
                                    <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="orders" stroke="#d97706" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="visits" stroke="#0891b2" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <EmptyState title="No growth data yet" />}
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase text-gray-900">Payment Statistics</h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Method split</p>
                        </div>
                    </div>
                    <div className="h-[220px]">
                        {paymentStats.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={paymentStats} dataKey="count" nameKey="_id" innerRadius={54} outerRadius={78} paddingAngle={4}>
                                        {paymentStats.map((entry, index) => (
                                            <Cell key={entry._id || index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatNumber(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <EmptyState title="No payment data yet" />}
                    </div>
                    <div className="mt-4 space-y-3">
                        {paymentStats.map((stat, index) => (
                            <div key={stat._id || index} className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-2 font-black uppercase text-gray-500">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {stat._id || "Unknown"}
                                </span>
                                <span className="font-black text-gray-900">{formatNumber(stat.count)}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black italic uppercase text-gray-900">Weekly Reports</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">Last 30 days by week</p>
                    <div className="mt-6 space-y-4">
                        {weeklyReports.length ? weeklyReports.map((report) => (
                            <div key={report._id} className="rounded-2xl bg-gray-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-xs font-black uppercase text-gray-900">{report.label}</p>
                                    <p className="text-xs font-black text-indigo-600">{formatCurrency(report.revenue)}</p>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{formatNumber(report.orders)} orders</p>
                            </div>
                        )) : <EmptyState title="No weekly report data yet" />}
                    </div>
                </section>

                <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black italic uppercase text-gray-900">Monthly Reports</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">Revenue by month</p>
                    <div className="mt-6 h-[260px]">
                        {monthlyReports.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyReports}>
                                    <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} />
                                    <YAxis hide />
                                    <Tooltip formatter={(value, name) => name === "revenue" ? formatCurrency(value) : formatNumber(value)} />
                                    <Bar dataKey="revenue" fill="#059669" radius={[7, 7, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState title="No monthly report data yet" />}
                    </div>
                </section>
            </div>
        </div>
    );
}
