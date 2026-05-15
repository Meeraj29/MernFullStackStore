import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    const fetchNotifications = async () => {
        if (!user) return;
        
        try {
            // For now, if admin, fetch activity logs as notifications
            // If regular user, we could have a different endpoint
            if (user.role === "admin" || user.role === "superadmin") {
                const response = await api.get("/logs");
                const logsData = Array.isArray(response.data) ? response.data : [];
                const logs = logsData.slice(0, 5).map(log => ({
                    id: log._id,
                    title: log.action || "System Event",
                    description: log.details || "Details not specified",
                    time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Recent",
                    date: log.timestamp ? new Date(log.timestamp).toLocaleDateString() : "",
                    type: "activity",
                    read: false 
                }));
                setNotifications(logs);
                setUnreadCount(logs.length);
            } else {
                // Fetch latest products for regular users
                const response = await api.get("/products");
                const productsData = Array.isArray(response.data) ? response.data : [];
                
                // Sort by ID or simulated recency if createdAt isn't selected (though it should be available in full objects)
                // Since the endpoint doesn't select createdAt, we'll just take the last 3 from the list
                const latestProducts = productsData.slice(-3).reverse().map(p => ({
                    id: p._id,
                    title: "New Arrival: " + p.title,
                    description: `Check out our latest ${p.category} addition for ₹${p.price}!`,
                    time: "Recent",
                    type: "product",
                    read: false
                }));

                setNotifications([
                    {
                        id: "welcome",
                        title: "Welcome to Nexus Store",
                        description: "Thank you for joining us! Explore our latest products.",
                        time: "Just now",
                        type: "info",
                        read: false
                    },
                    ...latestProducts
                ]);
                setUnreadCount(latestProducts.length + 1);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up an interval to refresh notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll, refresh: fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
