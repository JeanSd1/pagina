import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { DEFAULT_SERVICES } from "@shared/const";
import { SITE_CONTENT_FIELDS, type SiteContent } from "../shared/siteContent";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { createBooking, createQuote, getSiteContent, listBookings, listServices, listSlots, removeSlot, saveService, saveSiteContent, saveSlot, setBookingStatus } from "./db";
import { sbUploadSiteImage } from "./supabase";
import { sendReceipt } from "./receipts";

const serviceInput = z.object({
  id: z.number().optional(), slug: z.string().min(2).max(120), name: z.string().min(2).max(160), category: z.string().min(2).max(80), description: z.string().min(10), icon: z.string().min(2).max(40), priceFrom: z.number().nonnegative().nullable().optional(), priceMode: z.enum(["fixed", "from", "quote"]), active: z.boolean(),
});
const optionalImageKeys = new Set<keyof SiteContent>([
  "logoUrl",
  "heroImageUrl",
  "panelImageUrl",
]);
const optionalContentSections = new Set(["Apresentação", "Cartão de destaque"]);
export const siteContentInput = z.custom<SiteContent>(
  (input): input is SiteContent =>
    typeof input === "object" &&
    input !== null &&
    SITE_CONTENT_FIELDS.every(({ key }) => {
      const rawValue = Reflect.get(input, key);
      const value = rawValue == null ? "" : String(rawValue);
      if (key === "siteTheme" && value !== "" && value !== "light" && value !== "dark") return false;
      if (optionalImageKeys.has(key) || optionalContentSections.has(SITE_CONTENT_FIELDS.find(field => field.key === key)?.section ?? "")) {
        return value.length <= 5000;
      }
      return value.trim().length > 0 && value.length <= 5000;
    }),
  { message: "O conteúdo do site contém campos vazios ou inválidos." },
);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  services: router({
    list: publicProcedure.query(async () => {
      const rows = await listServices(false);
      if (!rows.length) return DEFAULT_SERVICES;
      return rows.map(row => ({ ...row, priceFrom: row.priceFrom == null ? null : Number(row.priceFrom), active: Boolean(row.active) }));
    }),
  }),
  siteContent: router({
    get: publicProcedure.query(() => getSiteContent()),
  }),
  availability: router({
    list: publicProcedure.input(z.object({ fromDate: z.string().optional(), toDate: z.string().optional() }).nullish()).query(async ({ input }) => {
      return listSlots(input?.fromDate, input?.toDate);
    }),
  }),
  quotes: router({
    create: publicProcedure.input(z.object({ customerName: z.string().max(160).optional(), customerPhone: z.string().max(40).optional(), customerEmail: z.string().email().max(320).optional().or(z.literal("")), summary: z.string().min(3).max(5000), estimate: z.number().nonnegative().optional() })).mutation(async ({ input }) => { const id = await createQuote(input); return { success: id !== null, id }; }),
  }),
  bookings: router({
    create: publicProcedure.input(z.object({ slotId: z.number().int().positive(), customerName: z.string().trim().min(2).max(160), customerPhone: z.string().trim().min(8).max(40), customerEmail: z.string().email().max(320).optional().or(z.literal("")), serviceSummary: z.string().max(1000).optional() })).mutation(async ({ input }) => {
      const result = await createBooking(input);
      if (!result.success && result.reason === "database_unavailable") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A agenda não está conectada ao banco de dados. Configure a persistência no servidor e tente novamente." });
      }
      return result;
    }),
  }),
  admin: router({
    dashboard: adminProcedure.query(async () => ({ services: await listServices(true), slots: await listSlots(), bookings: await listBookings(), siteContent: await getSiteContent() })),
    uploadSiteImage: adminProcedure.input(z.object({
      field: z.enum(["logoUrl", "heroImageUrl", "panelImageUrl"]),
      fileName: z.string().min(1).max(255).regex(/^[a-zA-Z0-9._-]+$/),
      contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
      base64: z.string().min(1).max(7_000_000).regex(/^[A-Za-z0-9+/]+={0,2}$/),
    })).mutation(({ input }) => sbUploadSiteImage(input)),
    saveSiteContent: adminProcedure.input(siteContentInput).mutation(({ input }) => saveSiteContent(input)),
    saveService: adminProcedure.input(serviceInput).mutation(({ input }) => saveService(input)),
    saveSlot: adminProcedure.input(z.object({ id: z.number().optional(), date: z.string().length(10), time: z.string().length(5), status: z.enum(["available", "blocked", "booked"]), note: z.string().max(255).optional() })).mutation(({ input }) => saveSlot(input)),
    blockSlot: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => removeSlot(input.id)),
    setBookingStatus: adminProcedure.input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "cancelled"]) })).mutation(({ input }) => setBookingStatus(input.id, input.status)),
    sendReceipt: adminProcedure.input(z.object({
      customerName: z.string().trim().min(2).max(160),
      customerEmail: z.string().trim().email().max(320),
      customerCpf: z.string().trim().max(18).optional(),
      serviceDescription: z.string().trim().min(5).max(1500),
      amount: z.number().finite().positive().max(10_000_000),
      paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
      }, "Informe uma data válida."),
    })).mutation(({ input }) => sendReceipt(input)),
  }),
});

export type AppRouter = typeof appRouter;
