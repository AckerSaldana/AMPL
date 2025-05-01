/**
 * CV Parser Service
 * Handles the logic for parsing CVs using AI service
 */

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
 * Parse CV using the AI backend service
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
  
  try {
    // Create a new FormData with only the essentials
    const formData = new FormData();
    
    // Add the file with a safe name (no spaces or special characters)
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const safeFile = new File([file], safeFileName, { type: file.type });
    formData.append('file', safeFile);
    
    // Convert data to JSON strings safely
    const skillsJson = JSON.stringify(availableSkills || []);
    const rolesJson = JSON.stringify(availableRoles || []);
    
    // Add the data as strings
    formData.append('availableSkills', skillsJson);
    formData.append('availableRoles', rolesJson);
    
    console.log("Sending request to:", `${API_BASE_URL}/api/cv/parse`);
    console.log("File:", safeFileName, file.type, file.size);
    
    // Use fetch with no-cors as a last resort for CORS
    const response = await fetch(`${API_BASE_URL}/api/cv/parse`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type, the browser will do it automatically with the correct boundary
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    onProgress(100);
    
    if (!result.success) {
      throw new Error(result.error || "Failed to parse CV");
    }
    
    const parsedData = result.data;
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    
    // MODIFICACIÓN: Generar el email corporativo basado en nombre y apellido
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
      },
      meta: {
        confidence: 0.92,
        detectedFields: Object.keys(parsedData).filter(key => 
          parsedData[key] && 
          (typeof parsedData[key] === 'string' ? parsedData[key].trim() !== '' : 
           Array.isArray(parsedData[key]) ? parsedData[key].length > 0 : true)
        ),
        processingTime: result.meta?.processingTime || processingTime,
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