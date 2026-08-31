import { LegalPage } from "@/components/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Termos de Uso" eyebrow="Regras da comunidade">
      <p>O GTI CLICK é um álbum colaborativo para participantes dos eventos da Galera do TI. O acesso exige autenticação e aceite dos termos do evento.</p>
      <p>A criação de um perfil permanente é opcional. Ao criá-lo, você é responsável por manter sua senha protegida e utilizar informações verdadeiras e adequadas à comunidade.</p>
      <p>Ao enviar uma imagem, você declara que pode compartilhá-la e que ela poderá ser visualizada e baixada pelos participantes autorizados do álbum.</p>
      <p>As imagens enviadas poderão ser utilizadas pela Galera do TI na produção e divulgação de conteúdos relacionados à comunidade, aos eventos e às redes sociais, conforme o consentimento registrado.</p>
      <p>Não envie conteúdo ilegal, ofensivo ou que viole a privacidade e os direitos de outras pessoas.</p>
      <p>Dúvidas ou solicitações podem ser enviadas para <a href="mailto:administracao@galeradoti.com">administracao@galeradoti.com</a>.</p>
    </LegalPage>
  );
}
