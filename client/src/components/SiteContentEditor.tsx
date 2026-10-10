import { useEffect, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import {
  DEFAULT_SITE_CONTENT,
  SITE_CONTENT_FIELDS,
  type SiteContent,
} from "@shared/siteContent";
import { trpc } from "@/lib/trpc";

export default function SiteContentEditor({
  content,
  onSaved,
}: {
  content?: SiteContent;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [initialized, setInitialized] = useState(false);
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
        Edite a marca, os textos e os contatos sem alterar o visual. O crédito
        “Desenvolvido por” e o link do GitHub ficam fixos.
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
              ).map(field => (
                <label
                  className="grid gap-1.5 text-xs font-semibold text-slate-500"
                  key={field.key}
                >
                  {field.label}
                  {field.multiline ? (
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
              ))}
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
