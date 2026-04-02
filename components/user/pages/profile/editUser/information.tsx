
import { nameSchema } from 'lib/schemas/user/nameSchema';
import { emailUpdateSchema } from 'lib/schemas/user/emailUpdateSchema';
import { INTENT_PROFILE_UPDATE_FULL_NAME, INTENT_PROFILE_UPDATE_EMAIL } from 'lib/constants/routes/intents';
import { FaEnvelope, FaLightbulb, FaPenToSquare, FaShieldHalved, FaUser } from 'react-icons/fa6';
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
      {/* Header da seção */}
      <div className="text-center">
        <h2 className="font-montserrat text-2xl font-semibold text-(--text-primary) mb-2">
          Suas Informações Pessoais
        </h2>
        <p className="text-(--text-secondary) flex items-center justify-center gap-2">
          <FaPenToSquare aria-hidden="true" className="text-(--primary-color)" />
          Clique em qualquer campo para editar.
        </p>
      </div>

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

      {/* Seção de ajuda */}
      <div className="mt-8 p-4 bg-(--bg-secondary)/50 border border-(--quaternary-color)/30 rounded-lg">
        <div className="flex items-start gap-3">
          <FaLightbulb aria-hidden="true" className="text-xl text-(--primary-color) mt-0.5" />
          <div>
            <h3 className="font-medium text-(--text-primary) mb-2">Como editar suas informações</h3>
            <div className="text-sm text-(--text-secondary) space-y-1">
              <p><strong>Nome e Email:</strong> Clique no campo, edite e salve.</p>
              <p><strong>Telefone:</strong> Clique, digite novo número, envie SMS e confirme o código.</p>
              <p><strong>Segurança:</strong> Alterações sensíveis requerem verificação adicional.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer de segurança */}
      <div className="mt-6 p-4 bg-(--bg-secondary)/30 rounded-lg border border-(--quaternary-color)/20">
        <div className="flex items-center gap-3">
          <FaShieldHalved aria-hidden="true" className="text-lg text-(--primary-color)" />
          <div className="text-sm text-(--text-secondary)">
            <p><strong>Seus dados estão protegidos</strong> - Todas as alterações são criptografadas e monitoradas por segurança.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
