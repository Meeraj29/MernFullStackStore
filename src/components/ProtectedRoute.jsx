import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== 'admin' && user.role !== 'superadmin') {
        // Redirect to home if user is not an admin but trying to access admin route
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
