import { useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../api/axios";
import { Eye, EyeOff } from "lucide-react";

export default function AdminSignup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", adminCode: "" });
    const [status, setStatus] = useState({ message: "", type: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showCode, setShowCode] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ message: "Transmitting data to master node...", type: "info" });
        try {
            await api.post("auth/signup-admin", {
                name: form.name,
                email: form.email,
                password: form.password,
                adminSecret: form.adminCode
            });
            setStatus({ message: "Admin registration successful!", type: "success" });
            setTimeout(() => navigate("/admin/login"), 1500);
        } catch (error) {
            setStatus({ message: error.response?.data?.message || "Registration failed", type: "error" });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">Admin <span className="text-indigo-600">Register</span></h1>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">Initialize new administrative node</p>
                </div>

                {status.message && (
                    <div className={`mb-8 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-indigo-600 outline-none transition-all font-bold text-sm" placeholder="Admin Name" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Identity Vector (Email)</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-indigo-600 outline-none transition-all font-bold text-sm" placeholder="admin@nexus.core" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Security Key (Password)</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} className="w-full px-6 py-4 pr-14 rounded-2xl bg-gray-50 border border-gray-100 focus:border-indigo-600 outline-none transition-all font-bold text-sm" placeholder="••••••••" required />
                            <button type="button" onMouseDown={() => setShowPassword(true)} onMouseUp={() => setShowPassword(false)} onMouseLeave={() => setShowPassword(false)} onTouchStart={() => setShowPassword(true)} onTouchEnd={() => setShowPassword(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors select-none" tabIndex={-1}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Secret Admin Protocol Code</label>
                        <div className="relative">
                            <input type={showCode ? "text" : "password"} name="adminCode" value={form.adminCode} onChange={handleChange} className="w-full px-6 py-4 pr-14 rounded-2xl bg-gray-50 border border-gray-100 focus:border-indigo-600 outline-none transition-all font-bold text-sm" placeholder="Secret Code" required />
                            <button type="button" onMouseDown={() => setShowCode(true)} onMouseUp={() => setShowCode(false)} onMouseLeave={() => setShowCode(false)} onTouchStart={() => setShowCode(true)} onTouchEnd={() => setShowCode(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors select-none" tabIndex={-1}>
                                {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4">
                        Initialize Node
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <Link to="/admin/login" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors">
                        Existing administrator login
                    </Link>
                </div>
            </div>
        </div>
    );
}
