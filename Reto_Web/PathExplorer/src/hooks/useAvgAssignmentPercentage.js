import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

/**
 * Custom hook to fetch the average assignment percentage of all employees
 * @returns {Object} The average percentage, loading state, and any error
 */
const useAvgAssignmentPercentage = () => {
  const [avgPercentage, setAvgPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAveragePercentage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all users with their percentage
        const { data, error } = await supabase
          .from("User")
          .select("percentage");

        if (error) throw error;

        if (data && data.length > 0) {
          // Calculate the average percentage
          const sum = data.reduce((acc, user) => {
            // Handle null or undefined percentages as 0
            return acc + (user.percentage || 0);
          }, 0);

          const average = sum / data.length;

          // Round to one decimal place
          setAvgPercentage(Math.round(average * 10) / 10);
        } else {
          setAvgPercentage(0);
        }
      } catch (err) {
        console.error(
          "Error fetching average assignment percentage:",
          err.message
        );
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAveragePercentage();
  }, []);

  return { avgPercentage, loading, error };
};

export default useAvgAssignmentPercentage;
