/**
 * CV Parser Service
 * Handles the logic for parsing CVs using AI service with Supabase Storage
 */

// Imports necesarios
import { supabase } from "../supabase/supabaseClient";

// Base URL for API (adjust based on environment)
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 
                  (import.meta.env.MODE === 'development' ? 
                  'http://localhost:3001' :
                  'https://api-q5oxew72ca-uc.a.run.app');

/**
 * Genera un email corporativo estandarizado
 * @param {string} firstName - Primer nombre
 * @param {string} lastName - Apellido
 * @returns {string} - Email corporativo formateado
 */
const generateCorporateEmail = (firstName, lastName) => {
  if (!firstName || !lastName) return "";
  
  // Normalizar nombres
  let normalizedFirstName = firstName.trim().toLowerCase();
  let normalizedLastName = lastName.trim().toLowerCase();
  
  // Eliminar acentos y caracteres especiales
  normalizedFirstName = normalizedFirstName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
    
  normalizedLastName = normalizedLastName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
  
  return `${normalizedFirstName}.${normalizedLastName}@accenture.com`;
};

/**
 * Parse CV using the AI backend service via Supabase Storage
 * @param {File} file - The CV file to parse
 * @param {Array} availableSkills - List of available skills
 * @param {Array} availableRoles - List of available roles
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise} - Resolves with parsed CV data
 */
export const parseCV = async (file, availableSkills = [], availableRoles = [], onProgress = () => {}) => {
  if (!file) {
    throw new Error("Please upload a file first.");
  }
  
  // Check file size
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error("File size exceeds 5MB limit. Please upload a smaller file.");
  }
  
  const startTime = Date.now();
  onProgress(10);
  
  try {
    // 1. Crear nombre de archivo seguro y único para evitar colisiones
    const fileExtension = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    const fileName = `cv_${timestamp}_${Math.floor(Math.random() * 1000)}.${fileExtension}`;
    const filePath = `temp/${fileName}`;
    
    // 2. Subir archivo a Supabase Storage
    onProgress(20);
    console.log("Subiendo archivo a Supabase Storage:", filePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs') // Asegúrate que este bucket exista en tu proyecto Supabase
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error("Error al subir archivo a Supabase:", uploadError);
      throw new Error(`Error al subir archivo: ${uploadError.message}`);
    }
    
    onProgress(50);
    console.log("Archivo subido exitosamente:", uploadData.path);
    
    // 3. Enviar solo la ruta y metadatos a la API
    const requestData = {
      filePath: uploadData.path,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      availableSkills,
      availableRoles
    };
    
    console.log("Enviando solicitud de parseo:", `${API_BASE_URL}/api/cv/parse`);
    
    const response = await fetch(`${API_BASE_URL}/api/cv/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    onProgress(80);
    
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`;
      } catch (e) {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || "Failed to parse CV");
    }
    
    // Limpiar archivo temporal de Storage cuando haya terminado
    try {
      await supabase.storage.from('cvs').remove([filePath]);
      console.log("Archivo temporal eliminado de Supabase Storage");
    } catch (cleanupError) {
      console.warn("No se pudo eliminar el archivo temporal:", cleanupError);
      // No interrumpimos el flujo por esto
    }
    
    onProgress(100);
    
    const parsedData = result.data;
    const processingTime = result.meta?.processingTime || ((Date.now() - startTime) / 1000);
    
    // Generar el email corporativo basado en nombre y apellido
    const corporateEmail = generateCorporateEmail(parsedData.firstName, parsedData.lastName);
    
    return {
      parsedData: {
        firstName: parsedData.firstName || "",
        lastName: parsedData.lastName || "",
        // Usar el email corporativo generado en lugar del extraído del CV
        email: corporateEmail,
        phone: parsedData.phone || "",
        role: parsedData.role || "",
        about: parsedData.about || "Experienced professional with a background in technology and business solutions.",
        skills: parsedData.skills || [],
        // Preservar estructuras adicionales si existen
        education: parsedData.education || [],
        workExperience: parsedData.workExperience || [],
        languages: parsedData.languages || []
      },
      meta: {
        confidence: result.meta?.confidence || 0.92,
        detectedFields: result.meta?.detectedFields || Object.keys(parsedData).filter(key => 
          parsedData[key] && 
          (typeof parsedData[key] === 'string' ? parsedData[key].trim() !== '' : 
           Array.isArray(parsedData[key]) ? parsedData[key].length > 0 : true)
        ),
        processingTime,
      }
    };
    
  } catch (error) {
    console.error("Error parsing CV:", error);
    throw error;
  }
};

/**
 * Simulation function for when the API fails
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise} - Resolves with simulated CV data
 */
export const simulateParseCV = async (onProgress = () => {}) => {
  return new Promise((resolve) => {
    // Simulate progress updates
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress >= 90) {
        clearInterval(progressInterval);
        progress = 90;
      }
      onProgress(progress);
    }, 300);

    setTimeout(() => {
      // Datos simulados con nombre y apellido
      const firstName = "John";
      const lastName = "Doe";
      
      // Generar el email corporativo
      const corporateEmail = generateCorporateEmail(firstName, lastName);
      
      // Simulated data
      const mockParsedData = {
        firstName: firstName,
        lastName: lastName,
        // Usar el email corporativo generado
        email: corporateEmail,
        phone: "+1234567890",
        role: "Full Stack Developer",
        about: "Experienced developer with more than 5 years of web development experience...",
        skills: [
          {id: 2, name: "React", type: "Technical"},
          {id: 3, name: "Node.js", type: "Technical"},
          {id: 1, name: "JavaScript", type: "Technical"},
        ]
      };
      
      clearInterval(progressInterval);
      onProgress(100);
      
      resolve({
        parsedData: mockParsedData,
        meta: {
          confidence: 0.92,
          detectedFields: Object.keys(mockParsedData),
          processingTime: 2.5,
        }
      });
    }, 2000);
  });
};