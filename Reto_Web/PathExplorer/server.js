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

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache (1 día)
const embeddingCache = new NodeCache({ stdTTL: 86400 });

// Inicialización de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Verificación mínima de la API Key
if (process.env.OPENAI_API_KEY) {
  console.log("API Key cargada: Sí");
} else {
  console.log("API Key cargada: No");
}

// Función hash para claves de caché
function generateCacheKey(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// Función para verificar la API Key
async function testAPIKey() {
  try {
    const startTime = Date.now();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "test",
    });
    const elapsedTime = Date.now() - startTime;
    console.log(`API Key válida (${elapsedTime}ms)`);
    return true;
  } catch (error) {
    console.error(`Error con API Key: ${error.message}`);
    return false;
  }
}

// Preprocesamiento del texto (logs reducidos)
function preprocessText(text, maxLength = 1000) {
  if (!text || !text.trim()) return "";
  let processed = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (processed.length > maxLength) processed = processed.substring(0, maxLength);
  return processed;
}

// Obtener embeddings con caché (logs reducidos)
async function getBatchEmbeddings(texts, sources = []) {
  if (!texts || !texts.length) return [];
  const processedTexts = texts.map((text, i) => ({
    text: preprocessText(text),
    source: sources[i] || `item-${i}`,
    index: i,
  })).filter(item => item.text.trim().length > 0);
  
  if (processedTexts.length === 0) return texts.map(() => Array(1536).fill(0));
  const results = new Array(texts.length);
  const textsToProcess = [];
  const indicesMap = [];
  
  processedTexts.forEach(item => {
    const cacheKey = generateCacheKey(item.text);
    const cached = embeddingCache.get(cacheKey);
    if (cached) {
      results[item.index] = cached;
    } else {
      textsToProcess.push(item.text);
      indicesMap.push(item.index);
    }
  });
  
  if (textsToProcess.length === 0) return results;
  
  try {
    const startTime = Date.now();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: textsToProcess,
    });
    const elapsedTime = Date.now() - startTime;
    console.log(`Embeddings obtenidos (${elapsedTime}ms)`);
    response.data.forEach((item, i) => {
      const originalIndex = indicesMap[i];
      const originalText = processedTexts.find(p => p.index === originalIndex).text;
      const cacheKey = generateCacheKey(originalText);
      embeddingCache.set(cacheKey, item.embedding);
      results[originalIndex] = item.embedding;
    });
    results.forEach((r, i) => { if (!r) results[i] = generateSimpleEmbedding(texts[i] || ""); });
    return results;
  } catch (error) {
    console.error(`Error obteniendo embeddings: ${error.message}`);
    textsToProcess.forEach((text, i) => {
      results[indicesMap[i]] = generateSimpleEmbedding(text);
    });
    return results;
  }
}

// Función alternativa para generar embeddings simples
function generateSimpleEmbedding(text) {
  if (!text || !text.trim()) return Array(1536).fill(0);
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, '');
  const words = normalizedText.split(/\s+/).filter(w => w.length > 0);
  const vector = Array(10).fill(0);
  let otherWordsCount = 0;
  const keywordCategories = {
    desarrollo: ["desarrollador", "developer", "programmer", "coder"],
    frontend: ["frontend", "html", "css", "javascript"],
    backend: ["backend", "server", "api", "database"],
    seniority: ["junior", "senior", "lead"]
  };
  words.forEach(word => {
    let found = false;
    Object.keys(keywordCategories).forEach((category, index) => {
      if (keywordCategories[category].some(kw => word.includes(kw))) {
        vector[index] += 1;
        found = true;
      }
    });
    if (!found) otherWordsCount++;
  });
  const totalWords = words.length || 1;
  const normalizedVector = vector.map(val => val / totalWords);
  normalizedVector.push(otherWordsCount / totalWords);
  const extendedVector = [...normalizedVector];
  while (extendedVector.length < 1536) extendedVector.push(0);
  return extendedVector;
}

// Cálculo de similitud (logs mínimos)
function cosineSimilarity(vecA, vecB) {
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

// Paralelización con Worker
function startSimilarityWorker(roleEmbedding, candidateEmbeddings) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { roleEmbedding, candidateEmbeddings } });
    worker.on("message", result => resolve(result));
    worker.on("error", reject);
    worker.on("exit", code => { if (code !== 0) reject(new Error(`Worker finalizó con código ${code}`)); });
  });
}

if (!isMainThread) {
  const { roleEmbedding, candidateEmbeddings } = workerData;
  const similarities = candidateEmbeddings.map((candidateEmbedding, index) => {
    const sim = cosineSimilarity(roleEmbedding, candidateEmbedding);
    return Math.floor(sim * 100);
  });
  parentPort.postMessage(similarities);
}

// Cálculo batch de similitudes contextuales
async function calculateBatchContextualSimilarities(roleEmbedding, candidateEmbeddings) {
  try {
    const similarities = await startSimilarityWorker(roleEmbedding, candidateEmbeddings);
    return similarities;
  } catch (error) {
    return candidateEmbeddings.map((candidate, index) => {
      const sim = cosineSimilarity(roleEmbedding, candidate);
      return Math.floor(sim * 100);
    });
  }
}

// Función de pesos dinámicos mejorada que utiliza el mapa de skills
function calculateDynamicWeights(roleDescription = "", roleSkills = [], skillMap = {}) {
  // Valores predeterminados
  let alpha = 0.6;  // Peso para score técnico
  let beta = 0.4;   // Peso para score contextual

  console.log("Calculando pesos dinámicos basados en skills y descripción del rol");
  
  // Clasificar las habilidades del rol en técnicas y blandas
  let technicalSkills = [];
  let softSkills = [];
  
  // Si tenemos skills y un mapa de skills, clasificarlas según su tipo
  if (roleSkills && roleSkills.length > 0 && skillMap && Object.keys(skillMap).length > 0) {
    console.log(`Clasificando ${roleSkills.length} skills del rol usando mapa de skills`);
    
    roleSkills.forEach(skill => {
      const skillId = skill.id || skill.skill_ID;
      if (skillId && skillMap[skillId]) {
        // Verificar si el skill está en el mapa y tiene un tipo
        const skillInfo = skillMap[skillId];
        const skillType = skillInfo.type || skillInfo.skillType || "unknown";
        
        if (skillType.toLowerCase() === 'technical' || skillType.toLowerCase() === 'hard') {
          technicalSkills.push({
            ...skill,
            name: skillInfo.name || `Skill #${skillId}`,
            importance: skill.importance || 1
          });
        } else if (skillType.toLowerCase() === 'soft' || skillType.toLowerCase() === 'personal') {
          softSkills.push({
            ...skill,
            name: skillInfo.name || `Skill #${skillId}`,
            importance: skill.importance || 1
          });
        }
      }
    });
    
    console.log(`Skills clasificadas - Técnicas: ${technicalSkills.length}, Blandas: ${softSkills.length}`);
  }

  // Calcular la importancia total de cada tipo de habilidad
  let technicalImportance = technicalSkills.reduce((sum, skill) => sum + (skill.importance || 1), 0);
  let softImportance = softSkills.reduce((sum, skill) => sum + (skill.importance || 1), 0);

  // Si no hay suficiente información de skills, analizar la descripción del rol
  if ((technicalImportance === 0 && softImportance === 0) || technicalSkills.length + softSkills.length < 3) {
    console.log("Información de skills insuficiente, analizando descripción del rol");
    
    // Palabras clave técnicas y blandas predeterminadas
    const technicalKeywords = [
      'programación', 'coding', 'desarrollo', 'development', 'técnico', 'technical',
      'react', 'javascript', 'python', 'java', 'frontend', 'backend', 'fullstack',
      'cloud', 'database', 'api', 'arquitectura', 'devops', 'mobile', 'web',
      'testing', 'qa', 'algorithm', 'data', 'analytics', 'machine learning'
    ];
    
    const softKeywords = [
      'comunicación', 'communication', 'liderazgo', 'leadership', 'trabajo en equipo', 
      'teamwork', 'creatividad', 'creativity', 'resolución de problemas', 'problem solving',
      'gestión', 'management', 'colaboración', 'collaboration', 'adaptabilidad', 'adaptability',
      'empatía', 'empathy', 'organización', 'organization', 'pensamiento crítico'
    ];

    // Buscar ocurrencias de palabras clave en la descripción del rol
    if (roleDescription && roleDescription.trim().length > 0) {
      const descLower = roleDescription.toLowerCase();
      let technicalCount = 0, softCount = 0;
      
      technicalKeywords.forEach(kw => { 
        if (descLower.includes(kw.toLowerCase())) technicalCount++; 
      });
      
      softKeywords.forEach(kw => { 
        if (descLower.includes(kw.toLowerCase())) softCount++; 
      });

      // Aplicar un peso adicional a las soft skills para equilibrar
      technicalImportance = technicalCount;
      softImportance = softCount * 1.5;
      
      console.log(`Análisis de descripción - Menciones técnicas: ${technicalCount}, Menciones soft: ${softCount}`);
    }
  }

  // Calcular los pesos en función de la importancia relativa
  const totalImportance = technicalImportance + softImportance;
  
  if (totalImportance > 0) {
    alpha = technicalImportance / totalImportance;
    beta = softImportance / totalImportance;
    
    // Asegurar valores razonables (evitar extremos)
    if (alpha < 0.3) alpha = 0.3;
    if (alpha > 0.8) alpha = 0.8;
    if (beta < 0.2) beta = 0.2;
    if (beta > 0.7) beta = 0.7;
    
    // Normalizar para que sumen 1
    const sum = alpha + beta;
    alpha = alpha / sum;
    beta = beta / sum;
  }

  // Ajustar según descripción explícita (si se menciona explícitamente)
  if (roleDescription) {
    const descLower = roleDescription.toLowerCase();
    if (descLower.includes('altamente técnico') || descLower.includes('highly technical')) {
      alpha = 0.75; 
      beta = 0.25;
      console.log("Ajuste especial: Rol altamente técnico");
    } else if (descLower.includes('cultural fit') || descLower.includes('soft skills') || 
               descLower.includes('trabajo en equipo') || descLower.includes('liderazgo')) {
      alpha = 0.4; 
      beta = 0.6;
      console.log("Ajuste especial: Rol enfocado en habilidades blandas/cultura");
    }
  }

  console.log(`Pesos calculados - Técnico: ${Math.round(alpha * 100)}%, Contextual: ${Math.round(beta * 100)}%`);
  return { alpha, beta };
}

// Función mejorada para calcular la compatibilidad de habilidades
function calculateSkillMatch(employeeSkills, roleSkills, employeeName = "Employee", roleName = "Role") {
  if (!employeeSkills || !roleSkills || !employeeSkills.length || !roleSkills.length) return 0;
  
  const roleSkillsMap = {};
  roleSkills.forEach(skill => {
    const skillId = skill.id || skill.skill_ID;
    if (skillId) roleSkillsMap[skillId] = { 
      importance: skill.importance || 1, 
      years: skill.years || 0 
    };
  });
  
  const employeeSkillsMap = {};
  employeeSkills.forEach(skill => {
    const skillId = skill.skill_ID || skill.id;
    if (skillId) employeeSkillsMap[skillId] = { 
      proficiency: skill.proficiency || "Low", 
      yearExp: skill.year_Exp || skill.yearExp || 0 
    };
  });
  
  let totalImportance = 0, matchScore = 0;
  const YEARS_WEIGHT = 0.3;
  const PROFICIENCY_WEIGHT = 0.7;
  
  for (const skillId in roleSkillsMap) {
    const roleSkill = roleSkillsMap[skillId];
    totalImportance += roleSkill.importance;
    
    if (employeeSkillsMap[skillId]) {
      const employeeSkill = employeeSkillsMap[skillId];
      
      // Calcular puntuación por experiencia
      const yearsMatch = Math.min(employeeSkill.yearExp / Math.max(roleSkill.years, 1), 1);
      
      // Calcular puntuación por nivel de competencia
      let proficiencyScore;
      switch(employeeSkill.proficiency) {
        case "Expert": proficiencyScore = 1.0; break;
        case "Advanced": proficiencyScore = 0.85; break;
        case "Intermediate": proficiencyScore = 0.6; break;
        case "Medium": proficiencyScore = 0.5; break;
        case "High": proficiencyScore = 0.7; break;
        case "Low": proficiencyScore = 0.3; break;
        default: proficiencyScore = 0.3;
      }
      
      // Combinar las puntuaciones
      const skillScore = (yearsMatch * YEARS_WEIGHT + proficiencyScore * PROFICIENCY_WEIGHT) * roleSkill.importance;
      matchScore += skillScore;
    }
  }
  
  return totalImportance > 0 ? Math.floor((matchScore / totalImportance) * 100) : 0;
}

// Endpoint de matching con integración del mapa de habilidades
app.post("/api/getMatches", async (req, res) => {
  try {
    console.log("=== INICIANDO PROCESO DE MATCHING ===");
    
    // Verificar API key
    const apiKeyValid = await testAPIKey();
    if (!apiKeyValid) console.log("⚠️ API Key inválida");
    
    // Obtener datos de la petición
    const { role, employees, skillMap = {} } = req.body;
    
    // Validar datos básicos
    if (!role) {
      return res.status(400).json({ error: "No se proporcionó información del rol" });
    }
    
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ error: "No se proporcionaron empleados para el matching" });
    }
    
    // Información básica del rol
    const roleName = role.role || role.name || "Rol sin nombre";
    const roleDescription = role.description || "";
    console.log(`Rol: "${roleName}" - ${employees.length} candidatos`);
    
    // Si se proporcionó un mapa de skills, mostrar información
    if (skillMap && Object.keys(skillMap).length > 0) {
      console.log(`Mapa de skills proporcionado con ${Object.keys(skillMap).length} skills`);
    } else {
      console.log("No se proporcionó mapa de skills, usando análisis de texto");
    }

    // Fase 1: Preparar y obtener embeddings
    console.log("Fase 1: Obteniendo embeddings...");
    const employeeBios = employees.map(emp => emp.bio || "");
    const allTexts = [roleDescription, ...employeeBios];
    const allSources = [`rol ${roleName}`, ...employees.map(emp => `empleado ${emp.name || "sin nombre"}`)];
    
    const allEmbeddings = await getBatchEmbeddings(allTexts, allSources);
    const roleEmbedding = allEmbeddings[0];
    const candidateEmbeddings = allEmbeddings.slice(1);
    
    // Fase 2: Calcular similitudes contextuales
    console.log("Fase 2: Calculando similitudes contextuales...");
    const contextualScores = await calculateBatchContextualSimilarities(roleEmbedding, candidateEmbeddings);
    
    // Fase 3: Calcular scores técnicos
    console.log("Fase 3: Calculando scores técnicos...");
    const technicalScores = employees.map((employee, idx) => 
      calculateSkillMatch(employee.skills, role.skills, employee.name || `Empleado #${idx+1}`, roleName)
    );
    
    // Fase 4: Calcular pesos dinámicos basados en las skills
    console.log("Fase 4: Calculando pesos dinámicos...");
    const { alpha, beta } = calculateDynamicWeights(roleDescription, role.skills, skillMap);
    
    // Fase 5: Combinar scores con los pesos calculados
    console.log("Fase 5: Combinando scores...");
    const processedEmployees = employees.map((employee, index) => {
      const contextualScore = contextualScores[index];
      const technicalScore = technicalScores[index];
      const combinedScore = Math.min(Math.floor(alpha * technicalScore + beta * contextualScore), 100);
      
      return {
        id: employee.id,
        name: employee.name || `Empleado #${index + 1}`,
        avatar: employee.avatar,
        score: combinedScore,
        technicalScore,
        contextualScore,
        weights: {
          technical: Math.round(alpha * 100),
          contextual: Math.round(beta * 100)
        }
      };
    });
    
    // Ordenar por score
    const bestMatches = processedEmployees.sort((a, b) => b.score - a.score);
    
    // Resumen de resultados
    console.log("=== MATCHING COMPLETADO ===");
    console.log(`Top match: ${bestMatches[0]?.name}, Score: ${bestMatches[0]?.score}%`);
    console.log(`Pesos utilizados - Técnico: ${Math.round(alpha * 100)}%, Contextual: ${Math.round(beta * 100)}%`);
    
    // Devolver resultados
    return res.json({ 
      matches: bestMatches,
      roleName,
      weights: {
        technical: Math.round(alpha * 100),
        contextual: Math.round(beta * 100)
      },
      totalCandidates: employees.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("ERROR EN PROCESO DE MATCHING:", error);
    res.status(500).json({ error: "Error al calcular matches." });
  }
});

// Endpoint para obtener pesos basados en un rol (útil para pruebas o front-end)
app.post("/api/getWeights", async (req, res) => {
  try {
    const { role, skillMap = {} } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: "No se proporcionó información del rol" });
    }
    
    const roleName = role.role || role.name || "Rol sin nombre";
    const roleDescription = role.description || "";
    
    console.log(`Calculando pesos para rol: "${roleName}"`);
    
    const { alpha, beta } = calculateDynamicWeights(roleDescription, role.skills, skillMap);
    
    return res.json({
      roleName,
      weights: {
        technical: Math.round(alpha * 100),
        contextual: Math.round(beta * 100)
      }
    });
    
  } catch (error) {
    console.error("Error calculando pesos:", error);
    res.status(500).json({ error: "Error al calcular pesos." });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
  console.log(`Sistema de matching IA optimizado listo`);
});