import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SITE_CONTENT } from "../shared/siteContent";
import { saveSiteContent } from "./db";

const { createClientMock, getUserMock } = vi.hoisted(() => {
  const getUserMock = vi.fn();
  return {
    getUserMock,
    createClientMock: vi.fn(() => ({ auth: { getUser: getUserMock } })),
  };
});

vi.mock("@supabase/supabase-js", () => ({ createClient: createClientMock }));

import { getSupabaseUser } from "./supabase";

const environmentKeys = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
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

  it("throws a clear configuration error when no writable backend is available", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    await expect(saveSiteContent(DEFAULT_SITE_CONTENT)).rejects.toThrow(/SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL/i);
  });
});