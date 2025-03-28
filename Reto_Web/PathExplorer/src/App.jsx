// src/App.jsx o donde configures tus rutas
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Profiles from './pages/Profiles';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import User from './pages/User';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profiles" element={<Profiles />} />
          <Route path="settings" element={<Settings />} />
          <Route path="user" element={<User />} />
          <Route element={<ProtectedRoute allowedRoles={["empleado", "TFS", "manager"]} />}>
            <Route path="/projects" element={<Projects />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
            <Route path="/analytics" element={<Projects />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
