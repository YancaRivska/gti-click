import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="home-shell min-h-svh px-5 py-10 text-slate-300">
      <article className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[#0b0d1a]/95 p-6 shadow-2xl sm:p-9">
        <Link href="/" className="text-xs font-bold tracking-[0.18em] text-violet-300">
          ← GTI CLICK
        </Link>
        <h1 className="mt-8 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Política de Privacidade
        </h1>

        <div className="mt-7 space-y-5 leading-relaxed">
          <p>
            O GTI CLICK utiliza os dados da autenticação para identificar o participante e proteger o acesso aos eventos. O e-mail não é exibido publicamente.
          </p>
          <p>
            Para registrar o aceite, armazenamos o identificador do usuário, o evento, a versão dos termos e a data do consentimento.
          </p>
          <p>
            Esses dados são utilizados para controlar a participação no álbum e comprovar o consentimento apresentado ao usuário.
          </p>
          <p>
            Você pode revogar a autorização pela opção disponível na página do evento. Também pode pedir informações, correções, revogação ou tratar de solicitações relacionadas aos seus dados e imagens pelo contato administracao@galeradoti.com.
          </p>
        </div>
      </article>
    </main>
  );
}
