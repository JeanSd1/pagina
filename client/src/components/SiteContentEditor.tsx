import { useEffect, useState } from "react";
import { ImageIcon, RotateCcw, Save } from "lucide-react";
import {
  DEFAULT_SITE_CONTENT,
  SITE_CONTENT_FIELDS,
  type SiteContent,
} from "@shared/siteContent";
import { trpc } from "@/lib/trpc";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const IMAGE_FIELD_KEYS = new Set<keyof SiteContent>(["logoUrl", "heroImageUrl"]);

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
  const saveContent = trpc.admin.saveSiteContent.useMutation({
    onSuccess: () => {
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
    key: keyof SiteContent,
    file?: File | null,
  ) => {
    if (!file) return;
    if (!isSupabaseConfigured) {
      setUploadError("Configure o Supabase para habilitar uploads de imagem.");
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
      const storagePath = `site/${String(key)}/${Date.now()}-${safeName}`;
      const { data, error } = await supabase.storage
        .from("site-assets")
        .upload(storagePath, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;
      const publicUrl = supabase.storage
        .from("site-assets")
        .getPublicUrl(data.path).data.publicUrl;

      updateField(key, publicUrl);
    } catch (error) {
      console.error("[SiteContentEditor] Upload failed:", error);
      setUploadError("Não foi possível enviar a imagem. Verifique se o bucket do Supabase foi criado e está acessível.");
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
                const isImageField = IMAGE_FIELD_KEYS.has(field.key);

                return (
                  <label
                    className="grid gap-1.5 text-xs font-semibold text-slate-500"
                    key={field.key}
                  >
                    {field.label}
                    {isImageField ? (
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
                                  field.key,
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
