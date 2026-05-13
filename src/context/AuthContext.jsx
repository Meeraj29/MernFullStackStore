import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const response = await api.get("auth/profile");
            setUser(response.data);
        } catch (error) {
            console.error("Fetch user error:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (token, userData) => {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userData?.id || userData?._id || "");
        setUser(userData);
        api.post("/analytics/event", {
            type: "login",
            userId: userData?.id || userData?._id || null
        }).catch((error) => console.error("Login analytics failed:", error));
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setUser(null);
        window.location.href = "/login";
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
