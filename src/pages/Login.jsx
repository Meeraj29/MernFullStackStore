import { useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const [status, setStatus] = useState({ message: "", type: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ message: "Logging in...", type: "info" });
        try {
            const response = await api.post("auth/login", form);
            setStatus({ message: "Logged in successfully!", type: "success" });

            // Use context to login
            login(response.data.token, response.data.user);

            setTimeout(() => {
                if (response.data.user.role === "admin" || response.data.user.role === "superadmin") {
                    navigate("/admin/profile");
                } else {
                    navigate("/");
                }
            }, 1500);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            setStatus({ message: errorMsg, type: "error" });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-indigo-50 to-blue-100">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl transition-all hover:shadow-blue-200/50">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-medium font-inter text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-600">Please enter your details</p>
                </div>

                {status.message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                        status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 ml-1 transition-colors group-focus-within:text-blue-600">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>


                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 ml-1 transition-colors group-focus-within:text-blue-600">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                            <button
                                type="button"
                                onMouseDown={() => setShowPassword(true)}
                                onMouseUp={() => setShowPassword(false)}
                                onMouseLeave={() => setShowPassword(false)}
                                onTouchStart={() => setShowPassword(true)}
                                onTouchEnd={() => setShowPassword(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 transition-colors select-none"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>


                    <button
                        type="submit"
                        className="mt-4 w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-98 transition-all shadow-lg shadow-blue-200"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account? <a href="/signup" className="font-semibold text-blue-600 hover:text-blue-500">Sign up</a>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                    <Link to="/admin/login" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-all">
                        Staff & Admin Access Portal
                    </Link>
                </div>
            </div>
        </div>
    );
}