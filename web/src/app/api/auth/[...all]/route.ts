import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Mounts every BetterAuth endpoint (sign-up, sign-in, sign-out, session, …)
// under /api/auth/*. Runs on the Node.js runtime — the Prisma/Neon adapter
// is not edge-compatible.
export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
