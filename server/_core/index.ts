import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as db from "../db";
import { users } from "../../drizzle/schema";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Development helper: dev-login/dev-logout
  if (process.env.NODE_ENV === "development") {
    app.get("/api/dev-login", async (req, res) => {
      const openId = (req.query.openId as string) || "dev-user";
      const name = (req.query.name as string) || "Dev User";
      try {
        await db.upsertUser({
          openId,
          name,
          email: `${openId}@example.com`,
          loginMethod: "dev",
          lastSignedIn: new Date(),
        });
        const token = await sdk.createSessionToken(openId, { name });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        res.json({ success: true, openId, name });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    app.get("/api/dev-logout", (req, res) => {
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
      
      // Also clear potential mismatched secure/non-secure cookies
      const isSecure = cookieOptions.secure;
      res.clearCookie(COOKIE_NAME, { 
        ...cookieOptions, 
        secure: !isSecure, 
        sameSite: !isSecure ? 'none' : 'lax',
        maxAge: 0 
      });
      
      res.json({ success: true });
    });
    app.get("/api/db/health", async (_req, res) => {
      try {
        const conn = await db.getDb();
        if (!conn) {
          res.status(500).json({ ok: false, error: "database not configured" });
          return;
        }
        await conn.select().from(users).limit(1);
        res.json({ ok: true });
      } catch (error) {
        res.status(500).json({ ok: false, error: String(error) });
      }
    });
  }
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
