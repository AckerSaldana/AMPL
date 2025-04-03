import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient"; // Asegúrate de que este archivo esté bien configurado

const ProjectDashboardAdmin = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener Proyectos
        const { data: projectData, error: projectError } = await supabase.from("Project").select("*");
        if (projectError) console.error("Error obteniendo proyectos:", projectError);
        setProjects(projectData || []);

        // Obtener Clientes
        const { data: clientData, error: clientError } = await supabase.from("Client").select("*");
        if (clientError) console.error("Error obteniendo clientes:", clientError);
        setClients(clientData || []);

        // Obtener Roles de Usuario
        const { data: userRoleData, error: userRoleError } = await supabase.from("UserRole").select("*");
        if (userRoleError) console.error("Error obteniendo roles de usuario:", userRoleError);
        setUserRoles(userRoleData || []);

      } catch (err) {
        console.error("Error inesperado:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Tabla de Proyectos */}
      <h2>Lista de Proyectos</h2>
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <table border="1" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Cliente ID</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.projectID}>
                  <td>{project.projectID}</td>
                  <td>{project.title}</td>
                  <td>{project.description}</td>
                  <td>{project.start_date}</td>
                  <td>{project.end_date}</td>
                  <td>{project.status}</td>
                  <td>{project.client_id}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>No hay proyectos disponibles.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Tabla de Clientes */}
      <h2>Lista de Clientes</h2>
      <table border="1" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <tr key={client.clientID}>
                <td>{client.clientID}</td>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>No hay clientes disponibles.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Tabla de Roles de Usuario */}
      <h2>Lista de Roles de Usuario</h2>
      <table border="1" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del Rol</th>
          </tr>
        </thead>
        <tbody>
          {userRoles.length > 0 ? (
            userRoles.map((role) => (
              <tr key={role.roleID}>
                <td>{role.roleID}</td>
                <td>{role.roleName}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" style={{ textAlign: "center" }}>No hay roles de usuario disponibles.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectDashboardAdmin;
