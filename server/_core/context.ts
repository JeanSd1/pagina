import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { ENV } from "./env";
import { getSupabaseUser } from "../supabase";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const authorization = opts.req.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    const supabaseUser = await getSupabaseUser(authorization.slice("Bearer ".length));
    if (supabaseUser) {
      const adminEmail = ENV.supabaseAdminEmail.trim().toLowerCase();
      const userEmail = supabaseUser.email?.trim().toLowerCase();
      const isAdmin = Boolean(userEmail && adminEmail && userEmail === adminEmail);
      user = {
        id: 0,
        openId: `supabase:${supabaseUser.id}`,
        name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email ?? "Utilizador Supabase",
        email: supabaseUser.email ?? null,
        loginMethod: "supabase",
        role: isAdmin ? "admin" : "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      } as User;
    }
  }

  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
