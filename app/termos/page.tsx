import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="home-shell min-h-svh px-5 py-10 text-slate-300">
      <article className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[#0b0d1a]/95 p-6 shadow-2xl sm:p-9">
        <Link href="/" className="text-xs font-bold tracking-[0.18em] text-violet-300">
          ← GTI CLICK
        </Link>
        <h1 className="mt-8 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Termos de Uso
        </h1>

        <div className="mt-7 space-y-5 leading-relaxed">
          <p>
            O GTI CLICK é um álbum colaborativo para participantes dos eventos da Galera do TI. O acesso exige autenticação e aceite dos termos do evento.
          </p>
          <p>
            Ao enviar uma imagem, você declara que pode compartilhá-la e que ela poderá ser visualizada e baixada pelos participantes autorizados do álbum.
          </p>
          <p>
            As imagens enviadas poderão ser utilizadas pela Galera do TI na produção e divulgação de conteúdos relacionados à comunidade, aos eventos e às redes sociais, conforme o consentimento registrado.
          </p>
          <p>
            Não envie conteúdo ilegal, ofensivo ou que viole a privacidade e os direitos de outras pessoas.
          </p>
          <p>
            Dúvidas ou solicitações podem ser enviadas para administracao@galeradoti.com.
          </p>
        </div>
      </article>
    </main>
  );
}
