
// functions/index.js
import * as functions from 'firebase-functions';
import app from './server.js'; // Asegúrate de que server.js también use sintaxis import/export

// Exporta la app como función HTTP
export const api = functions.https.onRequest(app);