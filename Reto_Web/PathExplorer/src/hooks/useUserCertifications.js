// src/hooks/useUserCertifications.js
import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import useAuth from "./useAuth";

// Backup data for when there are no certifications in the database
const mockCertifications = [
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

const useUserCertifications = () => {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchCertifications = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching certifications for user:", user.id);
        
        // Get approved certifications for this user
        const { data: userCerts, error: userCertsError } = await supabase
          .from('UserCertifications')
          .select(`
            certification_ID,
            score,
            completed_Date,
            valid_Until,
            evidence,
            status
          `)
          .eq('user_ID', user.id)
          .eq('status', 'approved');

        if (userCertsError) {
          console.error("Error fetching UserCertifications:", userCertsError);
          throw userCertsError;
        }

        console.log("Found certifications:", userCerts?.length || 0);
        
        // If no certifications, use sample data
        if (!userCerts || userCerts.length === 0) {
          console.log("No certifications found, using sample data");
          setCertifications(mockCertifications);
          setUseMockData(true);
          setLoading(false);
          return;
        }

        // Array to store processed certifications
        const processedCertifications = [];

        // Process each certification
        for (const cert of userCerts) {
          try {
            // Get certification details - NOTICE: the table name is 'Certifications' (plural)
            const { data: certDetails, error: certError } = await supabase
              .from('Certifications') // Corrected table name
              .select('title, issuer, description, url, type')
              .eq('certification_id', cert.certification_ID)
              .single();

            if (certError) {
              console.warn("Error fetching certification details:", certError);
              console.log("Certification ID:", cert.certification_ID);
              continue; // Skip this certification
            }

            // Create object with available data
            const certObj = {
              id: cert.certification_ID,
              name: certDetails?.title || "Certification",
              issuer: certDetails?.issuer || "Issuer",
              date: formatDate(cert.completed_Date),
              expiryDate: cert.valid_Until ? formatDate(cert.valid_Until) : null,
              credentialId: `CERT-${cert.certification_ID.slice(0, 6)}`,
              score: cert.score ? `${cert.score}/100` : null,
              status: cert.status,
              evidence: cert.evidence,
              description: certDetails?.description || "",
              url: certDetails?.url || "",
              type: certDetails?.type || "",
              completedDate: cert.completed_Date
            };

            processedCertifications.push(certObj);
          } catch (processError) {
            console.error("Error processing certification:", processError);
          }
        }

        // Sort by date (most recent first)
        const sortedCertifications = processedCertifications.sort((a, b) => {
          const dateA = a.completedDate ? new Date(a.completedDate) : new Date(0);
          const dateB = b.completedDate ? new Date(b.completedDate) : new Date(0);
          return dateB - dateA;
        });

        console.log("Processed certifications:", sortedCertifications);
        setCertifications(sortedCertifications);
        setUseMockData(false);
      } catch (error) {
        console.error("Error fetching certifications:", error);
        setError(error.message);
        
        // In case of error, show sample data
        console.log("Using sample data due to error");
        setCertifications(mockCertifications);
        setUseMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, [user]);

  // Helper function to format dates
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

  return { certifications, loading, error, useMockData };
};

export default useUserCertifications;