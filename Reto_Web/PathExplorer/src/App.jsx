// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout principal
import MainLayout from "./layout/MainLayout";

// Páginas
import Dashboard from "./pages/Dashboard";
import Profiles from "./pages/Profiles";
import Analytics from "./pages/Analytics";
import MyPath from "./pages/MyPath";
import User from "./pages/User";
import Certifications from "./pages/Certifications";
import ProjectDashboard from "./pages/ProjectDashboard.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import EditProfile from "./pages/EditProfile";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import SubmitCertification from "./pages/SubmitCertification.jsx";
import AddProject from "./pages/AddProject.jsx";
import RoleAssign from "./pages/RoleAssign.jsx";
import ProjectEdit from "./pages/ProjectEdit.jsx";
import AllSkills from "./pages/AllSkills.jsx";

// Nuevo componente de detalle de perfil
import UserProfileDetail from "./pages/UserProfileDetail";

// Protección de rutas
import ProtectedRoute from "./components/ProtectedRoute";

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
            <Route path="project-detail/:id" element={<ProjectDetail />} />
            <Route path="project-edit/:id" element={<ProjectEdit />} />
            <Route path="add-projects" element={<AddProject />} />
            <Route path="role-assign" element={<RoleAssign />} />
            <Route path="certifications" element={<Certifications />} />
            <Route
              path="submit-certification"
              element={<SubmitCertification />}
            />
            <Route path="mypath" element={<MyPath />} />
            <Route path="user" element={<User />} />
            {/* Nueva ruta para ver detalle de usuario por ID */}
            <Route path="user/:id" element={<UserProfileDetail />} />
            <Route path="edit-profile" element={<EditProfile />} />
            {/* Nueva ruta para editar perfil de un usuario específico */}
            <Route path="edit-profile/:id" element={<EditProfile />} />
          </Route>

          {/* Rutas accesibles solo para TFS y manager */}
          <Route element={<ProtectedRoute allowedRoles={["TFS", "manager"]} />}>
            <Route path="profiles" element={<Profiles />} />
          </Route>

          {/* Rutas accesibles solo para manager */}
          <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
            <Route path="analytics" element={<Analytics />} />
            <Route path="all-skills" element={<AllSkills />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
