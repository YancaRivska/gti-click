"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  InstagramIcon,
  LockIcon,
  UsersIcon,
} from "@/components/gti-ui";
import { normalizeInstagramHandle } from "@/lib/profile";
import { createClient } from "@/lib/supabase/browser";

function profileCreationError(code?: string) {
  if (code === "over_email_send_rate_limit") {
    return "Muitas confirmações foram solicitadas agora. Aguarde alguns minutos e tente novamente.";
  }

  if (code === "email_exists" || code === "user_already_exists") {
    return "Este e-mail já possui uma conta. Use a opção Entrar no Meu GTI.";
  }

  if (code === "email_address_invalid") {
    return "Este endereço de e-mail não foi aceito. Confira se ele foi digitado corretamente.";
  }

  return "Não conseguimos enviar a confirmação agora. Tente novamente em alguns minutos.";
}

export function CreateProfileForm({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = name.trim().replace(/\s+/g, " ");
    const normalizedInstagram = normalizeInstagramHandle(instagram);

    if (displayName.length < 2 || displayName.length > 60) {
      setMessage("Digite um nome entre 2 e 60 caracteres.");
      return;
    }

    if (normalizedInstagram && normalizedInstagram.length > 50) {
      setMessage("Seu @ deve ter no máximo 50 caracteres.");
      return;
    }

    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const now = new Date().toISOString();
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        display_name: displayName,
        instagram_handle: normalizedInstagram,
        updated_at: now,
      },
      { onConflict: "user_id" },
    );

    if (profileError) {
      setLoading(false);
      setMessage("Não conseguimos criar seu perfil agora.");
      return;
    }

    const { error } = await supabase.auth.updateUser(
      {
        email: email.trim().toLowerCase(),
        data: {
          display_name: displayName,
          instagram_handle: normalizedInstagram,
        },
      },
      {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/meu-gti/definir-senha`,
      },
    );

    setLoading(false);

    if (error) {
      setMessage(profileCreationError(error.code));
      return;
    }

    setComplete(true);
  }

  if (complete) {
    return (
      <section className="mt-7 rounded-[1.5rem] border border-emerald-300/15 bg-emerald-400/[0.055] p-5 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-400/12 text-emerald-200">
          <CheckIcon className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-black text-white">Confira seu e-mail</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Abra o link que enviamos. Depois da confirmação, você criará sua senha e o perfil ficará ativo.
        </p>
        <Link href="/meu-gti" className="secondary-button mt-5 w-full text-sm">Voltar para Minha jornada</Link>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-300">Seu nome</span>
        <span className="relative block">
          <UsersIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-violet-300" />
          <input required minLength={2} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} className="field min-h-14 pl-11" placeholder="Como a galera te chama?" autoComplete="name" />
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-300">Seu @ do Instagram <span className="font-normal text-slate-600">(opcional)</span></span>
        <span className="relative block">
          <InstagramIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-fuchsia-300" />
          <input maxLength={50} value={instagram} onChange={(event) => setInstagram(event.target.value)} className="field min-h-14 pl-11" placeholder="@seuinstagram" autoCapitalize="none" autoCorrect="off" />
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-300">E-mail</span>
        <span className="relative block">
          <LockIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-violet-300" />
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field min-h-14 pl-11 normal-case" placeholder="voce@email.com" autoComplete="email" autoCapitalize="none" />
        </span>
      </label>

      <p className="rounded-xl bg-violet-500/[0.055] px-3 py-2.5 text-[0.68rem] leading-relaxed text-slate-500">
        Primeiro confirme o e-mail. Em seguida, você cria a senha com segurança sem perder fotos, curtidas ou eventos.
      </p>

      {message && <p role="alert" className="feedback-error">{message}</p>}

      <button type="submit" disabled={loading} className="gradient-button w-full text-sm">
        {loading ? "Enviando confirmação..." : "Confirmar meu e-mail"}
        {!loading && <ArrowRightIcon className="size-4.5" />}
      </button>
    </form>
  );
}
