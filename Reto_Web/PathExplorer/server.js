import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { OpenAIApi } from "openai";

const app = express();
app.use(express.json());

// Inicializa OpenAIApi directamente pasando un objeto con la apiKey
const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint para obtener el embedding del texto
app.post("/api/getEmbedding", async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ error: "No se proporcionó texto." });
    }

    // Llama a la API de OpenAI usando el modelo de embedding
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: input,
    });

    // Se asume que response.data.data es un arreglo y tomamos el primer embedding
    const embedding = response.data.data[0].embedding;
    res.json({ embedding });
  } catch (error) {
    console.error("Error al obtener el embedding:", error);
    res.status(500).json({ error: "Error al obtener el embedding." });
  }
});

// Levanta el servidor en el puerto definido (o 3001 por defecto)
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});