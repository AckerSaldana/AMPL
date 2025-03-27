import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData, error } = await supabase.auth.getUser();

      if (error || !userData.user) {
        setUser(null);
        setRole(null);
      } else {
        setUser(userData.user);

        // Obtener rol del usuario
        const { data: profile, error: roleError } = await supabase
          .from("User")
          .select("permission")
          .eq("user_id", userData.user.id)
          .single();

        if (roleError) {
          console.error("Error obteniendo el permiso:", roleError);
          setRole(null);
        } else {
          setRole(profile?.permission || "empleado"); //defecto: "empleado"
        }
      }
      setLoading(false);
    };

    fetchUser();

    // Escuchar cambios en la sesión
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading };
};

export default useAuth;
