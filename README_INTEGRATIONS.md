# Integrações e Configurações de Backend AICondo360

O frontend do AICondo360 foi preservado e o ambiente preparado para a integração completa do backend sem afetar a configuração atual. As integrações preparadas são para Supabase, Stripe e Vercel.

## 1. Banco de Dados (Supabase)

Foi criado o script de migração contendo toda a estrutura de tabelas necessária (Condomínios, Usuários/Perfis, Boletos, Reservas, Ocorrências, Pets, Consumo, etc.), bem como as configurações básicas de segurança (Row Level Security) e gatilhos de criação de usuários:

- **Local:** `supabase/migrations/20240315000000_aicondo_schema.sql`
- **Uso:** Importe esse conteúdo no SQL Editor do Supabase do seu projeto ou use via Supabase CLI (`supabase db push`).

Para integração no Frontend, foi construído o cliente do Supabase:

- **Local:** `src/lib/supabase.ts`

## 2. Pagamentos (Stripe) e Serverless (Vercel)

A plataforma AICondo360 utiliza 3 planos de assinaturas e você precisará gerenciar assinaturas. Para que o seu banco de dados (Supabase) possa saber quando um condomínio pagou a assinatura, deixamos pronta uma função Serverless preparada para a Vercel.

- **Local:** `api/stripe-webhook.js`

Este arquivo é automaticamente convertido em uma rota de API pela Vercel assim que o projeto sofrer um deploy (acessível através de `/api/stripe-webhook`). Ele está preparado para escutar os webhooks do Stripe (ex: `checkout.session.completed` e `invoice.payment_succeeded`).

## 3. Variáveis de Ambiente

As configurações de banco e integrações foram adicionadas na estrutura do projeto. Duplique o `.env.example` como `.env.local` na raiz e preencha com as suas próprias chaves do Supabase e do Stripe:

```env
VITE_SUPABASE_URL="https://[seu-projeto].supabase.co"
VITE_SUPABASE_ANON_KEY="SuaChaveAnonAqui"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
```

## Próximos Passos
1. Execute o script contido em `supabase/migrations/` no SQL Editor do seu Supabase Dashboard.
2. Cadastre os seus planos no painel do Stripe e passe as variáveis para o Vercel nas configurações de Ambiente.
3. Altere componentes específicos dentro do seu projeto em React que usam Mocks Json para que utilizem a função exportada de `src/lib/supabase.ts` fazendo buscas assíncronas no banco de dados.
