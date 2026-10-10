# Jean Durgante — Tech Solutions

Aplicação de prestação de serviços construída com React, Express, tRPC, Drizzle e Supabase.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

## Supabase e painel administrativo

Este projeto usa o Supabase para autenticação por e-mail/senha, serviços, horários, orçamentos e reservas. No ambiente de hospedagem, as variáveis podem ser configuradas como variáveis privadas do serviço:

- `SUPABASE_URL`: URL pública do projeto Supabase.
- `SUPABASE_ANON_KEY`: chave pública anon usada pelo cliente.
- `SUPABASE_SERVICE_ROLE_KEY`: chave privada usada apenas pelo servidor.
- `SUPABASE_ADMIN_EMAIL`: e-mail autorizado a abrir o painel `/admin`.

Para uma execução local, copie `.env.example` para `.env`, preencha os valores no ambiente local e nunca faça commit do ficheiro `.env`. Execute também o conteúdo de `supabase/schema.sql` no SQL Editor do Supabase. O painel `/admin` oferece login, edição do conteúdo principal e contactos, gestão de serviços e preços, horários e reservas. O crédito fixo “Desenvolvido por” aponta para [github.com/JeanSd1](https://github.com/JeanSd1) e não pode ser alterado pelo painel. A tabela `site_settings` é criada pelo script `supabase/schema.sql`; para MySQL, aplique também a migração `0002_site_settings`. As alterações públicas e administrativas usam Supabase Realtime quando o projeto está publicado.

### Recibos por e-mail

O painel `/admin` gera recibos PDF e envia-os como anexo pelo Resend. Configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL` e `RECEIPT_ISSUER_CPF` como variáveis privadas no Render. O endereço remetente precisa pertencer a um domínio verificado no Resend; configure os registos DNS solicitados pelo Resend antes de enviar a clientes. O e-mail do cliente é obrigatório para a entrega e o CPF do cliente é opcional. Os dados do recibo não são gravados no banco de dados; os CPFs são usados somente no PDF enviado.

Para um teste inicial no Resend sem domínio verificado, configure `RESEND_FROM_EMAIL` como `JD Tech Solutions <onboarding@resend.dev>` e envie somente para o endereço da conta Resend. Respostas de erro do provedor são incluídas na mensagem e nos logs para facilitar o diagnóstico.
