import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserCircle, Shield, Mail, Activity, LogOut, Edit3, Save, X, Phone, MapPin, Eye, EyeOff } from "lucide-react";
import api from "../api/axios";

// Shadcn UI Imports
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

export default function AdminAccount() {
    const { user, logout, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put("auth/update-profile", formData);
            updateUser(response.data.user);
            setIsEditing(false);
            setFormData(prev => ({ ...prev, password: "" }));
            alert("Profile updated successfully.");
        } catch (error) {
            console.error("Update error:", error);
            alert(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 p-4">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">
                    Account <span className="text-indigo-600">Settings</span>
                </h1>
                <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">
                    Manage your administrative profile and credentials
                </p>
            </div>

            <Card className="max-w-4xl rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="p-10 border-b border-gray-50 bg-gray-50/30">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar Section using Shadcn Avatar */}
                        <div className="relative">
                            <Avatar className="h-24 w-24 rounded-[2rem] border-4 border-white shadow-xl">
                                <AvatarFallback className="  from-indigo-500 to-fuchsia-500 text-white font-black text-3xl">
                                    {user?.name?.charAt(0) || "A"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white shadow-lg">
                                <Activity size={14} />
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <CardTitle className="text-2xl font-black text-gray-900">{user?.name}</CardTitle>
                            <CardDescription className="font-bold text-indigo-600 uppercase tracking-widest text-[10px] flex items-center justify-center md:justify-start gap-2 mt-1">
                                <Shield size={12} /> {user?.role} Access Protocol
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-10">
                    {!isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                    <UserCircle size={12} className="text-indigo-600" /> Full Name
                                </Label>
                                <div className="px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold text-gray-900">
                                    {user?.name || "Administrator"}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                    <Mail size={12} className="text-indigo-600" /> Email Address
                                </Label>
                                <div className="px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold text-gray-900">
                                    {user?.email || "admin@nexus.core"}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                    <Phone size={12} className="text-indigo-600" /> Phone Number
                                </Label>
                                <div className="px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold text-gray-900">
                                    {user?.phone || "Not provided"}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                    <MapPin size={12} className="text-indigo-600" /> Office Address
                                </Label>
                                <div className="px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold text-gray-900">
                                    {user?.address || "Not provided"}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="rounded-2xl h-12 bg-gray-50 border-gray-100 font-bold focus:ring-indigo-500/20"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="rounded-2xl h-12 bg-gray-50 border-gray-100 font-bold focus:ring-indigo-500/20"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="rounded-2xl h-12 bg-gray-50 border-gray-100 font-bold focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="rounded-2xl h-12 pr-12 bg-gray-50 border-gray-100 font-bold focus:ring-indigo-500/20"
                                            placeholder="••••••••"
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
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Office Address</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="rounded-2xl h-12 bg-gray-50 border-gray-100 font-bold focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={loading} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
                                    <Save className="mr-2 h-4 w-4" /> {loading ? "Updating..." : "Save Changes"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>

                {!isEditing && (
                    <CardFooter className="p-10 bg-gray-50/30 border-t border-gray-50 flex flex-wrap gap-4">
                        <Button 
                            variant="destructive" 
                            onClick={logout} 
                            className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700"
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                        <Button 
                            onClick={() => setIsEditing(true)} 
                            className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] bg-gray-900 text-white hover:bg-gray-800"
                        >
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
