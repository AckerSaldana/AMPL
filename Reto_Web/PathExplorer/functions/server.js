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

// Crear la app de Express
const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializamos cache (TTL: 1 día)
const embeddingCache = new NodeCache({ stdTTL: 86400 });

// Inicialización de OpenAI con manejo de errores
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-deployment',
  });
} catch (error) {
  console.error('Error al inicializar OpenAI:', error);
  // Objeto simulado para permitir despliegue
  openai = {
    embeddings: {
      create: async () => ({ data: [{ embedding: Array(1536).fill(0) }] })
    }
  };
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
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-deployment') {
    console.error('No se ha configurado la API Key de OpenAI');
    return false;
  }
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

// Preprocesamiento del texto
export function preprocessText(text, maxLength = 1000) {
  if (!text || !text.trim()) return "";
  let processed = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (processed.length > maxLength) processed = processed.substring(0, maxLength);
  return processed;
}

// Obtener embeddings con caché
export async function getBatchEmbeddings(texts, sources = []) {
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

  processedTexts.forEach((item) => {
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

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-deployment') {
    console.warn('No hay API Key válida, generando embeddings simples');
    textsToProcess.forEach((text, i) => {
      results[indicesMap[i]] = generateSimpleEmbedding(text);
    });
    return results;
  }

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
    console.error(`Error obteniendo embeddings: ${error.message}`);
    textsToProcess.forEach((text, i) => {
      results[indicesMap[i]] = generateSimpleEmbedding(text);
    });
    return results;
  }
}

// Función alternativa para generar embeddings simples
export function generateSimpleEmbedding(text) {
  if (!text || !text.trim()) return Array(1536).fill(0);
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
  try {
    const similarities = await startSimilarityWorker(roleEmbedding, candidateEmbeddings);
    return similarities;
  } catch (error) {
    return candidateEmbeddings.map(candidate => {
      const sim = cosineSimilarity(roleEmbedding, candidate);
      return Math.floor(sim * 100);
    });
  }
}

function startSimilarityWorker(roleEmbedding, candidateEmbeddings) {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(__filename, { workerData: { roleEmbedding, candidateEmbeddings } });
      worker.on("message", (result) => resolve(result));
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          reject(new Error(`Worker finalizó con código ${code}`));
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

// ========================================================
// Endpoint para procesar matching: /getMatches
// ========================================================
app.post("/getMatches", async (req, res) => {
  try {
    console.log("Solicitud recibida en /getMatches:", req.body);
    const { role, employees, skillMap } = req.body;
    if (!role || !employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ error: "Información insuficiente" });
    }
    
    // Calcular el score técnico para cada empleado basado en sus habilidades
    const technicalScores = employees.map(employee =>
      calculateSkillMatch(employee.skills, role.skills, employee.name, role.role || role.name)
    );

    // Obtener embeddings: concatenamos la descripción del rol y los bios de cada empleado
    const texts = [role.description, ...employees.map(emp => emp.bio)];
    const allEmbeddings = await getBatchEmbeddings(texts);
    const roleEmbedding = allEmbeddings[0];
    const candidateEmbeddings = allEmbeddings.slice(1);
    
    // Calcular los scores contextuales usando los embeddings
    const contextualScores = await calculateBatchContextualSimilarities(roleEmbedding, candidateEmbeddings);
    
    // Calcular pesos dinámicos basados en la descripción del rol y el mapa de skills
    const { alpha, beta } = calculateDynamicWeights(role.description, role.skills, skillMap);
    
    // Combinar los scores técnicos y contextuales
    const combinedScores = employees.map((employee, idx) =>
      Math.min(Math.floor(alpha * technicalScores[idx] + beta * contextualScores[idx]), 100)
    );
    
    // Preparar respuesta con detalles para cada empleado
    const matches = employees.map((employee, idx) => ({
      id: employee.id,
      name: employee.name,
      technicalScore: technicalScores[idx],
      contextualScore: contextualScores[idx],
      combinedScore: combinedScores[idx],
    }));
    
    // Enviar respuesta
    return res.json({
      matches,
      weights: {
        technical: Math.round(alpha * 100),
        contextual: Math.round(beta * 100)
      },
      totalCandidates: employees.length,
      message: "Matching procesado exitosamente"
    });
  } catch (error) {
    console.error("Error en /getMatches:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Iniciar el servidor localmente solo si se ejecuta directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
    console.log("Sistema de matching IA optimizado listo");
  });
}

export default app;
