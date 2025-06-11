// src/hooks/useUserDataOptimized.js
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase/supabaseClient";
import useAuth from "./useAuth";

// Cache for storing fetched data
const dataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useUserDataOptimized = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    profile: null,
    projects: [],
    certifications: [],
    timeline: []
  });
  const [loading, setLoading] = useState({
    profile: true,
    projects: true,
    certifications: true,
    timeline: true
  });
  const [error, setError] = useState(null);
  const abortController = useRef(null);

  useEffect(() => {
    if (!user) {
      setLoading({
        profile: false,
        projects: false,
        certifications: false,
        timeline: false
      });
      return;
    }

    // Create new abort controller for this fetch cycle
    abortController.current = new AbortController();

    // Check cache first
    const cacheKey = `user-data-${user.id}`;
    const cachedData = dataCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      setData(cachedData.data);
      setLoading({
        profile: false,
        projects: false,
        certifications: false,
        timeline: false
      });
      return;
    }

    // Fetch all data in parallel
    const fetchAllData = async () => {
      try {
        const [profileData, projectsData, certificationsData, suggestedCertsData] = await Promise.all([
          fetchUserProfile(user.id),
          fetchUserProjects(user.id),
          fetchUserCertifications(user.id),
          fetchSuggestedCertifications(user.id)
        ]);

        // Generate timeline from projects and certifications
        const timelineData = generateTimeline(projectsData, certificationsData, suggestedCertsData);

        const newData = {
          profile: profileData,
          projects: projectsData,
          certifications: certificationsData,
          timeline: timelineData
        };

        // Update cache
        dataCache.set(cacheKey, {
          data: newData,
          timestamp: Date.now()
        });

        // Only update state if component is still mounted
        if (!abortController.current.signal.aborted) {
          setData(newData);
          setLoading({
            profile: false,
            projects: false,
            certifications: false,
            timeline: false
          });
        }
      } catch (err) {
        if (!abortController.current.signal.aborted) {
          console.error("Error fetching user data:", err);
          setError(err.message);
          setLoading({
            profile: false,
            projects: false,
            certifications: false,
            timeline: false
          });
        }
      }
    };

    fetchAllData();

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [user]);

  // Fetch user profile with optimized query
  const fetchUserProfile = async (userId) => {
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select(`
        name, 
        last_name, 
        permission, 
        profile_pic, 
        about,
        UserSkill!inner (
          skill_ID,
          proficiency,
          Skill!inner (
            name
          )
        )
      `)
      .eq('user_id', userId)
      .single();

    if (userError) throw userError;

    // Get counts in parallel
    const [projectsCount, certificationsCount] = await Promise.all([
      supabase
        .from('UserRole')
        .select('project_id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('UserCertifications')
        .select('certification_ID', { count: 'exact', head: true })
        .eq('user_ID', userId)
    ]);

    // Process skills
    const skills = userData.UserSkill || [];
    const skillNames = skills
      .sort((a, b) => {
        const proficiencyOrder = { 'Advanced': 1, 'Intermediate': 2, 'Basic': 3 };
        return (proficiencyOrder[a.proficiency] || 99) - (proficiencyOrder[b.proficiency] || 99);
      })
      .map(skill => skill.Skill?.name)
      .filter(Boolean)
      .slice(0, 8);

    return {
      name: `${userData.name} ${userData.last_name}`,
      avatar: userData.profile_pic || "",
      currentRole: userData.permission || "Employee",
      projectsCount: projectsCount.count || 0,
      certificationsCount: certificationsCount.count || 0,
      primarySkills: skillNames,
      about: userData.about || "Experienced professional"
    };
  };

  // Fetch user projects with client info
  const fetchUserProjects = async (userId) => {
    const { data: userRoles, error } = await supabase
      .from('UserRole')
      .select(`
        role_name,
        project_id,
        feedback_notes,
        Project!inner (
          title,
          description,
          start_date,
          end_date,
          status,
          client_id,
          Client (
            name
          )
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return userRoles.map(role => ({
      id: role.project_id,
      name: role.Project.title,
      role: role.role_name,
      company: role.Project.Client?.name || "Internal Project",
      date: formatDateRange(role.Project.start_date, role.Project.end_date),
      skills: [],
      description: role.Project.description || "No description available",
      status: role.Project.status,
      feedback: role.feedback_notes,
      startDate: role.Project.start_date,
      endDate: role.Project.end_date,
    })).sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
      const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
      return dateB - dateA;
    });
  };

  // Fetch user certifications
  const fetchUserCertifications = async (userId) => {
    const { data: userCerts, error } = await supabase
      .from('UserCertifications')
      .select(`
        certification_ID,
        score,
        completed_Date,
        valid_Until,
        evidence,
        status,
        Certifications!inner (
          title,
          issuer,
          description,
          url,
          type
        )
      `)
      .eq('user_ID', userId)
      .eq('status', 'approved');

    if (error) throw error;

    if (!userCerts || userCerts.length === 0) {
      // Return mock data if no certifications
      return getMockCertifications();
    }

    return userCerts.map(cert => ({
      id: cert.certification_ID,
      name: cert.Certifications?.title || "Certification",
      issuer: cert.Certifications?.issuer || "Issuer",
      date: formatDate(cert.completed_Date),
      expiryDate: cert.valid_Until ? formatDate(cert.valid_Until) : null,
      credentialId: `CERT-${cert.certification_ID.slice(0, 6)}`,
      score: cert.score ? `${cert.score}/100` : null,
      status: cert.status,
      evidence: cert.evidence,
      description: cert.Certifications?.description || "",
      url: cert.Certifications?.url || "",
      type: cert.Certifications?.type || "",
      completedDate: cert.completed_Date
    })).sort((a, b) => {
      const dateA = a.completedDate ? new Date(a.completedDate) : new Date(0);
      const dateB = b.completedDate ? new Date(b.completedDate) : new Date(0);
      return dateB - dateA;
    });
  };

  const fetchSuggestedCertifications = async (userId) => {
    const { data: suggestions, error } = await supabase
      .from("AISuggested")
      .select("certification_id, Certifications(title, issuer, type)")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching AISuggested:", error.message);
      return [];
    }

    return suggestions.map(cert => ({
      id: cert.certification_id,
      name: cert.Certifications?.title || "Certification",
      issuer: cert.Certifications?.issuer || "Unknown",
      type: "certification",
      displayDate: "Recently added"
    }));
  };


  // Generate timeline from projects and certifications
  const generateTimeline = (projects, certifications, suggestedCerts = []) => {
    const projectItems = projects.map(project => ({
      ...project,
      type: "project",
      displayDate: project.date
    }));

    const certificationItems = certifications
      .filter(cert => cert.status === "approved")
      .map(cert => ({
        ...cert,
        type: "certification",
        displayDate: cert.date
      }));

    return [...projectItems, ...certificationItems, ...suggestedCerts].sort((a, b) => {
      const getStartDate = (item) => {
        if (item.type === "project" && item.startDate) return new Date(item.startDate);
        if (item.type === "certification" && item.completedDate) return new Date(item.completedDate);
        return new Date(0);
      };

      return getStartDate(b) - getStartDate(a);
    });
  };

  // Helper functions
  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return "No date specified";

    const start = new Date(startDate);
    const formattedStart = start.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });

    if (!endDate) {
      return `${formattedStart} - Present`;
    }

    const end = new Date(endDate);
    const formattedEnd = end.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });

    return `${formattedStart} - ${formattedEnd}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  const getMockCertifications = () => [
    {
      id: "mock-1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "Feb 2023",
      expiryDate: "Feb 2026",
      credentialId: "AWS-123456",
      score: "900/1000",
      status: "approved",
      completedDate: "2023-02-15"
    },
    {
      id: "mock-2",
      name: "Professional Scrum Master I",
      issuer: "Scrum.org",
      date: "May 2023",
      credentialId: "PSM-789012",
      score: "95/100",
      status: "approved",
      completedDate: "2023-05-10"
    },
    {
      id: "mock-3",
      name: "Google Professional Cloud Developer",
      issuer: "Google Cloud",
      date: "Oct 2023",
      expiryDate: "Oct 2025",
      credentialId: "GCP-345678",
      score: "850/1000",
      status: "approved",
      completedDate: "2023-10-05"
    }
  ];

  // Method to invalidate cache
  const invalidateCache = () => {
    if (user) {
      dataCache.delete(`user-data-${user.id}`);
    }
  };

  return {
    userProfile: data.profile,
    projects: data.projects,
    certifications: data.certifications,
    timelineItems: data.timeline,
    loading: loading.profile || loading.projects || loading.certifications,
    profileLoading: loading.profile,
    projectsLoading: loading.projects,
    certificationsLoading: loading.certifications,
    timelineLoading: loading.timeline,
    error,
    invalidateCache,
    useMockData: data.certifications.some(cert => cert.id.startsWith('mock-'))
  };
};

export default useUserDataOptimized;