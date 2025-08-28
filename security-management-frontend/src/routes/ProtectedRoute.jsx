// src/components/routing/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, hasRole } = useAuth();
  const loc = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  if (roles?.length && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
