import * as functions from "firebase-functions";
import { createServer } from "http";
import next from "next";

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: { distDir: ".next" } });
const handle = app.getRequestHandler();

export const nextApp = functions.https.onRequest(async (req, res) => {
  // Ensure the app is prepared before handling the request.
  await app.prepare();
  return handle(req, res);
});
