import * as functions from "firebase-functions";
import app from "./server.js"; // Ajusta la ruta según tu estructura

// Exponer la app Express como función
export const api = functions.https.onRequest(app);
