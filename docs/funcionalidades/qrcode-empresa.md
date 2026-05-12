# Funcionalidade — QR Code da Empresa

## O Que É

Cada empresa recebe um **QR Code de empresa** que direciona clientes para o formulário geral de feedback — sem segmentação por produto ou serviço. É o ponto de entrada mais simples para coleta.

Além do QR Code geral, cada item do catálogo (produto, serviço, departamento) recebe seu **próprio QR Code**, permitindo coleta segmentada.

## Por Que Existe

O QR Code elimina o atrito da coleta presencial. O cliente não precisa instalar nada, criar conta ou acessar um link digitado. Um scan é suficiente para chegar ao formulário correto, no contexto correto.

## Como Funciona

1. O cliente escaneia o QR Code físico com a câmera do celular
2. É redirecionado para a URL pública única daquele ponto de coleta
3. O frontend resolve o formulário configurado via API Gateway
4. O cliente preenche a avaliação — nota, mensagem e respostas às perguntas dinâmicas
5. O formulário é submetido com o **fingerprint do dispositivo** (proteção anti-spam)
6. Confirmação de sucesso é exibida sem necessidade de login

---

## Tipos de QR Code

| Tipo | Rota de Gestão | Escopo de Análise |
|---|---|---|
| **Empresa** | `/user/qrcode/enterprise` | `COMPANY` |
| **Produtos** | `/user/qrcode/products` | `PRODUCT` |
| **Serviços** | `/user/qrcode/services` | `SERVICE` |
| **Departamentos** | `/user/qrcode/departments` | `DEPARTMENT` |

---

## QR Code no Perfil

A partir desta release, o perfil da empresa (`/user/profile`) inclui uma **seção dedicada ao QR Code** com:

- Visualização inline do QR Code
- Botão de compartilhamento (copia a URL para a área de transferência)

---

## Proteção Anti-Spam

O sistema gera um **fingerprint único por dispositivo** via a função de banco `generate_device_fingerprint`. O registro é salvo na tabela `tracked_devices` por ponto de coleta, impedindo múltiplos envios do mesmo dispositivo num intervalo de tempo configurado.

---

## Actions Relacionadas

| Action | Intent | Efeito |
|---|---|---|
| `ActionQrCodeEnterprise` | `enable` / `disable` | Ativa ou desativa o QR Code da empresa |
| `ActionQrCodeCatalog` | `enable` / `disable` | Ativa ou desativa QR Code de item de catálogo |
| `ActionPublicQrCodeFeedback` | — | Processa submissão pública de feedback |

---

## Troubleshooting

| Problema | Causa | Solução |
|---|---|---|
| QR Code não aparece no perfil | Tipo não ativado | Ative o tipo em `/user/edit/types-feedback` |
| Submissão bloqueada sem mensagem | Fingerprint duplicado (cooldown) | O dispositivo enviou feedback recentemente — aguarde |
| Formulário carrega sem perguntas | Item sem perguntas configuradas | Configure perguntas em `/user/edit/feedback-products` (ou services/departments) |

---

## Referência Técnica

- [Endpoints Públicos](../backend/endpoints.md)
- [Regras de Negócio — Coleta](../backend/regras-negocio.md)
