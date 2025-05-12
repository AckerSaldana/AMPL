// src/hooks/useUserTimeline.js
import { useState, useEffect } from "react";
import useUserProjects from "./useUserProjects";
import useUserCertifications from "./useUserCertifications";

const useUserTimeline = () => {
  const { projects, loading: projectsLoading, useMockData: usingMockProjects } = useUserProjects();
  const { certifications, loading: certificationsLoading, useMockData: usingMockCerts } = useUserCertifications();
  const [timelineItems, setTimelineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    // Esperar a que se carguen ambos conjuntos de datos
    if (!projectsLoading && !certificationsLoading) {
      console.log("Timeline data ready - Projects:", projects.length, "Certifications:", certifications.length);
      
      // Establecer si estamos usando algún dato mock
      setUseMockData(usingMockProjects || usingMockCerts);
      
      // Formatear proyectos para el timeline
      const projectItems = projects.map(project => ({
        ...project,
        type: "project",
        displayDate: project.date
      }));

      // Formatear certificaciones para el timeline (solo las aprobadas)
      const certificationItems = certifications
        .filter(cert => cert.status === "approved") // Extra verificación aunque ya debería venir filtrado
        .map(cert => ({
          ...cert,
          type: "certification",
          displayDate: cert.date
        }));

      // Combinar y ordenar cronológicamente
      const combinedItems = [...projectItems, ...certificationItems].sort((a, b) => {
        // Función para extraer la fecha de inicio
        const getStartDate = (item) => {
          if (item.type === "project" && item.startDate) {
            return new Date(item.startDate);
          } else if (item.type === "certification" && item.completedDate) {
            return new Date(item.completedDate);
          }
          // Valor por defecto si no hay fecha
          return new Date(0);
        };

        // Ordenar de más reciente a más antiguo
        return getStartDate(b) - getStartDate(a);
      });

      console.log("Combined timeline items:", combinedItems.length);
      setTimelineItems(combinedItems);
      setLoading(false);
    }
  }, [projects, certifications, projectsLoading, certificationsLoading, usingMockProjects, usingMockCerts]);

  return { timelineItems, loading, useMockData };
};

export default useUserTimeline;