import type { Express } from "express";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.externalApiUrl || !ENV.externalApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const externalServiceUrl = new URL(
        "v1/storage/presign/get",
        ENV.externalApiUrl.replace(/\/+$/, "") + "/",
      );
      externalServiceUrl.searchParams.set("path", key);

      const externalServiceResp = await fetch(externalServiceUrl, {
        headers: { Authorization: `Bearer ${ENV.externalApiKey}` },
      });

      if (!externalServiceResp.ok) {
        const body = await externalServiceResp.text().catch(() => "");
        console.error(`[StorageProxy] externalService error: ${externalServiceResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await externalServiceResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
