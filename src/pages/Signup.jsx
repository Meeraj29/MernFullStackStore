import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
    const navigate = useNavigate();
    const initialFormState = {
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    };

    const [form, setForm] = useState(initialFormState);
    const [status, setStatus] = useState({ message: "", type: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setStatus({ message: "Passwords do not match!", type: "error" });
            return;
        }
        setStatus({ message: "Creating account...", type: "info" });

        try {
            const response = await api.post("auth/signup", form);
            setStatus({ message: "User created successfully! Redirecting...", type: "success" });
            console.log(response.data);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            setStatus({ message: errorMsg, type: "error" });
            console.log(errorMsg);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl transition-all hover:shadow-indigo-200/50">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-medium font-inter text-gray-900">Create an Account</h2>
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
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 ml-1 transition-colors group-focus-within:text-indigo-600">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 ml-1 transition-colors group-focus-within:text-indigo-600">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 ml-1 transition-colors group-focus-within:text-indigo-600">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                            />
                            <button
                                type="button"
                                onMouseDown={() => setShowPassword(true)}
                                onMouseUp={() => setShowPassword(false)}
                                onMouseLeave={() => setShowPassword(false)}
                                onTouchStart={() => setShowPassword(true)}
                                onTouchEnd={() => setShowPassword(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors select-none"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 ml-1 transition-colors group-focus-within:text-indigo-600">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                            />
                            <button
                                type="button"
                                onMouseDown={() => setShowConfirm(true)}
                                onMouseUp={() => setShowConfirm(false)}
                                onMouseLeave={() => setShowConfirm(false)}
                                onTouchStart={() => setShowConfirm(true)}
                                onTouchEnd={() => setShowConfirm(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors select-none"
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>


                    <button
                        type="submit"
                        className="mt-4 w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-98 transition-all shadow-lg shadow-indigo-200"
                    >
                        Create Account
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account? <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Log in</a>
                </div>
            </div>
        </div>
    );
}