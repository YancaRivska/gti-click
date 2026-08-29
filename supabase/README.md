# SQL do GTI CLICK

Os scripts desta pasta são executados manualmente no SQL Editor do Supabase. Nenhum deles contém credenciais.

## Projeto existente

Execute somente:

```text
migrations/20260829_launch_hardening.sql
migrations/20260829_auto_publish_team_photos.sql
```

O primeiro script consolida colunas e políticas. O segundo converte pendências existentes e configura novos uploads da equipe como `approved`, sem liberar `UPDATE` para o cliente.

## Projeto novo

Execute nesta ordem:

1. `event_consents.sql`
2. `photo_uploads.sql`

Os demais arquivos da raiz são migrations históricas mantidas para rastreabilidade. Não execute todos em sequência sobre uma instalação nova.

## Verificação após aplicar

- `event-photos` deve permanecer privado.
- Tamanho máximo: 10 MB.
- MIME types: JPEG, PNG e WebP.
- Participantes inserem somente em `aws-summit-sp-2026/<auth.uid()>/`.
- Novas fotos recebem `moderation_status = 'approved'` pelo default do banco.
- Fotos publicadas são visíveis a participantes consentidos.
- Fotos pendentes/rejeitadas só são consultáveis pelo próprio autor.
- Participantes não têm permissão de `UPDATE` em `photo_uploads`.
- Exclusão só alcança registros e objetos do próprio usuário.

Antes de executar em produção, faça backup e revise as políticas existentes no painel do Supabase.
