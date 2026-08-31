"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, LockIcon } from "@/components/gti-ui";
import { createClient } from "@/lib/supabase/browser";

export function SetPasswordForm({ buttonLabel = "Criar minha senha" }: { buttonLabel?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setMessage("Use pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setMessage("As senhas não são iguais.");
      return;
    }

    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setLoading(false);
      setMessage("Não conseguimos salvar sua senha. Abra novamente o link do e-mail.");
      return;
    }

    router.push("/meu-gti");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-300">Nova senha</span>
        <span className="relative block">
          <LockIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-violet-300" />
          <input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="field min-h-14 pl-11 normal-case" placeholder="Mínimo de 8 caracteres" autoComplete="new-password" />
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-300">Confirme a senha</span>
        <input required type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="field min-h-14 normal-case" placeholder="Digite novamente" autoComplete="new-password" />
      </label>

      {message && <p role="alert" className="feedback-error">{message}</p>}

      <button type="submit" disabled={loading} className="gradient-button w-full text-sm">
        <CheckIcon className="size-5" />
        {loading ? "Salvando..." : buttonLabel}
      </button>
    </form>
  );
}
