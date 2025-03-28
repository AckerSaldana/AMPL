// src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Obtener la sesión actual
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();

        if (error || !currentUser) {
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // Obtener el rol del usuario desde la base de datos
        const { data: profile, error: roleError } = await supabase
          .from("User")
          .select("permission")
          .eq("user_id", currentUser.id)
          .single();

        if (roleError) {
          console.error("Error obteniendo el permiso:", roleError);
          setRole("empleado"); // Rol por defecto si hay error
        } else {
          // Mapear los permisos de la DB a los roles que usamos en la app
          const permissionMap = {
            "Employee": "empleado",
            "TFS": "TFS",
            "Manager": "manager"
          };
          
          // Asignar el rol mapeado o usar "empleado" como valor por defecto
          const mappedRole = permissionMap[profile?.permission] || "empleado";
          setRole(mappedRole);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error en autenticación:", err);
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    };

    fetchUser();

    // Escuchar cambios en la sesión
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return { user, role, loading };
};

export default useAuth;