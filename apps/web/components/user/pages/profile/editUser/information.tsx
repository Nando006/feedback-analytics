
import { nameSchema } from 'lib/schemas/user/nameSchema';
import { emailUpdateSchema } from 'lib/schemas/user/emailUpdateSchema';
import { INTENT_PROFILE_UPDATE_FULL_NAME, INTENT_PROFILE_UPDATE_EMAIL } from 'src/lib/constants/routes/intents';
import { FaEnvelope, FaUser } from 'react-icons/fa6';
import EditableFieldFixed from './EditableFieldFixed';
import PhoneEditableField from './PhoneEditableField';
import type { InformationProps } from './ui.types';

export default function Information({
  defaultFullName = '',
  defaultEmail = '',
  defaultPhone = '',
}: InformationProps) {
  // Garantir que os valores nunca sejam undefined
  const safeName = defaultFullName || '';
  const safeEmail = defaultEmail || '';
  const safePhone = defaultPhone || '';

  return (
    <div className="space-y-6">

      {/* Grid de campos editáveis */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Nome completo */}
        <EditableFieldFixed
          label="Nome completo"
          value={safeName}
          placeholder="Digite seu nome completo"
          type="text"
          icon={<FaUser aria-hidden="true" className="text-(--primary-color)" />}
          schema={nameSchema}
          intent={INTENT_PROFILE_UPDATE_FULL_NAME}
          description="Nome que aparecerá em seu perfil público"
          hint="Use seu nome real para melhor identificação"
          successMessage="Nome atualizado!"
          errorMessage="Erro ao atualizar nome"
          className="md:col-span-1"
        />

        {/* Email */}
        <EditableFieldFixed
          label="Email"
          value={safeEmail}
          placeholder="seu@email.com"
          type="email"
          icon={<FaEnvelope aria-hidden="true" className="text-(--primary-color)" />}
          schema={emailUpdateSchema}
          intent={INTENT_PROFILE_UPDATE_EMAIL}
          description="Usado para notificações e login"
          hint="Após alterar, confirme nos dois emails (antigo e novo)"
          successMessage="Email atualizado!"
          errorMessage="Erro ao atualizar email"
          className="md:col-span-1"
        />
      </div>

      {/* Telefone (largura completa devido ao processo especial) */}
      <PhoneEditableField
        currentPhone={safePhone}
        className="w-full"
      />
    </div>
  );
}
