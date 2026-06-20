import { createAuthClient } from "better-auth/react";

// Client-side BetterAuth. baseURL defaults to the current origin, which is
// correct for the same-origin API routes mounted at /api/auth.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
