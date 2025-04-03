// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el rol del usuario está en la lista de roles permitidos
  const hasPermission = allowedRoles.includes(role);

  // Si no tiene permiso, redirigir a una página de acceso no autorizado
  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si tiene permiso, renderizar los componentes hijos
  return <Outlet />;
};

export default ProtectedRoute;