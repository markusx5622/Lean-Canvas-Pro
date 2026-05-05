import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini
  app.post("/api/evaluate", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const { canvasData, blockId } = req.body;

      let prompt = "";
      if (blockId) {
          // Evaluar un bloque individual
          prompt = `Eres un inversor de Venture Capital experto en el modelo Lean Canvas. Analiza la siguiente sección proporcionada por una startup:
Sección a validar: Bloque ${blockId}
El contenido es: "${canvasData}"

Da 1 fortaleza clave, 1 riesgo importante y 1 recomendación de mejora. Eres directo, enfocado en negocio y aportas valor real.
Solo devuelve el texto, sin formatos extremos.`;
      } else {
          // Evaluar todo el lienzo
          const allDataStr = Object.entries(canvasData).map(([id, text]) => `Bloque ${id}: ${text}`).join('\\n');
          prompt = `Eres un inversor experto en startups. Revisa este Lean Canvas completo:
${allDataStr}

Dame un feedback constructivo y profesional como Inversor VC. Menciona la viabilidad, riesgos clave (ej. CAC vs LTV, segmento mal definido) y qué deberíamos probar como MVP. Responde directo y da recomendaciones prácticas.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to evaluate with AI" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
