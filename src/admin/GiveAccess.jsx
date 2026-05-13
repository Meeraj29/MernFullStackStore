import React, { useState } from "react";
import { Shield, User, Mail, Phone, CheckCircle2, AlertCircle, Eye, Edit3 } from "lucide-react";
import api from "../api/axios";

const TABS = [
    { id: "Dashboard", label: "Dashboard", path: "/admin/profile" },
    { id: "Users", label: "Users", path: "/admin/users" },
    { id: "Products", label: "All Products", path: "/admin/products" },
    { id: "Add Product", label: "Add Product", path: "/admin/add-product" },
    { id: "Logs", label: "Logs", path: "/admin/logs" },
    { id: "Give Access", label: "Give Access", path: "/admin/give-access" },
    { id: "Reports", label: "Reports", path: "/admin/reports" },
    { id: "Account", label: "Account", path: "/admin/account" },
    { id: "Orders", label: "Orders", path: "/admin/orders" },
];

export default function GiveAccess() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        permissions: [] // Array of { section: string, access: 'read' | 'edit' }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionToggle = (tabId) => {
        setFormData(prev => {
            const exists = prev.permissions.find(p => p.section === tabId);
            if (exists) {
                return {
                    ...prev,
                    permissions: prev.permissions.filter(p => p.section !== tabId)
                };
            } else {
                return {
                    ...prev,
                    permissions: [...prev.permissions, { section: tabId, access: "read" }]
                };
            }
        });
    };

    const handleAccessChange = (tabId, access) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.map(p => 
                p.section === tabId ? { ...p, access } : p
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await api.post("/auth/register-admin", {
                ...formData,
                role: "admin"
            });

            setMessage({ type: "success", text: "User created successfully with granular permissions!" });
            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                permissions: []
            });
        } catch (error) {
            console.error("Register error:", error);
            const errorMessage = error.response?.data?.message || "Failed to create user.";
            setMessage({ type: "error", text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase italic">Access <span className="text-indigo-600">Protocol</span></h1>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Deploy new administrative nodes with granular authority levels.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* User Details Section */}
                <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <User size={20} />
                        </div>
                        <h2 className="text-lg font-black italic uppercase text-gray-900">Identity</h2>
                    </div>

                    <div className="space-y-5">
                        {[
                            { label: "Full Name", name: "name", type: "text", icon: User, placeholder: "Commander Shepard" },
                            { label: "Email Address", name: "email", type: "email", icon: Mail, placeholder: "shepard@nexus.com" },
                            { label: "Phone Number", name: "phone", type: "tel", icon: Phone, placeholder: "+1 (555) N7-2183" },
                            { label: "Secret Key", name: "password", type: "password", icon: Shield, placeholder: "••••••••" },
                        ].map((field) => (
                            <div key={field.name}>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{field.label}</label>
                                <div className="relative group">
                                    <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        required
                                        value={formData[field.name]}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold text-sm placeholder:text-gray-300"
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Permissions Section */}
                <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-50 mb-6">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Shield size={20} />
                        </div>
                        <h2 className="text-lg font-black italic uppercase text-gray-900">Authority Matrix</h2>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Assign Section Access Levels</p>
                        
                        {TABS.map((tab) => {
                            const permission = formData.permissions.find(p => p.section === tab.id);
                            return (
                                <div 
                                    key={tab.id}
                                    className={`p-1 rounded-2xl border transition-all duration-300 ${
                                        permission ? "bg-indigo-50/50 border-indigo-100 shadow-sm" : "bg-gray-50/50 border-transparent"
                                    }`}
                                >
                                    <div className="flex items-center justify-between p-3">
                                        <button
                                            type="button"
                                            onClick={() => handlePermissionToggle(tab.id)}
                                            className={`flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                                permission ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
                                            }`}
                                        >
                                            {permission && <CheckCircle2 size={16} />}
                                            {tab.label}
                                        </button>

                                        {permission && (
                                            <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-inner border border-gray-100">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAccessChange(tab.id, "read")}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        permission.access === "read" 
                                                            ? "bg-indigo-100 text-indigo-600" 
                                                            : "text-gray-400 hover:text-gray-600"
                                                    }`}
                                                >
                                                    <Eye size={12} />
                                                    View
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAccessChange(tab.id, "edit")}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        permission.access === "edit" 
                                                            ? "bg-emerald-100 text-emerald-600" 
                                                            : "text-gray-400 hover:text-gray-600"
                                                    }`}
                                                >
                                                    <Edit3 size={12} />
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-8 mt-auto">
                        <button
                            type="submit"
                            disabled={loading || formData.permissions.length === 0}
                            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all ${
                                loading || formData.permissions.length === 0
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-900 text-white hover:bg-black shadow-2xl active:scale-[0.98]"
                            }`}
                        >
                            {loading ? "Initializing..." : "Authorize System Access"}
                        </button>
                        
                        {message.text && (
                            <div className={`mt-4 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
                                message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}>
                                {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <p className="text-xs font-black uppercase tracking-widest">{message.text}</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
