import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient.js';

export const useProjectAssignments = () => {
  const [assignments, setAssignments] = useState({
    assigned: 0,
    unassigned: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        // Get all active projects
        const { data: activeProjects, error: projectError } = await supabase
          .from('Project')
          .select('projectID')
          .eq('status', 'In Progress');

        if (projectError) throw projectError;

        // Get users assigned to these projects
        const { data: assignedUsers, error: assignmentError } = await supabase
          .from('UserRole')
          .select('user_id')
          .in('project_id', activeProjects?.map(p => p.projectID) || []) 
          .not('project_id', 'is', null);

        if (assignmentError) throw assignmentError;

        // Count all users
        const { count: totalUsers } = await supabase
          .from('User')
          .select('user_id', { count: 'exact', head: true });

        // Get unique assigned users
        const uniqueAssignedUsers = new Set(assignedUsers?.map(u => u.user_id) || []);

        setAssignments({
          assigned: uniqueAssignedUsers.size,
          unassigned: (totalUsers || 0) - uniqueAssignedUsers.size,
          loading: false,
          error: null
        });
      } catch (error) {
        setAssignments(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchAssignmentData();
  }, []);

  return assignments;
};