import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
