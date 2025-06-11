// src/hooks/useUserTimeline.js
import { useState, useEffect, useCallback } from "react";
import useUserProjects from "./useUserProjects";
import useUserCertifications from "./useUserCertifications";
import useAuth from "./useAuth";
import { supabase } from "../supabase/supabaseClient";
import eventBus, { EVENTS } from "../utils/eventBus";

const useUserTimeline = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading, useMockData: usingMockProjects } = useUserProjects();
  const { certifications, loading: certificationsLoading, useMockData: usingMockCerts } = useUserCertifications();
  const [timelineItems, setTimelineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [suggestedCerts, setSuggestedCerts] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

  // Fetch AI suggested certifications
  const fetchSuggestedCertifications = useCallback(async () => {
    if (!user) {
      setSuggestedLoading(false);
      return;
    }

    try {
      setSuggestedLoading(true);
      const { data: suggestions, error } = await supabase
        .from("AISuggested")
        .select("certification_id, Certifications(title, issuer, type)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching AISuggested:", error.message);
        setSuggestedCerts([]);
      } else {
        const formattedSuggestions = suggestions.map(cert => ({
          id: cert.certification_id,
          name: cert.Certifications?.title || "Certification",
          issuer: cert.Certifications?.issuer || "Unknown",
          type: "certification",
          displayDate: "AI suggested",
          isSuggested: true,
          date: "AI suggested"
        }));
        setSuggestedCerts(formattedSuggestions);
      }
    } catch (err) {
      console.error("Error fetching suggested certifications:", err);
      setSuggestedCerts([]);
    } finally {
      setSuggestedLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchSuggestedCertifications();
  }, [fetchSuggestedCertifications]);

  // Listen for AI cert added events
  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.AI_CERT_ADDED, () => {
      console.log("AI cert added event received, refreshing suggested certifications");
      fetchSuggestedCertifications();
    });

    return unsubscribe;
  }, [fetchSuggestedCertifications]);

  useEffect(() => {
    // Esperar a que se carguen todos los conjuntos de datos
    if (!projectsLoading && !certificationsLoading && !suggestedLoading) {
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

      // Combinar y ordenar cronológicamente (projects and certifications)
      const regularItems = [...projectItems, ...certificationItems].sort((a, b) => {
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

      // Put suggested certifications first, then regular items
      const combinedItems = [...suggestedCerts, ...regularItems];

      console.log("Combined timeline items:", combinedItems.length, "Suggested:", suggestedCerts.length);
      setTimelineItems(combinedItems);
      setLoading(false);
    }
  }, [projects, certifications, projectsLoading, certificationsLoading, usingMockProjects, usingMockCerts, suggestedCerts, suggestedLoading]);

  return { timelineItems, loading, useMockData };
};

export default useUserTimeline;