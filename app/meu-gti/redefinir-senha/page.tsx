import { SetPasswordForm } from "../_components/set-password-form";
import { PasswordShell } from "../definir-senha/page";

export default function ResetPasswordPage() {
  return (
    <PasswordShell title="Crie uma nova senha" description="Escolha uma senha nova para voltar à sua jornada GTI.">
      <SetPasswordForm buttonLabel="Atualizar minha senha" />
    </PasswordShell>
  );
}
