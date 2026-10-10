// Only these public values may reach the browser. Never serialize process.env.
export function publicPlatformConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    projectId: env.APP_PROJECT_ID ?? "",
    oauthPortalUrl: env.OAUTH_PORTAL_URL ?? "",
    apiUrl: env.EXTERNAL_API_URL ?? "",
    apiBrowserKey: env.EXTERNAL_API_BROWSER_KEY ?? "",
    supabaseUrl: env.SUPABASE_URL ?? "",
    supabaseAnonKey: env.SUPABASE_ANON_KEY ?? "",
  };
}

export function publicPlatformScript(
  env: NodeJS.ProcessEnv = process.env
): string {
  const json = JSON.stringify(publicPlatformConfig(env)).replaceAll(
    "<",
    "\\u003c"
  );
  return `window.__APP_CONFIG__=${json};`;
}
