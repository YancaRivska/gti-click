import Link from "next/link";
import { redirect } from "next/navigation";
import { safeReturnPath } from "@/lib/return-path";
import { createClient } from "@/lib/supabase/server";
import { EmailOtpForm } from "./email-otp-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const next = safeReturnPath(query.next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(next);
  }

  return (
    <main className="home-shell relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-10">
      <div className="lens" aria-hidden="true" />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0d1a]/90 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
        <Link href="/" className="text-xs font-bold tracking-[0.18em] text-violet-300">
          ← GTI CLICK
        </Link>

        <h1 className="mt-8 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Entre com segurança
        </h1>
        <p className="mt-3 leading-relaxed text-slate-300">
          Vamos enviar um código de acesso para o seu e-mail.
        </p>

        <div className="mt-8">
          <EmailOtpForm next={next} />
        </div>
      </section>
    </main>
  );
}
