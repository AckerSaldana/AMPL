import * as functions from "firebase-functions";
import app from "./server.js";

export const api = functions.https.onRequest(app);
