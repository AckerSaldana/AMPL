import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const useAverageIdleDays = () => {
  const [avgIdleDays, setAvgIdleDays] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAverageIdleDays = async () => {
      const { data, error } = await supabase
        .from("averageidledays")
        .select("avg_idle_days_per_user")
        .single();

      if (error) {
        console.error("Error fetching avg idle days:", error);
      } else {
        setAvgIdleDays(data.avg_idle_days_per_user);
      }

      setLoading(false);
    };

    fetchAverageIdleDays();
  }, []);

  return { avgIdleDays, loading };
};

export default useAverageIdleDays;
