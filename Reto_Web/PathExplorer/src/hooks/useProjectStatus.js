import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient.js';

export const useProjectStatus = () => {
  const [statusData, setStatusData] = useState({
    counts: {
      'Not Started': 0,
      'In Progress': 0,
      'On Hold': 0,
      'Completed': 0
    },
    total: 0,
    completionPercentage: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchProjectStatus = async () => {
      try {
        // 1. First get all projects
        const { data: projects, error } = await supabase
          .from('Project')
          .select('projectID, status');

        if (error) throw error;

        // 2. Calculate counts manually
        const statusCounts = {
          'Not Started': 0,
          'In Progress': 0,
          'On Hold': 0,
          'Completed': 0
        };

        projects.forEach(project => {
          if (project.status in statusCounts) {
            statusCounts[project.status]++;
          }
        });

        // 3. Calculate metrics
        const totalProjects = projects.length;
        const completionPercentage = totalProjects > 0
          ? Math.round((statusCounts['Completed'] / totalProjects) * 100)
          : 0;

        setStatusData({
          counts: statusCounts,
          total: totalProjects,
          completionPercentage,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Project status error:', error);
        setStatusData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchProjectStatus();
  }, []);

  return statusData;
};