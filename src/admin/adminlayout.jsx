import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, ShoppingBag, PlusCircle, ArrowLeft, LogOut, UserCircle, History, Users, Key, ShoppingCart, FileBarChart, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const sidebarItems = [
    { name: "Dashboard", path: "/admin/profile", icon: LayoutDashboard },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "All Products", path: "/admin/products", icon: ShoppingBag },
    { name: "Add Product", path: "/admin/add-product", icon: PlusCircle },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Bulk Upload", path: "/admin/bulk-upload", icon: PlusCircle },
    { name: "Logs", path: "/admin/logs", icon: History },
    { name: "Give Access", path: "/admin/give-access", icon: Key },
    { name: "Reports", path: "/admin/reports", icon: FileBarChart },
    { name: "Account", path: "/admin/account", icon: UserCircle },
];

export default function AdminLayout() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const filteredSidebarItems = sidebarItems.filter(item => {
        // Always show the Account tab for every admin/staff so they can manage their profile
        if (item.name === "Account") return true;

        // If user has no specific permissions set, show all (Super Admin)
        if (!user?.permissions || user.permissions.length === 0) return true;

        // Map sidebar names to permission IDs
        const permissionMap = {
            "Dashboard": "Dashboard",
            "Analytics": "Analytics",
            "Users": "Users",
            "All Products": "Products",
            "Add Product": "Add Product",
            "Orders": "Orders",
            "Bulk Upload": "Products",
            "Logs": "Logs",
            "Give Access": "Give Access",
            "Reports": "Reports",
            "Account": "Account"
        };

        return user.permissions.some(p => p.section === permissionMap[item.name]);
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex fixed h-full">
                <div className="p-8">
                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-indigo-600">Nexus <span className="text-gray-900">Admin</span></h2>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {filteredSidebarItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${location.pathname === item.path
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-50 space-y-4">
                    <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                                {user?.name?.charAt(0) || "A"}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 truncate">{user?.name || "Admin"}</p>
                                <p className="text-[9px] font-bold text-gray-400 truncate">{user?.email || "system@nexus.core"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Link to="/" className="flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-xs text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all">
                            <ArrowLeft size={16} />
                            Back to Store
                        </Link>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-xs text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}