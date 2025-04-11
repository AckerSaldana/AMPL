import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const useProjectData = () => {
  const [userRoles, setUserRoles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Obtener UserRole con datos del usuario
        const { data: userRolesData, error: userRolesError } = await supabase
          .from("UserRole")
          .select("user_id, role_name, project_id, feedback_notes");

        if (userRolesError) throw userRolesError;
        setUserRoles(userRolesData);

        // Obtener Projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("Project")
          .select("*");

        if (projectsError) throw projectsError;
        setProjects(projectsData);

        // Obtener Clients
        const { data: clientsData, error: clientsError } = await supabase
          .from("Client")
          .select("*");

        if (clientsError) throw clientsError;
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { userRoles, projects, clients, loading };
};

export default useProjectData;
