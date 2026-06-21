import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type ServerSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export const getServerSession = async (): Promise<ServerSession> =>
  auth.api.getSession({
    headers: await headers(),
  });

export const getServerUserId = async (): Promise<string | null> => {
  const session = await getServerSession();
  return session?.user.id ?? null;
};
