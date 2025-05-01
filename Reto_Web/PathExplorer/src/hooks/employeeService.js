// hooks/employeeService.js - Optimizado para Firebase + Vite
import { supabase } from "../supabase/supabaseClient";

/**
 * Crea un empleado utilizando el endpoint del servidor
 * @param {Object} userData - Datos completos del usuario a crear
 * @returns {Promise<Object>} - Información del usuario creado
 */
export const createEmployeeWithoutSessionChange = async (userData) => {
  try {
    // 1. Obtener el token de acceso de la sesión actual
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("No hay una sesión activa. Por favor, inicia sesión nuevamente.");
    }
    
    const accessToken = session.access_token;
    
    // 2. URL del endpoint - Usando ruta relativa para Firebase Hosting
    const isDevMode = import.meta.env.DEV;
    const endpoint = isDevMode 
      ? "http://localhost:3001/api/admin/create-employee" // Para desarrollo local
      : "/api/admin/create-employee";                    // Para producción con Firebase
    
    console.log(`Usando endpoint en ${isDevMode ? 'desarrollo' : 'producción'}:`, endpoint);
    
    // 3. Preparar datos para enviar al servidor
    const employeeData = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      about: userData.about,
      profilePic: userData.profilePicUrl,
      permission: userData.permission || "Employee",
      skills: userData.skills?.map(skill => ({
        id: skill.id,
        proficiency: 'Basic',
        year_Exp: 1
      })) || []
    };
    
    // 4. Logs para depuración
    console.log("Enviando solicitud al servidor...");
    console.log("Datos:", {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      // Otros campos sin incluir la contraseña por seguridad
    });
    
    // 5. Llamar al endpoint del servidor
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(employeeData)
    });
    
    // 6. Procesar la respuesta
    console.log("Respuesta del servidor recibida:", response.status);
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Error del servidor:", responseData);
      throw new Error(responseData.error || 'Error al crear el empleado');
    }
    
    // 7. Retornar los datos del usuario creado
    console.log("Respuesta exitosa del servidor:", responseData);
    return responseData;
    
  } catch (error) {
    console.error("Error en createEmployeeWithoutSessionChange:", error);
    throw error;
  }
};

/**
 * Sube una imagen de perfil al almacenamiento de Supabase
 * @param {File} file - Archivo de imagen
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<string>} - URL pública de la imagen
 */
export const uploadProfilePicture = async (file, userId = null) => {
  try {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId || 'employee'}-${Date.now()}.${fileExt}`;
    const filePath = `profile-pics/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from("profile-user")
      .upload(filePath, file);
      
    if (uploadError) throw new Error(`Error al subir foto: ${uploadError.message}`);
    
    const { data: urlData } = supabase.storage
      .from("profile-user")
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error al subir imagen de perfil:", error);
    throw error;
  }
};