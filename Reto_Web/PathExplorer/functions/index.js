// functions/index.js
import * as functions from 'firebase-functions';
import cors from 'cors';
import app from './server.js'; // Tu aplicación existente

// Crea un middleware de CORS
const corsMiddleware = cors({ 
  origin: true, // Permite cualquier origen
  methods: ['GET', 'POST', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Envuelve tu app en un manejador que aplica CORS primero
const wrappedApp = (req, res) => {
  corsMiddleware(req, res, () => {
    app(req, res);
  });
};

// Exporta el manejador envuelto como función HTTP
export const api = functions.https.onRequest(wrappedApp);
