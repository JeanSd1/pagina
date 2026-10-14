import { describe, expect, it } from "vitest";
import { siteContentInput } from "./routers";
import {
  DEFAULT_SITE_CONTENT,
  SITE_CONTENT_FIELDS,
  normalizeSiteContent,
} from "../shared/siteContent";

describe("site content settings", () => {
  it("exposes every configurable default exactly once", () => {
    const configuredFields = SITE_CONTENT_FIELDS.map(field => field.key);
    expect(new Set(configuredFields).size).toBe(configuredFields.length);
    expect([...configuredFields].sort()).toEqual(
      Object.keys(DEFAULT_SITE_CONTENT).sort()
    );
  });

  it("fills missing settings with defaults and preserves valid overrides", () => {
    expect(
      normalizeSiteContent({
        brandName: "Minha empresa",
        unexpectedField: "ignored",
      })
    ).toEqual({
      ...DEFAULT_SITE_CONTENT,
      brandName: "Minha empresa",
    });
  });

  it("accepts only the supported site themes", () => {
    expect(normalizeSiteContent({ siteTheme: "dark" }).siteTheme).toBe("dark");
    expect(normalizeSiteContent({ siteTheme: "neon" }).siteTheme).toBe("light");
  });

  it("allows empty presentation values when the user wants an image-only hero", async () => {
    const content = {
      ...DEFAULT_SITE_CONTENT,
      heroTitle: "",
      heroAccent: "",
      heroDescription: "",
      panelTitle: "",
      panelEyebrow: "",
      panelDescription: "",
    };

    expect(() => siteContentInput.parse(content)).not.toThrow();
    expect(() => siteContentInput.parse({ ...content, brandName: "" })).toThrow();
  });
});
