import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { ENV } from "./env";
import { getSupabaseUser } from "../supabase";
import { getUserByEmail } from "../db";

export function getSupabaseAdminMatch(
  supabaseEmail: string | null | undefined,
  configuredAdminEmail: string | undefined,
  storedAdminRole = false,
) {
  const normalizedSupabaseEmail = supabaseEmail?.trim().toLowerCase();
  const normalizedConfiguredAdminEmail = configuredAdminEmail?.trim().toLowerCase();

  if (!normalizedSupabaseEmail) return false;
  if (normalizedConfiguredAdminEmail && normalizedSupabaseEmail === normalizedConfiguredAdminEmail) return true;
  return storedAdminRole;
}

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
    const userEmail = supabaseUser?.email?.trim().toLowerCase();
    const configuredAdminEmail = ENV.supabaseAdminEmail.trim().toLowerCase();
    const storedAdminUser = userEmail ? await getUserByEmail(userEmail) : undefined;
    const isAdmin = getSupabaseAdminMatch(userEmail, configuredAdminEmail, storedAdminUser?.role === "admin");
    if (!isAdmin) {
      console.warn("[Auth] Supabase admin check failed", {
        supabaseUserFound: Boolean(supabaseUser),
        hasUserEmail: Boolean(userEmail),
        hasAdminConfig: Boolean(configuredAdminEmail),
        hasStoredAdminRole: storedAdminUser?.role === "admin",
        emailMatches: isAdmin,
      });
    }
    if (supabaseUser) {
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
