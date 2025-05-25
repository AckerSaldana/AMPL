// src/hooks/useUserProfileCache.js
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabase/supabaseClient";

// Global cache for user profiles
const profileCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const useUserProfileCache = () => {
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const activeRequests = useRef(new Map());

  // Preload user data (called on hover)
  const preloadUserProfile = useCallback(async (userId) => {
    if (!userId) return;

    // Check if already cached
    const cacheKey = `profile-${userId}`;
    const cached = profileCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProfileData(prev => ({ ...prev, [userId]: cached.data }));
      return cached.data;
    }

    // Check if already loading
    if (activeRequests.current.has(userId)) {
      return activeRequests.current.get(userId);
    }

    // Start loading
    setLoading(prev => ({ ...prev, [userId]: true }));

    const loadPromise = (async () => {
      try {
        // Fetch all data in parallel
        const [userData, userRoles, userCerts, userSkills] = await Promise.all([
          // Basic user data
          supabase
            .from("User")
            .select("*")
            .eq("user_id", userId)
            .single(),
          
          // User projects with team members
          supabase
            .from("UserRole")
            .select(`
              role_name, 
              project_id, 
              Project(
                title, 
                status, 
                start_date, 
                end_date
              )
            `)
            .eq("user_id", userId),
          
          // User certifications
          supabase
            .from("UserCertifications")
            .select(`
              certification_ID, 
              completed_Date, 
              valid_Until, 
              score, 
              Certifications(
                title, 
                issuer, 
                type
              )
            `)
            .eq("user_ID", userId),
          
          // User skills
          supabase
            .from("UserSkill")
            .select("skill_ID, Skill(name)")
            .eq("user_ID", userId)
        ]);

        if (userData.error) throw userData.error;

        // Process the data
        const user = userData.data;
        const processedData = {
          userData: {
            id: user.user_id,
            fullName: `${user.name || ''} ${user.last_name || ''}`.trim(),
            firstName: user.name || '',
            lastName: user.last_name || '',
            phone: user.phone || "Not provided",
            email: user.mail || "Not provided",
            level: user.level || 1,
            joinDate: formatDate(user.enter_date) || "Not provided",
            lastProjectDate: formatDate(user.last_project_date) || "Not provided",
            about: user.about || "No information provided.",
            profilePic: user.profile_pic,
            position: user.position || "Employee",
            availability: user.availability || "Available",
            assignment: calculateAssignment(userRoles.data) || 0
          },
          projects: (userRoles.data || []).map(role => ({
            role: role.role_name,
            title: role.Project?.title || "Unknown Project",
            status: role.Project?.status || "Unknown",
            startDate: formatDate(role.Project?.start_date),
            endDate: formatDate(role.Project?.end_date),
            project_id: role.project_id
          })),
          certifications: (userCerts.data || []).map(cert => ({
            title: cert.Certifications?.title || "Unknown Certification",
            issuer: cert.Certifications?.issuer || "Unknown",
            completedDate: formatDate(cert.completed_Date),
            validUntil: formatDate(cert.valid_Until),
            score: cert.score || 0,
            type: cert.Certifications?.type || "General"
          })),
          skills: (userSkills.data || []).map(item => item.Skill?.name).filter(Boolean),
          teamMembers: {} // Will be populated separately if needed
        };

        // Fetch team members for projects
        const projectIds = userRoles.data?.map(role => role.project_id).filter(Boolean) || [];
        if (projectIds.length > 0) {
          const { data: allTeamMembers } = await supabase
            .from("UserRole")
            .select("project_id, User:user_id(user_id, name, profile_pic)")
            .in("project_id", projectIds);
            
          if (allTeamMembers) {
            const teamByProject = {};
            allTeamMembers.forEach(({ project_id, User }) => {
              if (!teamByProject[project_id]) teamByProject[project_id] = [];
              if (User) {
                teamByProject[project_id].push({
                  name: User.name || "User",
                  avatar: User.profile_pic || "",
                });
              }
            });
            processedData.teamMembers = teamByProject;
          }
        }

        // Cache the data
        profileCache.set(cacheKey, {
          data: processedData,
          timestamp: Date.now()
        });

        // Update state
        setProfileData(prev => ({ ...prev, [userId]: processedData }));
        setError(prev => ({ ...prev, [userId]: null }));

        return processedData;
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(prev => ({ ...prev, [userId]: err.message }));
        throw err;
      } finally {
        setLoading(prev => ({ ...prev, [userId]: false }));
        activeRequests.current.delete(userId);
      }
    })();

    activeRequests.current.set(userId, loadPromise);
    return loadPromise;
  }, []);

  // Get user profile (from cache or load)
  const getUserProfile = useCallback((userId) => {
    if (!userId) return null;
    
    const cacheKey = `profile-${userId}`;
    const cached = profileCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    return profileData[userId] || null;
  }, [profileData]);

  // Check if profile is loading
  const isLoading = useCallback((userId) => {
    return loading[userId] || false;
  }, [loading]);

  // Get error for a profile
  const getError = useCallback((userId) => {
    return error[userId] || null;
  }, [error]);

  // Clear cache for a specific user
  const clearCache = useCallback((userId) => {
    if (userId) {
      profileCache.delete(`profile-${userId}`);
      setProfileData(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  }, []);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    profileCache.clear();
    setProfileData({});
    setLoading({});
    setError({});
  }, []);

  return {
    preloadUserProfile,
    getUserProfile,
    isLoading,
    getError,
    clearCache,
    clearAllCache
  };
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return "Not set";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch (error) {
    return dateString;
  }
};

const calculateAssignment = (userRoles) => {
  if (!userRoles || userRoles.length === 0) return 0;
  
  const activeProjects = userRoles.filter(role => 
    role.Project?.status === "In Progress" || 
    role.Project?.status === "New"
  );
  
  return activeProjects.length > 0 ? 100 : 0;
};

export default useUserProfileCache;