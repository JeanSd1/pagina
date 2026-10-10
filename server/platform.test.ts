import { afterEach, describe, expect, it, vi } from "vitest";
import {
  publicPlatformConfig,
  publicPlatformScript,
} from "./_core/publicConfig";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { listLLMModels } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { COOKIE_NAME } from "../shared/const";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("runtime integrations", () => {
  it("exposes only named public runtime configuration", () => {
    const env = {
      APP_PROJECT_ID: "project-test",
      EXTERNAL_API_KEY: "server-only-test",
      APP_SESSION_SECRET: "signing-only-test",
      DATABASE_URL: "db-only-test",
      EXTERNAL_API_BROWSER_KEY: "public-browser-test",
      APP_ANALYTICS_ENDPOINT: "https://analytics.example",
      APP_ANALYTICS_WEBSITE_ID: "site-test",
    };
    expect(publicPlatformConfig(env)).toMatchObject({
      projectId: "project-test",
      apiBrowserKey: "public-browser-test",
    });
    const script = publicPlatformScript(env);
    for (const value of [
      env.EXTERNAL_API_KEY,
      env.APP_SESSION_SECRET,
      env.DATABASE_URL,
    ])
      expect(script).not.toContain(value);
    const appended: unknown[] = [];
    const fakeDocument = {
      createElement: () => ({ setAttribute() {} }),
      head: { appendChild: (node: unknown) => appended.push(node) },
    };
    new Function("window", "document", script)({}, fakeDocument);
    expect(appended).toHaveLength(0);
    new Function("window", "document", publicPlatformScript({}))(
      {},
      fakeDocument
    );
    expect(appended).toHaveLength(0);
  });
  it("does not guess a production API when the project environment is absent", async () => {
    vi.stubEnv("EXTERNAL_API_URL", "");
    vi.stubEnv("EXTERNAL_API_KEY", "test-only");
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    await expect(listLLMModels()).rejects.toThrow(
      "External API URL is not configured."
    );
    expect(request).not.toHaveBeenCalled();
  });
  it("persists URL-only image results through current managed storage", async () => {
    vi.stubEnv("EXTERNAL_API_URL", "https://api.example");
    vi.stubEnv("EXTERNAL_API_KEY", "test-only");
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            image: {
              url: "https://image.example/result.png",
              mimeType: "image/png",
            },
          })
        )
      )
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3])))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ url: "https://upload.example/object" }))
      )
      .mockResolvedValueOnce(new Response(""));
    vi.stubGlobal("fetch", request);
    const image = await generateImage({ prompt: "test", originalImages: [] });
    expect(image.url).toMatch(/^\/storage\/generated\//);
    expect(request).toHaveBeenCalledTimes(4);
    expect(JSON.parse(request.mock.calls[0][1].body)).toHaveProperty(
      "originalImages"
    );
  });
  it("uses a distinct secure app cookie behind the HTTPS Preview proxy", () => {
    expect(COOKIE_NAME).not.toBe("app_session_id");
    expect(
      getSessionCookieOptions({ protocol: "http", headers: {} } as never)
    ).toMatchObject({ secure: true, httpOnly: true, sameSite: "none" });
  });
  it("binds signed app sessions to this project and accepts an empty display name", async () => {
    vi.stubEnv("APP_PROJECT_ID", "project-test");
    vi.stubEnv("APP_SESSION_SECRET", "unit-test-signing-key-never-deployed");
    const token = await sdk.signSession({
      openId: "user-test",
      appId: "project-test",
      name: "",
    });
    expect(await sdk.verifySession(token)).toMatchObject({
      openId: "user-test",
    });
    vi.stubEnv("APP_PROJECT_ID", "different-project");
    expect(await sdk.verifySession(token)).toBeNull();
  });
  it("silently ignores legacy sessions when OAuth authentication is not configured", async () => {
    vi.stubEnv("APP_SESSION_SECRET", "");
    const warning = vi.spyOn(console, "warn");

    await expect(sdk.verifySession("stale-session-cookie")).resolves.toBeNull();

    expect(warning).not.toHaveBeenCalled();
  });
});
