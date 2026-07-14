import {Navigate, Outlet} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminProtectedRoute() {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user || !isAdmin) {
        return <Navigate to="admin/login" replace />;
    }

    return <Outlet />;
}