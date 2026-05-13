import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, Shield, LogOut, Camera, Save, X, Globe, Briefcase } from "lucide-react";
import api from "../api/axios";

export default function StaffProfile() {
    const { user, logout, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        password: ""
    });

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put("auth/update-profile", formData);
            updateUser(response.data.user);
            setIsEditing(false);
            setFormData(prev => ({ ...prev, password: "" }));
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Cover Section */}
            <div className="relative h-48 rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            </div>

            <div className="px-8 -mt-24 relative z-10">
                <div className="bg-white rounded-[3rem] shadow-xl shadow-indigo-100/50 border border-gray-100 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-gray-50">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group">
                                <div className="h-32 w-32 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                    {user?.image ? (
                                        <img src={user.image} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-indigo-600 italic uppercase">
                                            {user?.name?.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-gray-100 text-indigo-600 hover:text-indigo-700 transition-all hover:scale-110">
                                    <Camera size={18} />
                                </button>
                            </div>

                            <div className="text-center md:text-left space-y-2">
                                <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-tight">
                                    {user?.name}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className="px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-2">
                                        <Shield size={12} /> {user?.role} Account
                                    </span>
                                    <span className="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                        <Globe size={12} /> Active Node
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full md:w-auto">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 md:flex-none px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all hover:shadow-xl hover:shadow-gray-200 active:scale-95"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 md:flex-none px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={logout}
                                className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-100 transition-all active:scale-95"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-12">
                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600/20 font-bold text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600/20 font-bold text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600/20 font-bold text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Update Password</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600/20 font-bold text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <Save size={18} />
                                        {loading ? "Syncing Data..." : "Apply Security Updates"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { label: "Identity", value: user?.name, icon: User, color: "text-indigo-600", bg: "bg-indigo-50" },
                                    { label: "Communication", value: user?.email, icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
                                    { label: "Telemetry", value: user?.phone || "No phone linked", icon: Phone, color: "text-emerald-600", bg: "bg-emerald-50" }
                                ].map((item, i) => (
                                    <div key={i} className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-all group">
                                        <div className={`p-4 rounded-2xl ${item.bg} ${item.color} w-fit mb-6 transition-transform group-hover:scale-110`}>
                                            <item.icon size={22} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                                        <p className="text-lg font-bold text-gray-900 break-words">{item.value}</p>
                                    </div>
                                ))}

                                <div className="md:col-span-3 p-8 rounded-[2.5rem] bg-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2">Access Privileges</h3>
                                        <p className="text-indigo-100 font-bold text-sm max-w-md">Your account is configured with {user?.permissions?.length || "full"} authorized dashboard nodes.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 relative z-10 justify-center">
                                        {user?.permissions?.map((p, i) => (
                                            <span key={i} className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">
                                                {p}
                                            </span>
                                        )) || (
                                            <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">
                                                Full Root Access
                                            </span>
                                        )}
                                    </div>
                                    {/* Decorative circle */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
