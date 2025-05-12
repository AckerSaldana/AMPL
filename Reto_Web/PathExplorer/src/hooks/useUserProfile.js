// src/hooks/useUserProfile.js
import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import useAuth from "./useAuth";

const useUserProfile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 1. Obtener datos básicos del usuario
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('name, last_name, permission, profile_pic, about')
          .eq('user_id', user.id)
          .single();

        if (userError) throw userError;

        // 2. Obtener habilidades del usuario
        const { data: userSkills, error: skillsError } = await supabase
          .from('UserSkill')
          .select(`
            skill_ID,
            proficiency,
            Skill!inner (
              name
            )
          `)
          .eq('user_ID', user.id);

        if (skillsError) throw skillsError;

        // 3. Contar proyectos del usuario
        const { count: projectsCount, error: projectsError } = await supabase
          .from('UserRole')
          .select('project_id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (projectsError) throw projectsError;

        // 4. Contar certificaciones del usuario
        const { count: certificationsCount, error: certsError } = await supabase
          .from('UserCertifications')
          .select('certification_ID', { count: 'exact', head: true })
          .eq('user_ID', user.id);

        if (certsError) throw certsError;

        // Extraer los nombres de habilidades y ordenarlos por nivel de competencia
        const skillNames = userSkills
          .sort((a, b) => {
            // Ordenar primero por nivel de competencia (si existe)
            const proficiencyOrder = { 'Advanced': 1, 'Intermediate': 2, 'Basic': 3 };
            return (proficiencyOrder[a.proficiency] || 99) - (proficiencyOrder[b.proficiency] || 99);
          })
          .map(skill => skill.Skill?.name)
          .filter(Boolean); // Eliminar posibles valores nulos

        // Formatear la información del perfil
        const formattedProfile = {
          name: `${userData.name} ${userData.last_name}`,
          avatar: userData.profile_pic || "",
          currentRole: userData.permission || "Employee",
          projectsCount: projectsCount || 0,
          certificationsCount: certificationsCount || 0,
          primarySkills: skillNames.slice(0, 8), // Limitar a 8 habilidades principales
          about: userData.about || "Experienced professional"
        };

        setUserProfile(formattedProfile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(error.message);
        
        // Proporcionar un perfil predeterminado en caso de error
        setUserProfile({
          name: user?.email?.split('@')[0] || "User",
          avatar: "",
          currentRole: "Employee",
          projectsCount: 0,
          certificationsCount: 0,
          primarySkills: [],
          about: "Professional at Accenture"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  return { userProfile, loading, error };
};

export default useUserProfile;