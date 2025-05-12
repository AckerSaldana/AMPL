import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export const useAvgCertificationsPerEmployee = () => {
  const [avgCerts, setAvgCerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAverage = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get total certifications (rows in UserCertifications)
        const { count: totalCerts, error: certError } = await supabase
          .from("UserCertifications")
          .select("*", { count: "exact", head: true });

        if (certError) throw certError;

        // Get total users (rows in User)
        const { count: totalUsers, error: userError } = await supabase
          .from("User")
          .select("*", { count: "exact", head: true });

        if (userError) throw userError;

        const average = totalUsers
          ? parseFloat((totalCerts / totalUsers).toFixed(2))
          : 0;

        setAvgCerts(average);
      } catch (err) {
        setError(err.message || "Failed to fetch average certifications");
        setAvgCerts(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAverage();
  }, []);

  return { avgCerts, loading, error };
};
