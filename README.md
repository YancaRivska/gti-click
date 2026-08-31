# GTI CLICK

> A galera registra. O GTI guarda.

Aplicação mobile-first da Galera do TI para álbuns privados de eventos. A equipe entra com o código do evento, recebe uma sessão anônima do Supabase, aceita os termos e publica fotos diretamente no álbum privado.

## Stack

- Next.js 16 com App Router e TypeScript
- React 19 e Tailwind CSS 4
- Supabase Auth anônimo + e-mail/senha, Postgres, RLS e Storage privado
- Vercel

O evento continua acessível por sessão anônima. Depois de participar, a pessoa pode transformar essa sessão em um perfil permanente: confirma o e-mail, cria uma senha e preserva fotos, curtidas e histórico. O projeto não usa login por Google, bibliotecas de UI, service worker ou backend próprio.

## Fluxos

### Participante

1. Abre a home e acessa `/evento/entrar`.
2. Informa o código público `GALERADOTIAWS`.
3. O código é validado antes da criação da sessão anônima.
4. Uma sessão Supabase existente é reutilizada; se necessário, `signInAnonymously()` cria um `auth.uid()` individual.
5. O participante aceita a versão `1.0` dos termos.
6. Envia JPEG, PNG ou WebP com até 10 MB.
7. A foto entra como `approved` e aparece na galeria sem aprovação manual.
8. Fotos são exibidas e baixadas por URLs assinadas temporárias.
9. A pessoa pode curtir fotos e, opcionalmente, criar um perfil permanente em `/meu-gti/criar`.

### Perfil permanente

1. Uma pessoa que já entrou no evento abre `/meu-gti/criar`.
2. Informa nome, Instagram opcional e e-mail.
3. O Supabase envia o link de confirmação usando o SMTP configurado no Auth.
4. Após confirmar o e-mail, a pessoa cria uma senha com pelo menos 8 caracteres.
5. O login e a recuperação de senha ficam disponíveis em `/meu-gti/entrar`.

O Supabase armazena somente o hash da senha. A senha nunca é enviada por e-mail nem gravada nas tabelas da aplicação.

### Moderação

1. O código administrativo é digitado no mesmo formulário público.
2. A validação acontece exclusivamente no servidor contra `GTI_CLICK_ADMIN_CODE`.
3. Uma sessão administrativa curta é criada em cookie `HttpOnly`.
4. `/admin/moderacao` permanece disponível por compatibilidade, mas não faz parte do fluxo normal da equipe.
5. A exclusão da própria foto acontece diretamente na galeria ou no detalhe.
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
| `/evento/aws-summit-sp-2026/galeria` | Sessão + consentimento | Fotos do álbum privado |
| `/evento/aws-summit-sp-2026/galeria/[photoId]` | Sessão + consentimento | Foto, download e exclusão própria |
| `/meu-gti` | Sessão | Perfil, fotos, curtidas e histórico |
| `/meu-gti/criar` | Participante anônimo | Confirmação do e-mail para tornar o perfil permanente |
| `/meu-gti/definir-senha` | E-mail confirmado | Criação da senha após a confirmação |
| `/meu-gti/entrar` | Público | Login e recuperação de senha |
| `/admin/moderacao` | Sessão administrativa | Aprovar ou excluir pendências |
| `/termos` | Público | Termos de Uso |
| `/privacidade` | Público | Política de Privacidade |

## Supabase

### Auth

Ative **Anonymous Sign-Ins**, o provedor **Email** e **Allow manual linking**. Cada participante recebe um `auth.uid()` próprio; a sessão é mantida nos cookies gerenciados por `@supabase/ssr`. Configure também um SMTP próprio para confirmação e recuperação de senha em produção.

### Banco

- `event_consents`: aceite por usuário/evento/versão.
- `photo_uploads`: usuário, evento, caminho privado, legenda, @ opcional, status e data.
- `photo_likes`: uma curtida por usuário/foto, com remoção pelo próprio usuário.
- `profiles`: nome e Instagram opcionais vinculados ao mesmo `auth.uid()`.
- Novos uploads não enviam `moderation_status` pelo cliente; após a migration interna, o default do banco é `approved`.

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

- Instalação existente: aplique as migrations ainda não registradas, em ordem cronológica, incluindo curtidas, perfis e índices.
- Instalação nova: consulte `supabase/README.md` para a ordem dos scripts.

As migrations são idempotentes e podem ser aplicadas pelo Supabase CLI ou manualmente no SQL Editor.

## Segurança

- Rotas do evento validam sessão no proxy e novamente nos Server Components/Actions.
- A rota de entrada continua pública e valida o código antes do Auth anônimo.
- Consentimento `1.0` é verificado no servidor e nas políticas RLS.
- Participantes não recebem permissão de `UPDATE`; a publicação imediata acontece pelo default protegido do banco.
- A equipe consentida vê as fotos publicadas no evento.
- Exclusão do participante exige `auth.uid() = user_id` e caminho dentro do próprio diretório.
- Moderação usa Service Role somente no servidor e uma sessão assinada, curta e `HttpOnly`.
- O bucket é privado; não existem URLs públicas permanentes.

## Checklist de deploy

- [ ] Ativar Anonymous Sign-Ins no Supabase Auth.
- [ ] Ativar Email, Allow manual linking e SMTP próprio.
- [ ] Executar a migration de hardening no Supabase SQL Editor.
- [ ] Confirmar que `event-photos` está privado e com limite de 10 MB.
- [ ] Configurar as quatro variáveis de ambiente na Vercel, separando Preview e Production.
- [ ] Publicar novamente após as variáveis e a migration.
- [ ] Testar câmera/galeria em um celular real e em HTTPS.
- [ ] Testar envio, aparição imediata na galeria, download e exclusão própria.
- [ ] Confirmar que outro usuário não consegue excluir a foto de outra pessoa.
- [ ] Validar Termos e Política de Privacidade com o responsável jurídico antes do evento.

## Checklist manual

Participante:

1. Home → Entrar no evento.
2. Informar `GALERADOTIAWS`.
3. Aceitar os termos.
4. Enviar uma imagem válida e confirmar que ela aparece imediatamente na galeria.
5. Curtir e descurtir uma foto; recarregar e confirmar a persistência do estado.
6. Baixar o original por URL assinada.
7. Excluir uma foto própria e confirmar que outra pessoa não pode fazê-lo.
8. Criar um perfil, confirmar o e-mail, definir a senha, sair e entrar novamente.
9. Solicitar recuperação de senha e concluir a troca pelo link recebido.

Administrador:

1. Informar o código administrativo configurado no ambiente.
2. Confirmar que `/admin/moderacao` exige sessão administrativa.
3. Excluir uma foto após confirmação.
4. Sair da moderação e confirmar o bloqueio da rota.

## Qualidade

```bash
npm run lint
npm run build
```

Não há suíte automatizada configurada nesta versão; o checklist acima cobre os fluxos integrados que dependem do Supabase.
