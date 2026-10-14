import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SITE_CONTENT } from "../shared/siteContent";
import { getSiteContent, saveSiteContent } from "./db";
import { createContext, getSupabaseAdminMatch } from "./_core/context";

const { createClientMock, drizzleMock, fromMock, getUserMock } = vi.hoisted(() => {
  const getUserMock = vi.fn();
  const fromMock = vi.fn();
  return {
    getUserMock,
    fromMock,
    drizzleMock: vi.fn(),
    createClientMock: vi.fn(() => ({ auth: { getUser: getUserMock }, from: fromMock })),
  };
});

vi.mock("@supabase/supabase-js", () => ({ createClient: createClientMock }));
vi.mock("drizzle-orm/mysql2", () => ({ drizzle: drizzleMock }));

import { getSupabaseUser } from "./supabase";

const environmentKeys = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ADMIN_EMAIL",
  "DATABASE_URL",
] as const;
const originalEnvironment = Object.fromEntries(
  environmentKeys.map(key => [key, process.env[key]])
);

describe("Supabase user verification", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "public-anon-key";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    for (const key of environmentKeys) {
      const value = originalEnvironment[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    vi.clearAllMocks();
  });

  it("validates a user with the anon key when no service role key is set", async () => {
    const user = { id: "user-id", email: "admin@example.com" };
    getUserMock.mockResolvedValue({ data: { user }, error: null });

    await expect(getSupabaseUser("access-token")).resolves.toEqual(user);

    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "public-anon-key",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    expect(getUserMock).toHaveBeenCalledWith("access-token");
  });

  it("authorizes the configured admin without querying the MySQL users table", async () => {
    process.env.SUPABASE_ADMIN_EMAIL = "admin@example.com";
    process.env.DATABASE_URL = "mysql://example/database";
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-id", email: "admin@example.com" } },
      error: null,
    });
    drizzleMock.mockReturnValue({
      select: () => ({
        from: () => ({
          where: () => ({ limit: vi.fn().mockRejectedValue(new Error("users query failed")) }),
        }),
      }),
    });

    const context = await createContext({
      req: { headers: { authorization: "Bearer access-token" } },
      res: {},
    } as never);

    expect(context.user?.role).toBe("admin");
    expect(drizzleMock).not.toHaveBeenCalled();
  });

  it("throws a clear configuration error when no writable backend is available", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    await expect(saveSiteContent(DEFAULT_SITE_CONTENT)).rejects.toThrow(/SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL/i);
  });

  it("uses default content when configured Supabase has no saved site content", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    process.env.DATABASE_URL = "mysql://example/database";
    const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const eqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    fromMock.mockReturnValue({ select: selectMock });
    drizzleMock.mockImplementation(() => {
      throw new Error("MySQL fallback should not be used");
    });

    await expect(getSiteContent()).resolves.toEqual(DEFAULT_SITE_CONTENT);
    expect(fromMock).toHaveBeenCalledWith("site_settings");
    expect(drizzleMock).not.toHaveBeenCalled();
  });

  it("authorizes only the configured admin email, ignoring case and whitespace", () => {
    expect(getSupabaseAdminMatch(" Admin@Example.com ", "admin@example.com")).toBe(true);
    expect(getSupabaseAdminMatch("user@example.com", "admin@example.com")).toBe(false);
  });
});