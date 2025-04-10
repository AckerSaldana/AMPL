// src/App.jsx - Versión actualizada
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Profiles from "./pages/Profiles";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import User from "./pages/User";
import Certifications from "./pages/Certifications"; 

import ProjectDashboard from "./pages/ProjectDashboard.jsx";

import EditProfile from "./pages/EditProfile";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import Unauthorized from "./pages/Unauthorized"; // Necesitamos crear esta página
import AddProject from "./pages/AddProject.jsx";
import RoleAssign from "./pages/RoleAssign.jsx";

import Unauthorized from "./pages/Unauthorized";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública para login */}
        <Route path="/login" element={<Login />} />
        {/* Página de acceso no autorizado */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Rutas protegidas dentro del layout principal */}
        <Route path="/" element={<MainLayout />}>
          {/* Rutas accesibles para todos los roles (empleado, TFS, manager) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["empleado", "TFS", "manager"]} />
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectDashboard />} />

            <Route path="add-projects" element={<AddProject />} />
            <Route path="role-assign" element={<RoleAssign />} />

            <Route path="certifications" element={<Certifications />} />

            <Route path="settings" element={<Settings />} />
            <Route path="user" element={<User />} />
            <Route path="edit-profile" element={<EditProfile />} />
          </Route>

          {/* Rutas accesibles solo para TFS y manager */}
          <Route element={<ProtectedRoute allowedRoles={["TFS", "manager"]} />}>
            <Route path="profiles" element={<Profiles />} />
          </Route>

          {/* Rutas accesibles solo para manager */}
          <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
            <Route path="analytics" element={<Analytics />} />
          </Route>
          {/* Redirección por defecto a dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;