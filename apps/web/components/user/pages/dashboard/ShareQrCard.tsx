import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

/**
 * CTA compacto de compartilhamento: um mini QR Code decorativo (com linha de
 * leitura deslizante) que leva ao formulário/QR do escopo selecionado. O
 * destino (`to`) é calculado no dashboard e varia conforme o escopo.
 *
 * O QR é apenas ilustrativo — o código real (escaneável) vive na tela de
 * configuração do formulário, para onde este atalho aponta.
 */

// Módulos de dados do QR ilustrativo (posições em viewBox 100x100, fora dos
// três "olhos" de canto). Sem valor escaneável — só estética.
const QR_MODULES: ReadonlyArray<readonly [number, number]> = [
  [40, 10], [51, 10], [40, 21],
  [40, 40], [51, 51], [62, 40], [40, 62], [51, 40], [62, 62],
  [70, 40], [81, 51], [70, 62],
  [40, 70], [51, 81], [62, 70],
  [70, 70], [81, 81], [70, 81], [81, 70],
];

function QrEye({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={22}
        height={22}
        rx={5}
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
      />
      <rect x={x + 7} y={y + 7} width={8} height={8} rx={2} fill="currentColor" />
    </>
  );
}

export default function ShareQrCard({ to }: { to: string }) {
  return (
    <Link
      to={to}
      aria-label="Compartilhar o formulário de feedback pelo QR Code"
      className="group flex items-center gap-4 rounded-xl border border-(--primary-color)/25 bg-(--primary-color)/8 px-4 py-3 transition-all hover:border-(--primary-color)/50 hover:bg-(--primary-color)/12"
    >
      <span className="qr-anim relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-(--primary-color)/30 bg-(--bg-primary)/40">
        <svg
          viewBox="0 0 100 100"
          aria-hidden
          className="h-10 w-10 text-(--text-primary)"
        >
          <QrEye x={8} y={8} />
          <QrEye x={70} y={8} />
          <QrEye x={8} y={70} />
          {QR_MODULES.map(([x, y]) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={8}
              height={8}
              rx={2}
              fill="currentColor"
            />
          ))}
        </svg>
        <span className="qr-anim__scan" aria-hidden />
      </span>

      <span className="min-w-0">
        <span className="font-poppins flex items-center gap-1.5 text-sm font-semibold text-(--text-primary)">
          Utilize o QR Code
          <FaArrowRight className="text-[0.65rem] text-(--primary-color) transition-transform group-hover:translate-x-0.5" />
        </span>
        <span className="mt-0.5 block text-xs text-(--text-tertiary)">
          Compartilhe o formulário e colete feedbacks
        </span>
      </span>
    </Link>
  );
}
