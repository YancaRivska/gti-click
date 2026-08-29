# GTI CLICK

> A galera registra. O GTI guarda.

Aplicação mobile-first da Galera do TI para álbuns privados de eventos. O participante entra com o código do evento, recebe uma sessão anônima do Supabase, aceita os termos, envia fotos para moderação e acessa somente as fotos aprovadas.

## Stack

- Next.js 16 com App Router e TypeScript
- React 19 e Tailwind CSS 4
- Supabase Auth anônimo, Postgres, RLS e Storage privado
- Vercel

Não há login por Google, e-mail ou senha. O projeto não usa bibliotecas de UI, service worker ou backend próprio.

## Fluxos

### Participante

1. Abre a home e acessa `/evento/entrar`.
2. Informa o código público `GALERADOTIAWS`.
3. O código é validado antes da criação da sessão anônima.
4. Uma sessão Supabase existente é reutilizada; se necessário, `signInAnonymously()` cria um `auth.uid()` individual.
5. O participante aceita a versão `1.0` dos termos.
6. Envia JPEG, PNG ou WebP com até 10 MB.
7. A foto entra como `pending` e só aparece na galeria após aprovação.
8. Fotos aprovadas são exibidas e baixadas por URLs assinadas temporárias.

### Moderação

1. O código administrativo é digitado no mesmo formulário público.
2. A validação acontece exclusivamente no servidor contra `GTI_CLICK_ADMIN_CODE`.
3. Uma sessão administrativa curta é criada em cookie `HttpOnly`.
4. `/admin/moderacao` lista somente fotos pendentes.
5. Aprovar altera o status para `approved`; excluir remove o arquivo e o registro.
6. “Sair” encerra a sessão administrativa.

O valor do código administrativo não pertence ao repositório e nunca deve usar prefixo `NEXT_PUBLIC_`.

## Setup local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. O projeto precisa de um projeto Supabase configurado para testar os fluxos protegidos.

## Variáveis de ambiente

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GTI_CLICK_ADMIN_CODE=
```

- As duas variáveis `NEXT_PUBLIC_` são usadas pelos clientes Supabase SSR/browser.
- `SUPABASE_SERVICE_ROLE_KEY` é importada apenas em módulos server-only da moderação.
- `GTI_CLICK_ADMIN_CODE` é validada apenas em Server Action e usada para assinar a sessão administrativa.
- Nunca exponha as duas variáveis server-only ao navegador.

## Rotas

| Rota | Acesso | Função |
| --- | --- | --- |
| `/` | Público | Entrada do produto |
| `/evento/entrar` | Público | Código do participante ou administrador |
| `/evento/aws-summit-sp-2026` | Sessão + consentimento | Página do evento |
| `/evento/aws-summit-sp-2026/aceite` | Sessão | Consentimento e revogação |
| `/evento/aws-summit-sp-2026/enviar` | Sessão + consentimento | Upload privado |
| `/evento/aws-summit-sp-2026/galeria` | Sessão + consentimento | Fotos aprovadas |
| `/evento/aws-summit-sp-2026/galeria/[photoId]` | Sessão + consentimento | Foto, download e exclusão própria |
| `/admin/moderacao` | Sessão administrativa | Aprovar ou excluir pendências |
| `/termos` | Público | Termos de Uso |
| `/privacidade` | Público | Política de Privacidade |

## Supabase

### Auth

Ative Anonymous Sign-Ins. Cada participante recebe um `auth.uid()` próprio; a sessão é mantida nos cookies gerenciados por `@supabase/ssr`.

### Banco

- `event_consents`: aceite por usuário/evento/versão.
- `photo_uploads`: usuário, evento, caminho privado, legenda, @ opcional, status e data.
- Novos uploads não enviam `moderation_status` pelo cliente; o default seguro do banco é `pending`.

### Storage

Bucket esperado: `event-photos`, sempre privado.

```text
event-photos/
  aws-summit-sp-2026/
    USER_ID/
      UUID.ext
```

O nome original nunca é usado como chave. As políticas limitam tipos, tamanho, evento, usuário e consentimento; a galeria usa URLs assinadas de curta duração.

### SQL

- Instalação existente: execute apenas `supabase/migrations/20260829_launch_hardening.sql`.
- Instalação nova: consulte `supabase/README.md` para a ordem dos scripts.

Os scripts são preparados para execução manual no SQL Editor. O projeto não executa migrations remotas automaticamente.

## Segurança

- Rotas do evento validam sessão no proxy e novamente nos Server Components/Actions.
- A rota de entrada continua pública e valida o código antes do Auth anônimo.
- Consentimento `1.0` é verificado no servidor e nas políticas RLS.
- Participantes não recebem permissão de `UPDATE` e não podem aprovar fotos.
- Fotos pendentes só podem ser lidas pelo próprio autor; participantes veem as aprovadas.
- Exclusão do participante exige `auth.uid() = user_id` e caminho dentro do próprio diretório.
- Moderação usa Service Role somente no servidor e uma sessão assinada, curta e `HttpOnly`.
- O bucket é privado; não existem URLs públicas permanentes.

## Checklist de deploy

- [ ] Ativar Anonymous Sign-Ins no Supabase Auth.
- [ ] Executar a migration de hardening no Supabase SQL Editor.
- [ ] Confirmar que `event-photos` está privado e com limite de 10 MB.
- [ ] Configurar as quatro variáveis de ambiente na Vercel, separando Preview e Production.
- [ ] Publicar novamente após as variáveis e a migration.
- [ ] Testar câmera/galeria em um celular real e em HTTPS.
- [ ] Testar envio, pendência, aprovação, download e exclusão.
- [ ] Testar entrada, aprovação, exclusão e logout administrativo.
- [ ] Validar Termos e Política de Privacidade com o responsável jurídico antes do evento.

## Checklist manual

Participante:

1. Home → Entrar no evento.
2. Informar `GALERADOTIAWS`.
3. Aceitar os termos.
4. Enviar uma imagem válida e confirmar o estado pendente.
5. Confirmar que ela ainda não aparece na galeria.
6. Após aprovação administrativa, abrir a galeria e a foto.
7. Baixar o original por URL assinada.
8. Excluir uma foto própria e confirmar que outra pessoa não pode fazê-lo.

Administrador:

1. Informar o código administrativo configurado no ambiente.
2. Confirmar que `/admin/moderacao` exige sessão administrativa.
3. Aprovar uma pendência.
4. Excluir outra após confirmação.
5. Sair da moderação e confirmar o bloqueio da rota.

## Qualidade

```bash
npm run lint
npm run build
```

Não há suíte automatizada configurada nesta versão; o checklist acima cobre os fluxos integrados que dependem do Supabase.
