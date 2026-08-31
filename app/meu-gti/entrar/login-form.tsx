"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, LockIcon } from "@/components/gti-ui";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm({ canCreateProfile }: { canCreateProfile: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccess(false);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setLoading(false);
      setMessage("E-mail ou senha incorretos.");
      return;
    }

    router.push("/meu-gti");
    router.refresh();
  }

  async function resetPassword() {
    if (!email.trim()) {
      setSuccess(false);
      setMessage("Digite seu e-mail para recuperar a senha.");
      return;
    }

    setResetting(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/auth/confirm?next=/meu-gti/redefinir-senha`,
      },
    );
    setResetting(false);

    if (error) {
      setSuccess(false);
      setMessage("Não conseguimos enviar a recuperação agora.");
      return;
    }

    setSuccess(true);
    setMessage("Confira seu e-mail para criar uma nova senha.");
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-300">E-mail</span>
        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field min-h-14 normal-case" placeholder="voce@email.com" autoComplete="email" autoCapitalize="none" />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-300">Senha</span>
        <span className="relative block">
          <LockIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-violet-300" />
          <input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="field min-h-14 pl-11 normal-case" placeholder="Sua senha" autoComplete="current-password" />
        </span>
      </label>

      {message && (
        <p role={success ? "status" : "alert"} className={success ? "rounded-xl border border-emerald-300/12 bg-emerald-400/[0.05] px-3 py-2.5 text-xs text-emerald-100/80" : "feedback-error"}>
          {message}
        </p>
      )}

      <button type="submit" disabled={loading || resetting} className="gradient-button w-full text-sm">
        {loading ? "Entrando..." : "Entrar no Meu GTI"}
        {!loading && <ArrowRightIcon className="size-4.5" />}
      </button>

      <button type="button" onClick={() => void resetPassword()} disabled={loading || resetting} className="min-h-11 w-full text-xs font-bold text-violet-300 transition hover:text-white">
        {resetting ? "Enviando recuperação..." : "Esqueci minha senha"}
      </button>

      <div className="border-t border-white/7 pt-5 text-center text-xs text-slate-500">
        {canCreateProfile ? (
          <Link href="/meu-gti/criar" className="font-bold text-violet-300 hover:text-white">Ainda não tem perfil? Criar agora</Link>
        ) : (
          <Link href="/evento/entrar" className="font-bold text-violet-300 hover:text-white">Entre em um evento para criar seu perfil</Link>
        )}
      </div>
    </form>
  );
}
