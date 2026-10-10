// Runtime values are read at use time so tests can safely override the environment.
export const ENV = {
  get appId() {
    return process.env.APP_PROJECT_ID ?? "";
  },
  get cookieSecret() {
    return process.env.APP_SESSION_SECRET ?? "";
  },
  get databaseUrl() {
    return process.env.DATABASE_URL ?? "";
  },
  get oAuthServerUrl() {
    return process.env.OAUTH_API_URL ?? "";
  },
  get oAuthPortalUrl() {
    return process.env.OAUTH_PORTAL_URL ?? "";
  },
  get ownerOpenId() {
    return process.env.OWNER_OPEN_ID ?? "";
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get externalApiUrl() {
    return process.env.EXTERNAL_API_URL ?? "";
  },
  get externalApiKey() {
    return process.env.EXTERNAL_API_KEY ?? "";
  },
  get supabaseUrl() {
    return process.env.SUPABASE_URL ?? "";
  },
  get supabaseAnonKey() {
    return process.env.SUPABASE_ANON_KEY ?? "";
  },
  get supabaseServiceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  },
  get supabaseAdminEmail() {
    return process.env.SUPABASE_ADMIN_EMAIL ?? "";
  },
  get resendApiKey() {
    return process.env.RESEND_API_KEY ?? "";
  },
  get resendFromEmail() {
    return process.env.RESEND_FROM_EMAIL ?? "";
  },
  get receiptIssuerCpf() {
    return process.env.RECEIPT_ISSUER_CPF ?? "";
  },
};
