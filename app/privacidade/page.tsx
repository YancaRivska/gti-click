import { LegalPage } from "@/components/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade" eyebrow="Seus dados, suas escolhas">
      <p>O GTI CLICK cria um identificador anônimo de participante para proteger o acesso ao evento e associar consentimentos e fotos. O aplicativo não exige nome, senha ou e-mail para entrar.</p>
      <p>Quem optar por criar o perfil “Minha jornada GTI” poderá informar nome, e-mail e Instagram. Também registramos os eventos acessados, fotos publicadas e curtidas vinculadas à conta para apresentar o histórico pessoal dentro do aplicativo.</p>
      <p>O perfil é opcional. As credenciais de acesso são processadas pelo Supabase Auth e a Galera do TI não armazena senhas em texto aberto.</p>
      <p>Para registrar o aceite, armazenamos o identificador do usuário, o evento, a versão dos termos e a data do consentimento.</p>
      <p>Esses dados são utilizados para controlar a participação no álbum e comprovar o consentimento apresentado ao usuário.</p>
      <p>Você pode revogar a autorização pela opção disponível na página do evento. Também pode pedir informações, correções, revogação ou tratar de solicitações relacionadas aos seus dados e imagens pelo contato <a href="mailto:administracao@galeradoti.com">administracao@galeradoti.com</a>.</p>
    </LegalPage>
  );
}
