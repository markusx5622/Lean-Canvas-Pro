import express, { NextFunction, Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Security headers via helmet (production only).
  // In production we enforce a strict Content-Security-Policy suited for a
  // Vite-built SPA (all JS/CSS are external hashed bundles – no inline code).
  // Helmet is skipped in development so that Vite HMR (inline scripts,
  // WebSocket connections) works without any extra configuration.
  if (isProd) {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            // data: is required for the SVG favicon embedded as a data URI
            // in index.html (<link rel="icon" href="data:image/svg+xml,…">).
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'", "https://*.supabase.co"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
          },
        },
      })
    );
  }

  app.use(express.json());

  // Health check (available in all environments)
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production the server is compiled to dist/server.cjs, so __dirname IS
    // the dist folder where Vite also outputs the frontend assets.
    const distPath = __dirname;
    app.use(express.static(distPath));

    // SPA fallback – must come after all other routes
    app.get("*", (req, res, next) => {
      const indexFile = path.join(distPath, "index.html");
      res.sendFile(indexFile, (err) => {
        if (err) next(err);
      });
    });
  }

  // 404 handler – catches non-GET requests that didn't match any route.
  // GET requests are already handled by Vite (dev) or the SPA fallback (prod).
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // 500 error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack ?? err.message);
    res.status(500).json({ error: "Internal server error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
