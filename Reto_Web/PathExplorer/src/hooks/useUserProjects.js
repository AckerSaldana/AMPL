// src/hooks/useUserProjects.js
import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import useAuth from "./useAuth";

const useUserProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Obtener roles del usuario con info del proyecto
        const { data: userRoles, error: userRolesError } = await supabase
          .from('UserRole')
          .select(`
            role_name,
            project_id,
            feedback_notes,
            Project!inner (
              title,
              description,
              start_date,
              end_date,
              status,
              client_id
            )
          `)
          .eq('user_id', user.id);

        if (userRolesError) throw userRolesError;

        // Obtener información del cliente para cada proyecto
        const projectsWithClients = await Promise.all(
          userRoles.map(async (role) => {
            // Solo buscar cliente si existe client_id
            if (role.Project.client_id) {
              const { data: clientData, error: clientError } = await supabase
                .from('Client')
                .select('name')
                .eq('client_id', role.Project.client_id)
                .single();

              if (clientError && clientError.code !== 'PGRST116') {
                console.warn("Error fetching client:", clientError);
              }

              const clientName = clientData?.name || "No client specified";
              
              return {
                id: role.project_id,
                name: role.Project.title,
                role: role.role_name,
                company: clientName,
                date: formatDateRange(role.Project.start_date, role.Project.end_date),
                skills: [], // Podríamos obtener skills asociadas al proyecto si fuera necesario
                description: role.Project.description || "No description available",
                status: role.Project.status,
                feedback: role.feedback_notes,
                startDate: role.Project.start_date,
                endDate: role.Project.end_date,
              };
            } else {
              return {
                id: role.project_id,
                name: role.Project.title,
                role: role.role_name,
                company: "Internal Project",
                date: formatDateRange(role.Project.start_date, role.Project.end_date),
                skills: [], 
                description: role.Project.description || "No description available",
                status: role.Project.status,
                feedback: role.feedback_notes,
                startDate: role.Project.start_date,
                endDate: role.Project.end_date,
              };
            }
          })
        );

        // Ordenar proyectos por fecha (más recientes primero)
        const sortedProjects = projectsWithClients.sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
          const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
          return dateB - dateA;
        });

        setProjects(sortedProjects);
      } catch (error) {
        console.error("Error fetching user projects:", error);
        setError(error.message);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  // Función auxiliar para formatear el rango de fechas
  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return "No date specified";

    const start = new Date(startDate);
    const formattedStart = start.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });

    if (!endDate) {
      return `${formattedStart} - Present`;
    }

    const end = new Date(endDate);
    const formattedEnd = end.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });

    return `${formattedStart} - ${formattedEnd}`;
  };

  return { projects, loading, error };
};

export default useUserProjects;