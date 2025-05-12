// functions/routes/cvParser.js
import express from "express";
import multer from "multer";
import { parseCV } from "../services/cvParser.js";

const router = express.Router();

// Configuración de multer para almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB
  fileFilter: (req, file, cb) => {
    // Aceptar solo PDF y documentos Word
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no soportado. Por favor, sube un PDF o documento Word.'));
    }
  }
});

/**
 * @route POST /api/cv/parse
 * @desc Parsear CV y extraer información
 * @access Público
 */
router.post('/parse', upload.single('file'), async (req, res) => {
  console.log("Solicitud recibida en /api/cv/parse");
  
  try {
    if (!req.file) {
      console.error("No se proporcionó ningún archivo");
      return res.status(400).json({ 
        success: false, 
        error: 'No se proporcionó ningún archivo' 
      });
    }
    
    console.log(`Archivo recibido: ${req.file.originalname}, tipo: ${req.file.mimetype}`);
    
    // Obtener habilidades y roles del cuerpo de la solicitud
    const availableSkills = req.body.availableSkills ? JSON.parse(req.body.availableSkills) : [];
    const availableRoles = req.body.availableRoles ? JSON.parse(req.body.availableRoles) : [];
    
    console.log(`Datos recibidos: ${availableSkills.length} habilidades, ${availableRoles.length} roles`);
    
    // Registrar inicio del procesamiento
    const startTime = Date.now();
    
    // Procesar el CV
    const parsedData = await parseCV(req.file, availableSkills, availableRoles);
    
    // Calcular tiempo de procesamiento
    const processingTime = (Date.now() - startTime) / 1000;
    
    // Devolver resultados
    res.json({
      success: true,
      data: parsedData,
      meta: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        processingTime: processingTime
      }
    });
    
  } catch (error) {
    console.error("Error procesando CV:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al procesar el CV' 
    });
  }
});

export default router;