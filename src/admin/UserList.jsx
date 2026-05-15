import { useState, useEffect } from "react";
import api from "../api/axios";
import { Users, Trash2, CheckCircle, AlertCircle, Mail, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function UserList() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ message: "", type: "" });

    // Email states
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [emailData, setEmailData] = useState({ subject: "", message: "" });
    const [emailSending, setEmailSending] = useState(false);

    const canEdit = currentUser?.role === "superadmin" || 
                    currentUser?.permissions?.find(p => p.section === "Users")?.access === "edit";

    const fetchUsers = async () => {
        try {
            const response = await api.get("auth/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Fetch users error:", error);
            setStatus({ message: "Failed to load users", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSendDirectEmail = async (e) => {
        e.preventDefault();
        if (!emailData.subject || !emailData.message) return;
        
        setEmailSending(true);
        try {
            await api.post("auth/send-direct-email", {
                recipientEmail: selectedUser.email,
                subject: emailData.subject,
                message: emailData.message
            });
            setStatus({ message: `Email sent successfully to ${selectedUser.name}!`, type: "success" });
            setShowEmailModal(false);
            setEmailData({ subject: "", message: "" });
        } catch (error) {
            setStatus({ message: "Failed to send email. Check your settings.", type: "error" });
        } finally {
            setEmailSending(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!canEdit) return;
        try {
            await api.put(`auth/users/${userId}/role`, { role: newRole });
            setStatus({ message: "User role updated successfully", type: "success" });
            fetchUsers();
        } catch (error) {
            setStatus({ message: error.response?.data?.message || "Failed to update role", type: "error" });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!canEdit) return;
        if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
        try {
            await api.delete(`auth/users/${userId}`);
            setStatus({ message: "User deleted successfully", type: "success" });
            fetchUsers();
        } catch (error) {
            setStatus({ message: "Failed to delete user", type: "error" });
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase text-gray-900">User <span className="text-indigo-600">Management</span></h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Control system access vectors and roles</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                    <Users size={16} className="text-indigo-600" />
                    <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">{users.length} Active Nodes</span>
                </div>
            </div>

            {status.message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{status.message}</span>
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role Protocol</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Axis</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-indigo-50 to-fuchsia-50 flex items-center justify-center text-indigo-600 font-black text-xs border border-indigo-100">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900">{user.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1">
                                        <select
                                            disabled={!canEdit || user.role === 'superadmin'}
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className={`w-fit px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all outline-none ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''} ${user.role === 'admin' || user.role === 'superadmin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">Super Admin</option>
                                        </select>
                                        
                                        {user.permissions && user.permissions.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                                                {user.permissions.map((p, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[7px] font-black uppercase border border-indigo-100">
                                                        {p.section}: {p.access}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowEmailModal(true);
                                            }}
                                            className="p-2 text-gray-300 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                                            title="Send Direct Email"
                                        >
                                            <Mail size={16} />
                                        </button>
                                        {canEdit && user.role !== 'superadmin' && (
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Direct Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-100 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black italic tracking-tighter uppercase">Direct Message</h3>
                                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Recpient: {selectedUser?.name}</p>
                            </div>
                            <button onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSendDirectEmail} className="p-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Vector</label>
                                <input 
                                    required
                                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-indigo-600 font-bold text-sm"
                                    placeholder="Enter subject..."
                                    value={emailData.subject}
                                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Content</label>
                                <textarea 
                                    required
                                    rows="5"
                                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-indigo-600 font-bold text-sm resize-none"
                                    placeholder="Type your message to the user..."
                                    value={emailData.message}
                                    onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                                ></textarea>
                            </div>
                            <button 
                                disabled={emailSending}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                                {emailSending ? "Transmitting..." : "Initialize Transmission"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
