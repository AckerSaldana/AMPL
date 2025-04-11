// src/hooks/useAuth.js - versión simplificada
import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Solo obtén la información de autenticación básica
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();

        if (error || !currentUser) {
          setUser(null);
          setRole("empleado");
          setLoading(false);
          return;
        }

        setUser(currentUser);
        
        // Obtener perfil desde tu tabla pública "User" (no auth.users)
        try {
          const { data: userProfile, error: profileError } = await supabase
            .from('User')
            .select('permission')
            .eq('user_id', currentUser.id)
            .single();

          if (profileError) {
            console.error("Error al obtener perfil:", profileError);
            setRole("empleado"); // Rol por defecto en caso de error
          } else if (userProfile) {
            // Mapeo de los permisos a los roles que usa tu aplicación
            const permissionMap = {
              "Employee": "empleado",
              "TFS": "TFS",
              "Manager": "manager"
            };
            setRole(permissionMap[userProfile.permission] || "empleado");
          } else {
            setRole("empleado");
          }
        } catch (profileErr) {
          console.error("Error en consulta de perfil:", profileErr);
          setRole("empleado");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error en autenticación:", err);
        setUser(null);
        setRole("empleado");
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
        setRole("empleado");
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