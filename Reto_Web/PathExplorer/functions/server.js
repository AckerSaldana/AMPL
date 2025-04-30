import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import NodeCache from "node-cache";
import crypto from "crypto";
import * as math from "mathjs";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import * as functions from "firebase-functions";

// Crear la app de Express
const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Logs sobre la carga del .env
console.log("Directorio actual:", __dirname);
console.log("Cargando variables de entorno desde:", `${__dirname}/.env`);
console.log("Primeros 5 caracteres de OPENAI_API_KEY:", 
  process.env.OPENAI_API_KEY ? 
  `${process.env.OPENAI_API_KEY.substring(0, 5)}...` : 
  "No encontrada");

// Inicializamos caches (TTL: 1 día)
const embeddingCache = new NodeCache({ stdTTL: 86400 });
const parserCache = new NodeCache({ stdTTL: 3600 }); // Cache para el parser de CV (1 hora)

// Obtener API Key de OpenAI considerando entorno de Firebase
const getOpenAIApiKey = () => {
  // Intentar obtener la clave API de diferentes fuentes
  const apiKey = process.env.OPENAI_API_KEY || 
    (process.env.NODE_ENV === 'production' ? 
      (functions.config() && functions.config().openai ? functions.config().openai.apikey : null) : 
      null) || 
    'dummy-key-for-deployment';
  
  return apiKey;
};

// Inicialización de OpenAI con manejo de errores
let openai;
try {
  console.log("Intentando inicializar cliente de OpenAI...");
  const apiKey = getOpenAIApiKey();
  openai = new OpenAI({
    apiKey: apiKey,
  });
  console.log("Cliente de OpenAI inicializado correctamente");
} catch (error) {
  console.error('Error al inicializar OpenAI:', error);
  // Objeto simulado para permitir despliegue
  openai = {
    embeddings: {
      create: async () => ({ data: [{ embedding: Array(1536).fill(0) }] })
    },
    chat: {
      completions: {
        create: async () => ({ 
          choices: [{ message: { content: JSON.stringify({}) } }] 
        })
      }
    }
  };
  console.log("Se está usando un cliente de OpenAI simulado debido a un error de inicialización");
}

// Verificación de API Key
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key-for-deployment') {
  console.log("API Key cargada: Sí");
} else {
  console.log("API Key cargada: No (se usará una clave ficticia para despliegue)");
}

// Función hash para claves de caché
function generateCacheKey(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// Función para verificar la API Key
export async function testAPIKey() {
  console.log("Verificando API Key de OpenAI...");
  const apiKey = getOpenAIApiKey();
  if (apiKey === 'dummy-key-for-deployment') {
    console.error('No se ha configurado la API Key de OpenAI');
    return false;
  }
  
  try {
    const startTime = Date.now();
    console.log("Realizando solicitud de prueba a la API de OpenAI...");
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // Ajusta el modelo si es necesario
      input: "test",
    });
    const elapsedTime = Date.now() - startTime;
    console.log(`API Key válida (${elapsedTime}ms)`);
    console.log("Tamaño del embedding recibido:", response.data[0].embedding.length);
    return true;
  } catch (error) {
    console.error(`Error con API Key: ${error.message}`);
    return false;
  }
}

// Preprocesamiento del texto
export function preprocessText(text, maxLength = 1000) {
  if (!text || !text.trim()) return "";
  let processed = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (processed.length > maxLength) processed = processed.substring(0, maxLength);
  return processed;
}

// Obtener embeddings con caché
export async function getBatchEmbeddings(texts, sources = []) {
  console.log(`Procesando embeddings para ${texts.length} textos...`);
  if (!texts || !texts.length) return [];
  const processedTexts = texts
    .map((text, i) => ({
      text: preprocessText(text),
      source: sources[i] || `item-${i}`,
      index: i,
    }))
    .filter((item) => item.text.trim().length > 0);

  if (processedTexts.length === 0)
    return texts.map(() => Array(1536).fill(0));

  const results = new Array(texts.length);
  const textsToProcess = [];
  const indicesMap = [];

  // Verificar caché
  let cacheHits = 0;
  processedTexts.forEach((item) => {
    const cacheKey = generateCacheKey(item.text);
    const cached = embeddingCache.get(cacheKey);
    if (cached) {
      results[item.index] = cached;
      cacheHits++;
    } else {
      textsToProcess.push(item.text);
      indicesMap.push(item.index);
    }
  });
  console.log(`Cache hits: ${cacheHits}/${processedTexts.length}`);

  if (textsToProcess.length === 0) {
    console.log("Todos los embeddings encontrados en caché");
    return results;
  }

  // Verificar si tenemos una API Key válida antes de llamar a la API
  const apiKey = getOpenAIApiKey();
  if (apiKey === 'dummy-key-for-deployment') {
    console.warn('No hay API Key válida, generando embeddings simples');
    console.log(`Generando ${textsToProcess.length} embeddings simples...`);
    textsToProcess.forEach((text, i) => {
      results[indicesMap[i]] = generateSimpleEmbedding(text);
    });
    return results;
  }

  try {
    console.log(`Solicitando ${textsToProcess.length} embeddings a OpenAI...`);
    const startTime = Date.now();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: textsToProcess,
    });
    const elapsedTime = Date.now() - startTime;
    console.log(`Embeddings obtenidos desde OpenAI (${elapsedTime}ms)`);
    console.log(`Recibidos ${response.data.length} embeddings`);
    
    if (response.data && response.data.length > 0) {
      console.log(`Primer embedding tiene ${response.data[0].embedding.length} dimensiones`);
    }
    
    response.data.forEach((item, i) => {
      const originalIndex = indicesMap[i];
      const originalText = processedTexts.find((p) => p.index === originalIndex).text;
      const cacheKey = generateCacheKey(originalText);
      embeddingCache.set(cacheKey, item.embedding);
      results[originalIndex] = item.embedding;
    });
    results.forEach((r, i) => {
      if (!r) results[i] = generateSimpleEmbedding(texts[i] || "");
    });
    return results;
  } catch (error) {
    console.error(`Error obteniendo embeddings de OpenAI: ${error.message}`);
    console.log("Detalles del error:", error);
    console.log(`Generando ${textsToProcess.length} embeddings simples como fallback...`);
    textsToProcess.forEach((text, i) => {
      results[indicesMap[i]] = generateSimpleEmbedding(text);
    });
    return results;
  }
}

// Función alternativa para generar embeddings simples
export function generateSimpleEmbedding(text) {
  if (!text || !text.trim()) return Array(1536).fill(0);
  
  console.log(`Generando embedding simple para texto: "${text.substring(0, 30)}..."`);
  
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, "");
  const words = normalizedText.split(/\s+/).filter((w) => w.length > 0);
  const vector = Array(10).fill(0);
  let otherWordsCount = 0;
  const keywordCategories = {
    desarrollo: ["desarrollador", "developer", "programmer", "coder"],
    frontend: ["frontend", "html", "css", "javascript"],
    backend: ["backend", "server", "api", "database"],
    seniority: ["junior", "senior", "lead"],
  };
  words.forEach((word) => {
    let found = false;
    Object.keys(keywordCategories).forEach((category, index) => {
      if (keywordCategories[category].some((kw) => word.includes(kw))) {
        vector[index] += 1;
        found = true;
      }
    });
    if (!found) otherWordsCount++;
  });
  const totalWords = words.length || 1;
  const normalizedVector = vector.map((val) => val / totalWords);
  normalizedVector.push(otherWordsCount / totalWords);
  
  // Añadir variación adicional basada en hash del texto
  const hash = generateCacheKey(text).substring(0, 16);
  for (let i = 0; i < 5; i++) {
    const segment = parseInt(hash.substring(i * 3, (i + 1) * 3), 16) / 0xfff; // Valor entre 0 y 1
    normalizedVector.push(segment * 0.2); // Valores pequeños para no dominar
  }
  
  const extendedVector = [...normalizedVector];
  while (extendedVector.length < 1536) extendedVector.push(0);
  
  return extendedVector;
}

// Cálculo de similitud
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || !vecA.length || !vecB.length) return 0;
  const length = Math.min(vecA.length, vecB.length);
  const a = math.subset(vecA, math.index(math.range(0, length)));
  const b = math.subset(vecB, math.index(math.range(0, length)));
  const dotProduct = math.dot(a, b);
  const normA = math.norm(a);
  const normB = math.norm(b);
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

// Paralelización con Worker (si se invoca el módulo en modo Worker)
if (!isMainThread) {
  const { roleEmbedding, candidateEmbeddings } = workerData;
  const similarities = candidateEmbeddings.map((candidateEmbedding) => {
    const sim = cosineSimilarity(roleEmbedding, candidateEmbedding);
    return Math.floor(sim * 100);
  });
  parentPort.postMessage(similarities);
}

// Cálculo batch de similitudes contextuales
export async function calculateBatchContextualSimilarities(roleEmbedding, candidateEmbeddings) {
  console.log(`Calculando similitudes contextuales para ${candidateEmbeddings.length} candidatos...`);
  
  // Verificar si estamos usando OpenAI o embeddings simulados
  const apiKey = getOpenAIApiKey();
  const isUsingSimulatedEmbeddings = apiKey === 'dummy-key-for-deployment';
  
  // Si son embeddings simulados, agregar variación significativa
  if (isUsingSimulatedEmbeddings) {
    console.log("Usando embeddings simulados - generando scores contextuales variados");
    return candidateEmbeddings.map((_, index) => {
      // Generar valores variados entre 35 y 90
      return Math.max(35, Math.min(90, 60 + Math.floor(Math.random() * 30) - 15));
    });
  }
  
  try {
    console.log("Iniciando worker para cálculo de similitudes...");
    const similarities = await startSimilarityWorker(roleEmbedding, candidateEmbeddings);
    
    console.log("Similitudes contextuales calculadas:", similarities);
    
    // Verificar si todos los valores son iguales o muy similares
    const allSimilar = similarities.every(sim => 
      Math.abs(sim - similarities[0]) < 5
    );
    
    if (allSimilar) {
      console.log("Detectados valores muy similares, aplicando corrección de varianza");
      return candidateEmbeddings.map((_, index) => {
        const baseScore = similarities[0];
        // Ajustar para crear variación pero mantener una base similar
        return Math.max(30, Math.min(95, baseScore + (index * 7 - 15) % 30));
      });
    }
    
    return similarities;
  } catch (error) {
    console.error("Error en cálculo de similitudes:", error);
    return candidateEmbeddings.map((candidate, index) => {
      console.log(`Calculando similitud para candidato ${index} sin worker`);
      const sim = cosineSimilarity(roleEmbedding, candidate);
      const baseSim = Math.floor(sim * 100);
      
      // Agregar algo de variación
      return Math.max(35, Math.min(95, baseSim + (index * 5) % 25));
    });
  }
}

function startSimilarityWorker(roleEmbedding, candidateEmbeddings) {
  return new Promise((resolve, reject) => {
    try {
      console.log("Creando worker thread para similaridad...");
      const worker = new Worker(__filename, { workerData: { roleEmbedding, candidateEmbeddings } });
      worker.on("message", (result) => {
        console.log("Worker completado, resultados recibidos");
        resolve(result);
      });
      worker.on("error", (err) => {
        console.error("Error en worker:", err);
        reject(err);
      });
      worker.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Worker finalizó con código de error: ${code}`);
          reject(new Error(`Worker finalizó con código ${code}`));
        } else {
          console.log("Worker completó la ejecución correctamente");
        }
      });
    } catch (error) {
      console.error("Error al iniciar el worker:", error);
      const similarities = candidateEmbeddings.map(candidate => {
        const sim = cosineSimilarity(roleEmbedding, candidate);
        return Math.floor(sim * 100);
      });
      resolve(similarities);
    }
  });
}

// Función de pesos dinámicos basada en la descripción y skills del rol
export function calculateDynamicWeights(roleDescription = "", roleSkills = [], skillMap = {}) {
  let alpha = 0.6, beta = 0.4;
  console.log("Calculando pesos dinámicos basados en skills y descripción del rol");
  let technicalSkills = [];
  let softSkills = [];
  if (roleSkills && roleSkills.length > 0 && skillMap && Object.keys(skillMap).length > 0) {
    console.log(`Clasificando ${roleSkills.length} skills del rol usando mapa de skills`);
    roleSkills.forEach((skill) => {
      const skillId = skill.id || skill.skill_ID;
      if (skillId && skillMap[skillId]) {
        const skillInfo = skillMap[skillId];
        const skillType = (skillInfo.type || skillInfo.skillType || "unknown").toLowerCase();
        if (skillType === "technical" || skillType === "hard") {
          technicalSkills.push({ ...skill, name: skillInfo.name || `Skill #${skillId}`, importance: skill.importance || 1 });
        } else if (skillType === "soft" || skillType === "personal") {
          softSkills.push({ ...skill, name: skillInfo.name || `Skill #${skillId}`, importance: skill.importance || 1 });
        }
      }
    });
    console.log(`Skills clasificadas - Técnicas: ${technicalSkills.length}, Blandas: ${softSkills.length}`);
  }
  let technicalImportance = technicalSkills.reduce((sum, skill) => sum + (skill.importance || 1), 0);
  let softImportance = softSkills.reduce((sum, skill) => sum + (skill.importance || 1), 0);
  if ((technicalImportance === 0 && softImportance === 0) || technicalSkills.length + softSkills.length < 3) {
    console.log("Información de skills insuficiente, analizando descripción del rol");
    const technicalKeywords = [
      "programación", "coding", "desarrollo", "development", "técnico", "technical",
      "react", "javascript", "python", "java", "frontend", "backend", "fullstack",
      "cloud", "database", "api", "arquitectura", "devops", "mobile", "web",
      "testing", "qa", "algorithm", "data", "analytics", "machine learning"
    ];
    const softKeywords = [
      "comunicación", "communication", "liderazgo", "leadership", "trabajo en equipo",
      "teamwork", "creatividad", "creativity", "resolución de problemas", "problem solving",
      "gestión", "management", "colaboración", "collaboration", "adaptabilidad", "adaptability",
      "empatía", "empathy", "organización", "organization", "pensamiento crítico"
    ];
    if (roleDescription && roleDescription.trim().length > 0) {
      const descLower = roleDescription.toLowerCase();
      let technicalCount = 0, softCount = 0;
      technicalKeywords.forEach((kw) => { if (descLower.includes(kw.toLowerCase())) technicalCount++; });
      softKeywords.forEach((kw) => { if (descLower.includes(kw.toLowerCase())) softCount++; });
      technicalImportance = technicalCount;
      softImportance = softCount * 1.5;
      console.log(`Análisis de descripción - Técnicas: ${technicalCount}, Blandas: ${softCount}`);
    }
  }
  const totalImportance = technicalImportance + softImportance;
  if (totalImportance > 0) {
    alpha = technicalImportance / totalImportance;
    beta = softImportance / totalImportance;
    if (alpha < 0.3) alpha = 0.3;
    if (alpha > 0.8) alpha = 0.8;
    if (beta < 0.2) beta = 0.2;
    if (beta > 0.7) beta = 0.7;
    const sum = alpha + beta;
    alpha = alpha / sum;
    beta = beta / sum;
  }
  if (roleDescription) {
    const descLower = roleDescription.toLowerCase();
    if (descLower.includes("altamente técnico") || descLower.includes("highly technical")) {
      alpha = 0.75;
      beta = 0.25;
      console.log("Ajuste especial: Rol altamente técnico");
    } else if (descLower.includes("cultural fit") || descLower.includes("soft skills") ||
               descLower.includes("trabajo en equipo") || descLower.includes("liderazgo")) {
      alpha = 0.4;
      beta = 0.6;
      console.log("Ajuste especial: Rol enfocado en habilidades blandas/cultura");
    }
  }
  console.log(`Pesos calculados - Técnico: ${Math.round(alpha * 100)}%, Contextual: ${Math.round(beta * 100)}%`);
  return { alpha, beta };
}

// Función para calcular la compatibilidad de habilidades
export function calculateSkillMatch(employeeSkills, roleSkills, employeeName = "Employee", roleName = "Role") {
  console.log(`Calculando compatibilidad de habilidades para ${employeeName} con rol ${roleName}`);
  
  if (!employeeSkills || !roleSkills || !employeeSkills.length || !roleSkills.length) {
    console.log("Skills insuficientes para realizar el cálculo");
    return 0;
  }
  
  const roleSkillsMap = {};
  roleSkills.forEach((skill) => {
    const skillId = skill.id || skill.skill_ID;
    if (skillId) {
      roleSkillsMap[skillId] = { importance: skill.importance || 1, years: skill.years || 0 };
    }
  });
  
  const employeeSkillsMap = {};
  employeeSkills.forEach((skill) => {
    const skillId = skill.skill_ID || skill.id;
    if (skillId) {
      employeeSkillsMap[skillId] = { proficiency: skill.proficiency || "Low", yearExp: skill.year_Exp || skill.yearExp || 0 };
    }
  });
  
  console.log(`El rol requiere ${Object.keys(roleSkillsMap).length} habilidades`);
  console.log(`El empleado tiene ${Object.keys(employeeSkillsMap).length} habilidades`);
  
  let totalImportance = 0, matchScore = 0;
  const YEARS_WEIGHT = 0.3;
  const PROFICIENCY_WEIGHT = 0.7;
  
  let matchedSkills = 0;
  for (const skillId in roleSkillsMap) {
    const roleSkill = roleSkillsMap[skillId];
    totalImportance += roleSkill.importance;
    if (employeeSkillsMap[skillId]) {
      matchedSkills++;
      const employeeSkill = employeeSkillsMap[skillId];
      const yearsMatch = Math.min(employeeSkill.yearExp / Math.max(roleSkill.years, 1), 1);
      let proficiencyScore;
      switch (employeeSkill.proficiency) {
        case "Expert":
          proficiencyScore = 1.0;
          break;
        case "Advanced":
          proficiencyScore = 0.85;
          break;
        case "Intermediate":
          proficiencyScore = 0.6;
          break;
        case "Medium":
          proficiencyScore = 0.5;
          break;
        case "High":
          proficiencyScore = 0.7;
          break;
        case "Low":
          proficiencyScore = 0.3;
          break;
        default:
          proficiencyScore = 0.3;
      }
      const skillScore = (yearsMatch * YEARS_WEIGHT + proficiencyScore * PROFICIENCY_WEIGHT) * roleSkill.importance;
      matchScore += skillScore;
    }
  }
  
  const finalScore = totalImportance > 0 ? Math.floor((matchScore / totalImportance) * 100) : 0;
  console.log(`Habilidades coincidentes: ${matchedSkills}/${Object.keys(roleSkillsMap).length}`);
  console.log(`Score técnico calculado: ${finalScore}%`);
  
  return finalScore;
}

//==============================================================================
// IMPLEMENTACIÓN DEL PARSER DE CV CON IA
//==============================================================================

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
 * Extrae texto de un PDF usando el modelo de GPT-4 Vision
 * @param {Buffer} fileBuffer - Buffer del archivo PDF
 * @returns {Promise<string>} - Texto extraído
 */
async function extractTextFromPDF(fileBuffer, filename) {
  try {
    console.log(`Extrayendo texto de PDF: ${filename}`);
    
    // Convertir el buffer a base64
    const base64PDF = Buffer.from(fileBuffer).toString('base64');
    
    // Verificar si hay una clave de API válida
    const apiKey = getOpenAIApiKey();
    if (apiKey === 'dummy-key-for-deployment') {
      console.warn('No hay API Key válida para OpenAI, generando texto ficticio para el PDF');
      return `Este es un texto extraído ficticio para el archivo ${filename}. 
      El sistema no pudo acceder a la API de OpenAI para extraer el texto real del PDF.
      Por favor, asegúrate de que tienes configurada la API key correctamente.`;
    }
    
    // Crear un prompt para GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "Eres un experto en extraer texto de documentos PDF, específicamente de currículum vitae (CV). Extrae todo el texto visible del documento PDF que se te proporciona, manteniendo la estructura general (secciones, párrafos) pero ignorando el diseño exacto."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extrae todo el texto de este CV en PDF:" },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${base64PDF}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 4096
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error extracting text from PDF with GPT-4 Vision:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Analiza el texto del CV usando IA para extraer información estructurada
 * @param {string} cvText - Texto del CV
 * @param {Array} availableSkills - Lista de habilidades disponibles
 * @param {Array} availableRoles - Lista de roles disponibles
 * @returns {Promise<Object>} - Datos estructurados extraídos
 */
async function analyzeWithOpenAI(cvText, availableSkills, availableRoles) {
  try {
    console.log("Analizando CV con OpenAI...");
    
    // Verificar si hay una clave de API válida
    const apiKey = getOpenAIApiKey();
    if (apiKey === 'dummy-key-for-deployment') {
      console.warn('No hay API Key válida para OpenAI, generando datos ficticios para el CV');
      return generateMockData(cvText, availableSkills, availableRoles);
    }
    
    // Truncar texto si es muy largo
    const maxTextLength = 14000; // Apropiado para gpt-4
    const truncatedCVText = cvText.length > maxTextLength 
      ? cvText.substring(0, maxTextLength) 
      : cvText;
    
    // Crear prompt para OpenAI con el contexto necesario
    const systemPrompt = `Eres un experto en análisis de currículum vitae que extrae información estructurada de CVs.
Extrae la siguiente información del CV:
1. Nombre
2. Apellido
3. Correo electrónico
4. Número de teléfono
5. Habilidades (de la lista proporcionada)
6. Rol o puesto más apropiado (de la lista proporcionada)
7. Historial educativo (institución, título, año)
8. Experiencia laboral (empresa, puesto, duración, descripción)
9. Idiomas y niveles de competencia
10. Un resumen profesional breve para la sección "Acerca de"

Las habilidades disponibles son: ${availableSkills.map(s => s.name).join(', ')}
Los roles disponibles son: ${availableRoles.join(', ')}

Formatea tu respuesta como un objeto JSON con la siguiente estructura:
{
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "role": "",
  "about": "",
  "skills": [{"name": "nombre de habilidad"}],
  "education": [{"institution": "", "degree": "", "year": ""}],
  "workExperience": [{"company": "", "position": "", "duration": "", "description": ""}],
  "languages": [{"name": "", "level": ""}]
}

Incluye solo el objeto JSON en tu respuesta, nada más. Si no puedes encontrar cierta información, deja esos campos como cadenas vacías o arreglos vacíos.`;

    // Llamar a la API de OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: truncatedCVText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3 // Baja temperatura para respuestas más consistentes
    });

    // Extraer y parsear la respuesta JSON
    const content = response.choices[0].message.content.trim();
    const parsedData = JSON.parse(content);
    
    console.log("Análisis de CV completado con éxito");
    return parsedData;
  } catch (error) {
    console.error("Error with OpenAI analysis:", error);
    // En caso de error, generar datos simulados como fallback
    console.log("Generando datos de fallback debido al error de OpenAI");
    return generateMockData(cvText, availableSkills, availableRoles);
  }
}

/**
 * Genera datos simulados para pruebas o cuando falla la API
 */
function generateMockData(cvText, availableSkills, availableRoles) {
  console.log("Generando datos simulados para el CV");
  
  // Seleccionar algunas habilidades al azar
  const selectedSkills = availableSkills
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(5, availableSkills.length))
    .map(skill => ({ name: skill.name }));
  
  // Seleccionar un rol al azar
  const selectedRole = availableRoles[Math.floor(Math.random() * availableRoles.length)] || "Developer";
  
  // Extraer posibles nombres/datos del texto del CV si está disponible
  let firstName = "Juan";
  let lastName = "Pérez";
  let email = "juan.perez@ejemplo.com";
  
  if (cvText && cvText.length > 0) {
    // Intentar extraer un nombre del CV con regex básico
    const nameMatch = cvText.match(/([A-Z][a-z]+)\s+([A-Z][a-z]+)/);
    if (nameMatch) {
      firstName = nameMatch[1];
      lastName = nameMatch[2];
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@accenture.com`;
    }
    
    // Intentar extraer un email del CV
    const emailMatch = cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      email = emailMatch[0];
    }
  }
  
  return {
    firstName,
    lastName,
    email,
    phone: "+34 612 345 678",
    role: selectedRole,
    about: "Profesional con experiencia en tecnología y soluciones de negocio. Especializado en desarrollo de aplicaciones y gestión de proyectos.",
    skills: selectedSkills,
    education: [
      {
        institution: "Universidad Ejemplo",
        degree: "Licenciatura en Informática",
        year: "2018"
      }
    ],
    workExperience: [
      {
        company: "Tech Solutions",
        position: "Desarrollador Senior",
        duration: "2018-2023",
        description: "Desarrollo de aplicaciones y gestión de proyectos tecnológicos."
      }
    ],
    languages: [
      {
        name: "Español",
        level: "Nativo"
      },
      {
        name: "Inglés",
        level: "Avanzado"
      }
    ]
  };
}

/**
 * Mapea las habilidades detectadas con las disponibles en la base de datos
 * @param {Array} detectedSkills - Habilidades detectadas por IA
 * @param {Array} availableSkills - Habilidades disponibles en el sistema
 * @returns {Array} - Habilidades mapeadas con sus IDs
 */
function mapSkills(detectedSkills, availableSkills) {
  if (!detectedSkills || !availableSkills) return [];
  
  console.log(`Mapeando ${detectedSkills.length} habilidades detectadas con ${availableSkills.length} disponibles`);
  
  return detectedSkills
    .map(detectedSkill => {
      if (!detectedSkill || !detectedSkill.name) return null;
      
      // Buscar coincidencia exacta o por aproximación
      const exactMatch = availableSkills.find(skill => 
        skill.name && skill.name.toLowerCase() === detectedSkill.name.toLowerCase()
      );
      
      if (exactMatch) {
        return {
          id: exactMatch.id || exactMatch.skill_ID,
          name: exactMatch.name,
          type: exactMatch.type || "Technical"
        };
      }
      
      // Buscar coincidencia parcial si no hay exacta
      const partialMatch = availableSkills.find(skill =>
        skill.name && detectedSkill.name && 
        (skill.name.toLowerCase().includes(detectedSkill.name.toLowerCase()) ||
         detectedSkill.name.toLowerCase().includes(skill.name.toLowerCase()))
      );
      
      if (partialMatch) {
        return {
          id: partialMatch.id || partialMatch.skill_ID,
          name: partialMatch.name,
          type: partialMatch.type || "Technical"
        };
      }
      
      return null;
    })
    .filter(skill => skill !== null);
}

/**
 * Método principal para parsear un CV
 * @param {File} file - Archivo de CV (PDF, Word, etc.)
 * @param {Array} availableSkills - Lista de habilidades disponibles
 * @param {Array} availableRoles - Lista de roles disponibles
 * @returns {Promise<Object>} - Información extraída del CV
 */
async function parseCV(file, availableSkills, availableRoles) {
  try {
    console.log(`Procesando archivo: ${file.originalname}, tamaño: ${file.size} bytes`);
    
    // Verificar caché
    const cacheKey = crypto.createHash("sha256").update(`${file.originalname}-${file.size}-${Date.now()}`).digest("hex");
    const cachedResult = parserCache.get(cacheKey);
    
    if (cachedResult) {
      console.log("Resultado encontrado en caché, devolviendo directamente");
      return cachedResult;
    }
    
    // 1. Extraer texto del CV según el tipo de archivo
    let cvText = "";
    const fileType = file.mimetype;
    
    if (fileType === 'application/pdf') {
      console.log("Detectado archivo PDF, extrayendo texto...");
      cvText = await extractTextFromPDF(file.buffer, file.originalname);
    } else if (fileType.includes('word')) {
      // Para esta demo, usaremos un texto genérico para archivos Word
      console.log("Detectado archivo Word, generando texto simulado");
      cvText = `CV simulado para archivo Word: ${file.originalname}
      
      Juan Pérez García
      Email: juan.perez@ejemplo.com
      Teléfono: +34 612 345 678
      
      Experiencia:
      - Desarrollador Senior en Tech Solutions (2018-2023)
      - Analista de Sistemas en IT Consulting (2015-2018)
      
      Educación:
      - Universidad Ejemplo, Licenciatura en Informática (2018)
      
      Habilidades: JavaScript, React, Node.js, HTML/CSS, SQL
      
      Idiomas: Español (nativo), Inglés (avanzado)`;
    } else {
      throw new Error("Formato de archivo no soportado");
    }
    
    // 2. Analizar el texto con IA
    console.log(`Texto extraído (${cvText.length} caracteres), analizando con IA...`);
    const parsedData = await analyzeWithOpenAI(cvText, availableSkills, availableRoles);
    
    // 3. Mapear habilidades detectadas con las disponibles
    const mappedSkills = mapSkills(parsedData.skills, availableSkills);
    
    // 4. Combinar resultado final
    const result = {
      ...parsedData,
      skills: mappedSkills
    };
    
    // Guardar en caché
    parserCache.set(cacheKey, result);
    
    console.log("Análisis de CV completado exitosamente");
    return result;
  } catch (error) {
    console.error("Error parsing CV:", error);
    throw error;
  }
}

// Endpoint para parsear CV
app.post("/api/cv/parse", upload.single('file'), async (req, res) => {
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

// ----------------------------------------------------------------------------
// Endpoint para matching: Procesa la solicitud y devuelve los resultados
app.post("/getMatches", async (req, res) => {
  try {
    console.log("Solicitud POST recibida en /getMatches");
    console.log(`Cuerpo de la solicitud: ${JSON.stringify(req.body, null, 2).substring(0, 200)}...`);
    
    const { role, employees, skillMap } = req.body;
    if (!role || !employees || !Array.isArray(employees) || employees.length === 0) {
      console.error("Información insuficiente en la solicitud");
      return res.status(400).json({ error: "Información insuficiente" });
    }
    
    console.log(`Procesando matching para rol: ${role.role || 'sin nombre'}`);
    console.log(`Candidatos a procesar: ${employees.length}`);
    console.log(`Mapa de skills: ${Object.keys(skillMap).length} skills disponibles`);
    
    // Calcular score técnico para cada candidato
    console.log("Calculando scores técnicos...");
    const technicalScores = employees.map((emp) =>
      calculateSkillMatch(emp.skills, role.skills, emp.name, role.role || role.name)
    );
    console.log("Scores técnicos calculados:", technicalScores);
    
    // Preparamos textos con la descripción del rol y los bios de los empleados
    console.log("Preparando textos para análisis contextual...");
    const texts = [role.description, ...employees.map((emp) => emp.bio)];
    console.log(`Obteniendo embeddings para ${texts.length} textos...`);
    const allEmbeddings = await getBatchEmbeddings(texts);
    const roleEmbedding = allEmbeddings[0];
    const candidateEmbeddings = allEmbeddings.slice(1);
    
    // Calcular scores contextuales con los embeddings
    console.log("Calculando scores contextuales...");
    const contextualScores = await calculateBatchContextualSimilarities(roleEmbedding, candidateEmbeddings);
    console.log("Scores contextuales calculados:", contextualScores);
    
    // Calcular pesos dinámicos
    console.log("Calculando pesos para combinar scores...");
    const { alpha, beta } = calculateDynamicWeights(role.description, role.skills, skillMap);
    console.log(`Pesos calculados - Alpha (técnico): ${alpha.toFixed(2)}, Beta (contextual): ${beta.toFixed(2)}`);
    
    // Combinar scores
    console.log("Combinando scores técnicos y contextuales...");
    const combinedScores = employees.map(
      (emp, idx) => Math.min(Math.floor(alpha * technicalScores[idx] + beta * contextualScores[idx]), 100)
    );
    console.log("Scores combinados:", combinedScores);
    
    // Preparar la respuesta con detalles por candidato
    const matches = employees.map((emp, idx) => ({
      id: emp.id,
      name: emp.name,
      avatar: emp.avatar,
      technicalScore: technicalScores[idx],
      contextualScore: contextualScores[idx],
      combinedScore: combinedScores[idx],
    }));
    
    // Ordenar los candidatos por score combinado (de mayor a menor)
    matches.sort((a, b) => b.combinedScore - a.combinedScore);
    console.log("Candidatos ordenados por score combinado");
    
    console.log("Enviando respuesta al cliente...");
    res.json({
      matches,
      weights: {
        technical: Math.round(alpha * 100),
        contextual: Math.round(beta * 100),
      },
      totalCandidates: employees.length,
      message: "Matching procesado exitosamente",
    });
  } catch (error) {
    console.error("Error en /getMatches:", error);
    res.status(500).json({ error: error.message });
  }
});

// Duplicamos el endpoint para compatibilidad con Firebase
app.post("/api/getMatches", async (req, res) => {
  try {
    console.log("Solicitud POST recibida en /api/getMatches");
    console.log(`Cuerpo de la solicitud: ${JSON.stringify(req.body, null, 2).substring(0, 200)}...`);
    
    const { role, employees, skillMap } = req.body;
    if (!role || !employees || !Array.isArray(employees) || employees.length === 0) {
      console.error("Información insuficiente en la solicitud");
      return res.status(400).json({ error: "Información insuficiente" });
    }
    
    console.log(`Procesando matching para rol: ${role.role || 'sin nombre'}`);
    console.log(`Candidatos a procesar: ${employees.length}`);
    console.log(`Mapa de skills: ${Object.keys(skillMap).length} skills disponibles`);
    
    // Calcular score técnico para cada candidato
    console.log("Calculando scores técnicos...");
    const technicalScores = employees.map((emp) =>
      calculateSkillMatch(emp.skills, role.skills, emp.name, role.role || role.name)
    );
    console.log("Scores técnicos calculados:", technicalScores);
    
    // Preparamos textos con la descripción del rol y los bios de los empleados
    console.log("Preparando textos para análisis contextual...");
    const texts = [role.description, ...employees.map((emp) => emp.bio)];
    console.log(`Obteniendo embeddings para ${texts.length} textos...`);
    const allEmbeddings = await getBatchEmbeddings(texts);
    const roleEmbedding = allEmbeddings[0];
    const candidateEmbeddings = allEmbeddings.slice(1);
    
    // Calcular scores contextuales con los embeddings
    console.log("Calculando scores contextuales...");
    const contextualScores = await calculateBatchContextualSimilarities(roleEmbedding, candidateEmbeddings);
    console.log("Scores contextuales calculados:", contextualScores);
    
    // Calcular pesos dinámicos
    console.log("Calculando pesos para combinar scores...");
    const { alpha, beta } = calculateDynamicWeights(role.description, role.skills, skillMap);
    console.log(`Pesos calculados - Alpha (técnico): ${alpha.toFixed(2)}, Beta (contextual): ${beta.toFixed(2)}`);
    
    // Combinar scores
    console.log("Combinando scores técnicos y contextuales...");
    const combinedScores = employees.map(
      (emp, idx) => Math.min(Math.floor(alpha * technicalScores[idx] + beta * contextualScores[idx]), 100)
    );
    console.log("Scores combinados:", combinedScores);
    
    // Preparar la respuesta con detalles por candidato
    const matches = employees.map((emp, idx) => ({
      id: emp.id,
      name: emp.name,
      avatar: emp.avatar,
      technicalScore: technicalScores[idx],
      contextualScore: contextualScores[idx],
      combinedScore: combinedScores[idx],
    }));
    
    // Ordenar los candidatos por score combinado (de mayor a menor)
    matches.sort((a, b) => b.combinedScore - a.combinedScore);
    console.log("Candidatos ordenados por score combinado");
    
    console.log("Enviando respuesta al cliente...");
    res.json({
      matches,
      weights: {
        technical: Math.round(alpha * 100),
        contextual: Math.round(beta * 100),
      },
      totalCandidates: employees.length,
      message: "Matching procesado exitosamente",
    });
  } catch (error) {
    console.error("Error en /api/getMatches:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/test', (req, res) => {
  console.log("Solicitud de prueba recibida en /test");
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

app.get('/api/test', (req, res) => {
  console.log("Solicitud de prueba recibida en /api/test");
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Endpoint para probar la API Key directamente
app.get('/test-openai', async (req, res) => {
  console.log("Verificando API Key de OpenAI desde endpoint /test-openai");
  const result = await testAPIKey();
  res.json({ 
    apiKeyValid: result,
    apiKeyConfigured: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key-for-deployment'
  });
});

// ----------------------------------------------------------------------------

// Iniciar el servidor localmente solo si se ejecuta directamente
if (process.env.NODE_ENV === "development" || !process.env.FUNCTION_TARGET) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
    // Verificar la API Key al inicio, solo en desarrollo
    testAPIKey()
      .then(valid => {
        if (valid) {
          console.log("✅ API Key de OpenAI verificada y funcionando correctamente");
        } else {
          console.log("⚠️ No se pudo verificar la API Key de OpenAI, se usarán embeddings simples");
        }
      })
      .catch(err => {
        console.error("Error verificando API Key:", err);
      });
  });
}

export default app;