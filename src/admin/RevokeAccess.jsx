import React, { useState, useEffect } from "react";
import { ShieldOff, Mail, Search, AlertCircle, CheckCircle2, User, Phone, Shield, XCircle, Trash2, ArrowRight } from "lucide-react";
import api from "../api/axios";
import { toast } from "sonner";

export default function RevokeAccess() {
    const [searchEmail, setSearchEmail] = useState("");
    const [targetUser, setTargetUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState({ id: null, loading: false });

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchEmail) return;

        setLoading(true);
        setTargetUser(null);

        try {
            const response = await api.get("/auth/users");
            const user = response.data.find(u => u.email.toLowerCase() === searchEmail.toLowerCase());
            
            if (!user) {
                toast.error("No user found with this email address.");
            } else if (user.role !== "admin") {
                toast.warning("This user does not have administrative access.");
                setTargetUser(user);
            } else {
                setTargetUser(user);
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("Failed to search for user.");
        } finally {
            setLoading(false);
        }
    };

    const stripSingleSection = async (sectionName) => {
        if (!targetUser) return;
        
        setProcessing({ id: sectionName, loading: true });

        try {
            const remainingPermissions = targetUser.permissions.filter(p => p.section !== sectionName);

            // If no permissions left, we should revoke role entirely or just leave as admin with empty permissions?
            // Usually, an admin with 0 permissions is still an admin but can't see anything.
            // But if the goal is to "strip access", if it's the last one, maybe they should be reverted to user?
            
            if (remainingPermissions.length === 0) {
                await api.post("/auth/users/revoke-access", {
                    email: targetUser.email
                });
                toast.success(`Last authority node stripped. ${targetUser.email} reverted to standard user.`);
                setTargetUser(prev => ({ ...prev, role: "user", permissions: [] }));
            } else {
                await api.post("/auth/register-admin", {
                    email: targetUser.email,
                    permissions: remainingPermissions,
                    role: "admin"
                });
                toast.success(`Stripped access to "${sectionName}" successfully.`);
                setTargetUser(prev => ({ ...prev, permissions: remainingPermissions }));
            }
        } catch (error) {
            console.error("Strip error:", error);
            toast.error("Failed to strip section authority.");
        } finally {
            setProcessing({ id: null, loading: false });
        }
    };

    const fullRevoke = async () => {
        if (!targetUser || !confirm("Are you sure you want to strip ALL administrative authority immediately?")) return;

        setProcessing({ id: 'full', loading: true });

        try {
            await api.post("/auth/users/revoke-access", {
                email: targetUser.email
            });
            toast.success(`Full protocol executed. ${targetUser.email} has no administrative rights.`);
            setTargetUser(prev => ({ ...prev, role: "user", permissions: [] }));
        } catch (error) {
            console.error("Revoke error:", error);
            toast.error("Full revocation failed.");
        } finally {
            setProcessing({ id: null, loading: false });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase italic">Authority <span className="text-rose-600">Revocation</span></h1>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest text-balance">Identify and strip specific administrative permissions from active nodes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Search Panel */}
                <div className="md:col-span-5">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="h-10 w-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                                <Search size={20} />
                            </div>
                            <h2 className="text-lg font-black italic uppercase text-gray-900">Locate Node</h2>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Target Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold text-sm placeholder:text-gray-300"
                                        placeholder="admin@nexus.core"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-lg disabled:opacity-50"
                            >
                                {loading ? "Scanning..." : "Initialize Scan"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Status Panel */}
                <div className="md:col-span-7">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-full flex flex-col">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50 mb-6">
                            <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                                <ShieldOff size={20} />
                            </div>
                            <h2 className="text-lg font-black italic uppercase text-gray-900">Node Status</h2>
                        </div>

                        {targetUser ? (
                            <div className="flex-1 flex flex-col space-y-6">
                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 font-black text-xl">
                                        {targetUser.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black italic uppercase text-gray-900 truncate">{targetUser.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{targetUser.email}</p>
                                    </div>
                                    <div className={`ml-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        targetUser.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {targetUser.role}
                                    </div>
                                </div>

                                {targetUser.role === 'admin' ? (
                                    <>
                                        <div className="space-y-4 flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Individual Section Control</p>

                                            <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                                {targetUser.permissions && targetUser.permissions.length > 0 ? (
                                                    targetUser.permissions.map((p, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white group hover:border-rose-100 transition-all"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                                                                    <Shield size={16} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black uppercase italic text-gray-900">{p.section}</p>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Level: {p.access}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <button
                                                                onClick={() => stripSingleSection(p.section)}
                                                                disabled={processing.loading}
                                                                className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                                                            >
                                                                {processing.loading && processing.id === p.section ? "Stripping..." : "Strip Access"}
                                                                <ArrowRight size={12} />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                                        <ShieldOff size={24} className="mx-auto text-gray-300 mb-2" />
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Super Admin Access</p>
                                                        <p className="text-[9px] text-gray-400 mt-1 italic">Full authority nodes must be revoked entirely below.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-rose-900 p-6 rounded-3xl mt-auto">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="p-2 bg-white/10 rounded-lg text-rose-200">
                                                    <AlertCircle size={16} />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-100 leading-relaxed">
                                                    Danger Zone: Execute full protocol to immediately strip ALL administrative authority from this node.
                                                </p>
                                            </div>
                                            <button
                                                onClick={fullRevoke}
                                                disabled={processing.loading}
                                                className="w-full py-4 bg-white text-rose-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-all shadow-xl disabled:opacity-50"
                                            >
                                                {processing.loading && processing.id === 'full' ? "Revoking Entire Access..." : "Execute Full Revocation"}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center text-center space-y-3 flex-1">
                                        <CheckCircle2 size={40} className="text-emerald-500" />
                                        <div>
                                            <h3 className="font-black italic uppercase text-sm text-emerald-900">Standard Node</h3>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mt-1">This user has no administrative authority to revoke.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-gray-100 rounded-3xl p-8">
                                <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h3 className="font-black italic uppercase text-sm text-gray-400">Waiting for Target</h3>
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter mt-1">Initialize scan to view node details</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
