import React, { useState } from "react";
import { Link } from "react-router";
import api from "../api/axios";
import * as XLSX from "xlsx";
import {
    FileText,
    Download,
    ShoppingCart,
    Package,
    Users,
    Activity,
    Calendar,
    ChevronRight,
    Loader2
} from "lucide-react";

const reportTypes = [
    {
        id: "orders",
        name: "Order Report",
        description: "Transaction history, customer details, and revenue data.",
        icon: ShoppingCart,
        endpoint: "/orders/all-orders",
        color: "text-indigo-600",
        bg: "bg-indigo-50"
    },
    {
        id: "products",
        name: "Inventory Report",
        description: "Product catalog, stock levels, and category distribution.",
        icon: Package,
        endpoint: "/products/view",
        color: "text-emerald-600",
        bg: "bg-emerald-50"
    },
    {
        id: "users",
        name: "User Analytics",
        description: "Member registrations, roles, and account statuses.",
        icon: Users,
        endpoint: "/auth/users",
        color: "text-amber-600",
        bg: "bg-amber-50"
    },
    {
        id: "logs",
        name: "Security Logs",
        description: "Administrative actions, system updates, and audit trail.",
        icon: Activity,
        endpoint: "/logs",
        color: "text-rose-600",
        bg: "bg-rose-50"
    }
];

export default function AdminReports() {
    const [downloading, setDownloading] = useState(null);

    const exportToExcel = async (report) => {
        setDownloading(report.id);
        try {
            const response = await api.get(report.endpoint);
            const data = response.data;

            if (!data || data.length === 0) {
                alert("No data available for this report type.");
                return;
            }

            // Transform data for better Excel readability
            const processedData = data.map(item => {
                const flatItem = { ...item };

                // Handle nested objects for specific reports
                if (report.id === 'orders') {
                    flatItem.Customer = item.user?.name || 'N/A';
                    flatItem.Email = item.user?.email || 'N/A';
                    delete flatItem.user;
                }

                // General cleanup of MongoDB fields
                delete flatItem._id;
                delete flatItem.__v;
                delete flatItem.password;

                return flatItem;
            });

            const worksheet = XLSX.utils.json_to_sheet(processedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, report.name);

            // Generate filename with timestamp
            const date = new Date().toISOString().split('T')[0];
            const fileName = `${report.id}_report_${date}.xlsx`;

            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-gray-900 leading-tight">System <span className="text-indigo-600">Intelligence</span></h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                        <FileText size={14} className="text-indigo-600" />
                        Generate & Export Data Repositories to Excel
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-[10px] font-black uppercase text-gray-900 tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTypes.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-100 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-4 rounded-2xl ${report.bg} ${report.color} transition-transform group-hover:scale-110`}>
                                <report.icon size={24} />
                            </div>
                            <button
                                onClick={() => exportToExcel(report)}
                                disabled={downloading !== null}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${downloading === report.id
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200 active:scale-95"
                                    }`}
                            >
                                {downloading === report.id ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download size={14} />
                                        Download XLSX
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-gray-900 italic uppercase flex items-center gap-2">
                                {report.name}
                                <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                            </h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                {report.description}
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100"></div>
                                ))}
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[8px] font-black text-indigo-600">+</div>
                            </div>
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Encrypted Secure Link</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
