import React, { useState } from "react";
import { Shield, User, Mail, Phone, CheckCircle2, AlertCircle, Eye, Edit3, Upload, FileSpreadsheet, Trash2, ShieldOff } from "lucide-react";
import * as XLSX from "xlsx";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const TABS = [
    { id: "Dashboard", label: "Dashboard", path: "/admin/profile" },
    { id: "Users", label: "Users", path: "/admin/users" },
    { id: "Products", label: "All Products", path: "/admin/products" },
    { id: "Add Product", label: "Add Product", path: "/admin/add-product" },
    { id: "Logs", label: "Logs", path: "/admin/logs" },
    { id: "Give Access", label: "Give Access", path: "/admin/give-access" },
    { id: "Revoke Access", label: "Revoke Access", path: "/admin/revoke-access" },
    { id: "Bulk Upload", label: "Bulk Upload", path: "/admin/bulk-upload" },
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
    const { user } = useAuth();

    // Check if current user has permission to use bulk upload
    const canBulkUpload = !user?.permissions || user.permissions.length === 0 ||
        user.permissions.some(p => p.section === "Bulk Upload" && p.access === "edit");

    const [uploadMode, setUploadMode] = useState("single"); // 'single' or 'bulk'
    const [bulkUsers, setBulkUsers] = useState([]);
    const [bulkFile, setBulkFile] = useState(null);

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

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setBulkFile(file);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            setBulkUsers(data);
            toast.success(`Loaded ${data.length} users from file.`);
        };
        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        const template = [
            { name: "John Doe", email: "john@example.com", phone: "1234567890", password: "OptionalPassword123" },
            { name: "Jane Smith", email: "jane@example.com", phone: "0987654321", password: "" }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Admins");
        XLSX.writeFile(wb, "admin_bulk_template.xlsx");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (uploadMode === "single") {
                await api.post("/auth/register-admin", {
                    ...formData,
                    role: "admin"
                });
                toast.success("User created successfully with granular permissions!");
            } else if (uploadMode === "bulk") {
                if (bulkUsers.length === 0) {
                    throw new Error("No users loaded from file.");
                }
                await api.post("/auth/users/bulk-register-admin", {
                    users: bulkUsers,
                    permissions: formData.permissions
                });
                toast.success(`Bulk access granted to ${bulkUsers.length} users!`);
            } else if (uploadMode === "revoke") {
                if (!formData.email) {
                    throw new Error("Target email is required to revoke access.");
                }
                await api.post("/auth/users/revoke-access", {
                    email: formData.email
                });
                toast.success(`All administrative permissions revoked for ${formData.email}`);
            }

            if (uploadMode === "single" || uploadMode === "revoke") {
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    permissions: []
                });
            } else {
                setBulkUsers([]);
                setBulkFile(null);
            }
        } catch (error) {
            console.error("Register error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to process request.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase italic">Access <span className="text-indigo-600">Protocol</span></h1>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Deploy administrative nodes with granular authority.</p>
                </div>

                {canBulkUpload && (
                    <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
                        <button
                            onClick={() => setUploadMode("single")}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${uploadMode === "single" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Single Entry
                        </button>
                        <button
                            onClick={() => setUploadMode("bulk")}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${uploadMode === "bulk" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Bulk Upload
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-6">
                    {uploadMode === "single" ? (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 h-full">
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
                                                required={uploadMode === "single"}
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
                    ) : (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 h-full flex flex-col">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                                <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Upload size={20} />
                                </div>
                                <h2 className="text-lg font-black italic uppercase text-gray-900">Bulk Deploy</h2>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl p-8 text-center space-y-4">
                                <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                                    <FileSpreadsheet size={32} />
                                </div>
                                <div>
                                    <h3 className="font-black italic uppercase text-sm text-gray-900">Upload Spreadsheet</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">XLSX or CSV format required</p>
                                </div>

                                <input
                                    type="file"
                                    id="bulk-file"
                                    className="hidden"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                />
                                <label
                                    htmlFor="bulk-file"
                                    className="cursor-pointer px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
                                >
                                    {bulkFile ? "Change File" : "Select File"}
                                </label>

                                {bulkFile && (
                                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                                        Selected: {bulkFile.name}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={downloadTemplate}
                                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                >
                                    Download Template
                                </button>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                <p className="text-[9px] font-black uppercase text-amber-700 leading-relaxed">
                                    <span className="text-amber-900 underline">Note:</span> The selected permissions on the right will be applied to ALL users in the uploaded file.
                                </p>
                            </div>
                        </div>
                    )}
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
                                    className={`p-1 rounded-2xl border transition-all duration-300 ${permission ? "bg-indigo-50/50 border-indigo-100 shadow-sm" : "bg-gray-50/50 border-transparent"
                                        }`}
                                >
                                    <div className="flex items-center justify-between p-3">
                                        <button
                                            type="button"
                                            onClick={() => handlePermissionToggle(tab.id)}
                                            className={`flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all ${permission ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
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
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${permission.access === "read"
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
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${permission.access === "edit"
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
                            disabled={loading || formData.permissions.length === 0 || (uploadMode === "bulk" && bulkUsers.length === 0)}
                            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all ${loading || formData.permissions.length === 0 || (uploadMode === "bulk" && bulkUsers.length === 0)
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-900 text-white hover:bg-black shadow-2xl active:scale-[0.98]"
                                }`}
                        >
                            {loading ? "Processing..." :
                                uploadMode === "single" ? "Authorize System Access" :
                                    `Authorize ${bulkUsers.length} Users`}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
