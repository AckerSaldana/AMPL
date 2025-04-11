// functions/index.js
const functions = require('firebase-functions');
const app = require('../server.js'); // Asegúrate de que la ruta sea correcta

// Exporta la app como función HTTP
exports.api = functions.https.onRequest(app);
