import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import api from "./api/axios";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Productdetails from "./pages/Productdetails";
import ProductList from "./admin/productList";
import AddProduct from "./admin/addProduct";
import EditProduct from "./admin/editProduct";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Navbar from "./components/Navbar";
import AdminLayout from "./admin/adminlayout";

function Layout() {
    useEffect(() => {
        const logVisit = async () => {
            try {
                const userId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage
                await api.post("/analytics/event", { type: "visit", userId });
            } catch (err) {
                console.error("Visit log failed", err);
            }
        };
        logVisit();
    }, []);

    return (
        <div>
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
}

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
import Profile from "./pages/Profile";
import AdminProfile from "./admin/AdminProfile";
import AdminAccount from "./admin/AdminAccount";
import AdminLogin from "./admin/AdminLogin";
import AdminSignup from "./admin/AdminSignup";

import OrderSuccess from "./pages/OrderSuccess";
import Payment from "./pages/Payment";

import AdminLogs from "./admin/AdminLogs";
import AdminOrders from "./admin/AdminOrders";
import UserList from "./admin/UserList";
import GiveAccess from "./admin/GiveAccess";
import AdminReports from "./admin/AdminReports";
import AdminAnalytics from "./admin/AdminAnalytics";
import BulkUpload from "./admin/BulkUpload";
import RevokeAccess from "./admin/RevokeAccess";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "sonner";

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "/signup",
                element: <Signup />
            },
            {
                path: "/admin/login",
                element: <AdminLogin />
            },
            {
                path: "/admin/signup",
                element: <AdminSignup />
            },
            {
                path: "/product/:id",
                element: <Productdetails />
            },
            {
                path: "/cart",
                element: <Cart />
            },
            {
                path: "/wishlist",
                element: <Wishlist />
            },
            {
                path: "/order-success",
                element: <OrderSuccess />
            },
            {
                path: "/payment",
                element: <Payment />
            },
            {
                path: "/profile",
                element: <ProtectedRoute />,
                children: [
                    { path: "", element: <Profile /> }
                ]
            },
            {
                path: "/admin",
                element: <ProtectedRoute adminOnly={true} />,
                children: [
                    {
                        element: <AdminLayout />,
                        children: [
                            { path: "profile", element: <AdminProfile /> },
                            { path: "users", element: <UserList /> },
                            { path: "products", element: <ProductList /> },
                            { path: "add-product", element: <AddProduct /> },
                            { path: "edit-product/:id", element: <EditProduct /> },
                            { path: "account", element: <AdminAccount /> },
                            { path: "orders", element: <AdminOrders /> },
                            { path: "logs", element: <AdminLogs /> },
                            { path: "give-access", element: <GiveAccess /> },
                            { path: "reports", element: <AdminReports /> },
                            { path: "analytics", element: <AdminAnalytics /> },
                            { path: "bulk-upload", element: <BulkUpload /> },
                            { path: "revoke-access", element: <RevokeAccess /> },
                        ]
                    }
                ]
            }
        ]
    }
]);

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
            <WishlistProvider>
                <CartProvider>
                    <NotificationProvider>
                        <Toaster position="top-center" richColors />
                        <RouterProvider router={router} />
                    </NotificationProvider>
                </CartProvider>
            </WishlistProvider>
        </AuthProvider>
        </ThemeProvider>
    );
}
