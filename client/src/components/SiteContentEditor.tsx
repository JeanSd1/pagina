import { useEffect, useState } from "react";
import { ImageIcon, RotateCcw, Save } from "lucide-react";
import {
  DEFAULT_SITE_CONTENT,
  SITE_CONTENT_FIELDS,
  type SiteContent,
} from "@shared/siteContent";
import { trpc } from "@/lib/trpc";

type ImageField = "logoUrl" | "heroImageUrl" | "panelImageUrl";
type ImageMimeType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";
const IMAGE_FIELD_KEYS = new Set<ImageField>([
  "logoUrl",
  "heroImageUrl",
  "panelImageUrl",
]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_MIME_TYPES: ImageMimeType[] = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function isImageField(field: keyof SiteContent): field is ImageField {
  return IMAGE_FIELD_KEYS.has(field as ImageField);
}

function isImageMimeType(mimeType: string): mimeType is ImageMimeType {
  return IMAGE_MIME_TYPES.includes(mimeType as ImageMimeType);
}

async function encodeFileBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

export default function SiteContentEditor({
  content,
  onSaved,
}: {
  content?: SiteContent;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [initialized, setInitialized] = useState(false);
  const [uploadingField, setUploadingField] = useState<keyof SiteContent | null>(null);
  const [uploadError, setUploadError] = useState("");
  const utils = trpc.useUtils();
  const uploadImage = trpc.admin.uploadSiteImage.useMutation();
  const saveContent = trpc.admin.saveSiteContent.useMutation({
    onSuccess: async () => {
      await utils.siteContent.get.invalidate();
      onSaved();
    },
  });

  useEffect(() => {
    if (content && !initialized) {
      setForm(content);
      setInitialized(true);
    }
  }, [content, initialized]);

  const updateField = (key: keyof SiteContent, value: string) => {
    saveContent.reset();
    setForm(current => ({ ...current, [key]: value }));
  };

  const uploadFieldImage = async (
    key: ImageField,
    file?: File | null,
  ) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError("A imagem deve ter no máximo 5 MB.");
      return;
    }
    if (!isImageMimeType(file.type)) {
      setUploadError("Formato não permitido. Use JPG, PNG, WebP ou GIF.");
      return;
    }

    try {
      setUploadError("");
      setUploadingField(key);
      const safeName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .toLowerCase();
      const publicUrl = await uploadImage.mutateAsync({
        field: key,
        fileName: safeName,
        contentType: file.type,
        base64: await encodeFileBase64(file),
      });
      updateField(key, publicUrl);
    } catch (error) {
      console.error("[SiteContentEditor] Upload failed:", error);
      setUploadError(error instanceof Error ? error.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploadingField(null);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await saveContent.mutateAsync(form);
  };

  const sections = Array.from(
    new Set(SITE_CONTENT_FIELDS.map(field => field.section))
  );

  return (
    <section className="admin-card mb-6">
      <div className="admin-card-title">
        <div>
          <p className="eyebrow text-blue-600">conteúdo do site</p>
          <h2>Personalizar a página principal</h2>
        </div>
      </div>
      <p className="mb-5 text-sm leading-6 text-slate-500">
        Edite a marca, os textos, os contatos e as imagens usadas na frente do
        site. Todas as alterações ficam guardadas no Supabase.
      </p>
      <form className="admin-form" onSubmit={submit}>
        {sections.map((section, index) => (
          <details
            className="rounded-2xl border border-slate-200 p-4"
            key={section}
            open={index === 0}
          >
            <summary className="cursor-pointer font-display text-lg font-semibold text-slate-900">
              {section}
            </summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SITE_CONTENT_FIELDS.filter(
                field => field.section === section
              ).map(field => {
                const imageKey = isImageField(field.key) ? field.key : undefined;

                return (
                  <label
                    className="grid gap-1.5 text-xs font-semibold text-slate-500"
                    key={field.key}
                  >
                    {field.label}
                    {imageKey ? (
                      <div className="grid gap-2">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={form[field.key]}
                          onChange={event =>
                            updateField(field.key, event.target.value)
                          }
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="button-outline cursor-pointer text-xs">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async event => {
                                await uploadFieldImage(
                                  imageKey,
                                  event.target.files?.[0],
                                );
                                event.target.value = "";
                              }}
                            />
                            <ImageIcon size={14} />
                            {uploadingField === field.key
                              ? "A enviar…"
                              : "Escolher imagem"}
                          </label>
                          {form[field.key] && (
                            <a
                              className="text-xs font-semibold text-blue-600 underline-offset-2 hover:underline"
                              href={form[field.key]}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Ver imagem
                            </a>
                          )}
                        </div>
                      </div>
                    ) : field.key === "siteTheme" ? (
                      <select
                        value={form.siteTheme}
                        onChange={event => updateField("siteTheme", event.target.value)}
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Escuro</option>
                      </select>
                    ) : field.multiline ? (
                      <textarea
                        required
                        value={form[field.key]}
                        onChange={event =>
                          updateField(field.key, event.target.value)
                        }
                      />
                    ) : (
                      <input
                        required
                        value={form[field.key]}
                        onChange={event =>
                          updateField(field.key, event.target.value)
                        }
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </details>
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="button-primary"
            type="submit"
            disabled={saveContent.isPending}
          >
            <Save size={16} />{" "}
            {saveContent.isPending ? "A guardar…" : "Guardar conteúdo"}
          </button>
          <button
            className="button-outline"
            type="button"
            onClick={() => {
              saveContent.reset();
              setForm(DEFAULT_SITE_CONTENT);
            }}
          >
            <RotateCcw size={16} /> Restaurar textos originais
          </button>
        </div>
        {uploadError && (
          <p className="receipt-notice receipt-notice-error" role="alert">
            {uploadError}
          </p>
        )}
        {saveContent.error && (
          <p className="receipt-notice receipt-notice-error" role="alert">
            Não foi possível guardar o conteúdo: {saveContent.error.message}
          </p>
        )}
        {saveContent.isSuccess && (
          <p className="text-sm font-medium text-lime-700" role="status">
            Conteúdo guardado. A página pública já está atualizada.
          </p>
        )}
      </form>
    </section>
  );
}
