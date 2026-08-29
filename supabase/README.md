# SQL do GTI CLICK

Os scripts desta pasta são executados manualmente no SQL Editor do Supabase. Nenhum deles contém credenciais.

## Projeto existente

Execute somente:

```text
migrations/20260829_launch_hardening.sql
```

Essa migration adiciona as colunas opcionais ausentes, preserva fotos antigas como aprovadas, força novos uploads como pendentes, mantém o bucket privado e substitui as políticas de leitura/exclusão pelas versões restritas.

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
- Novas fotos recebem `moderation_status = 'pending'`.
- Fotos aprovadas são visíveis a participantes consentidos.
- Fotos pendentes/rejeitadas só são consultáveis pelo próprio autor.
- Participantes não têm permissão de `UPDATE` em `photo_uploads`.
- Exclusão só alcança registros e objetos do próprio usuário.

Antes de executar em produção, faça backup e revise as políticas existentes no painel do Supabase.
