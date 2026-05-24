import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pedido confirmado — Sangría" };

// Fallback para usuarios sin sesión o si la API falla
export default function PedidoConfirmadoPage() {
  return (
    <main className="react-content pedido-page">
      <div className="pedido-confirmado">
        <p className="eyebrow">Listo</p>
        <h2>Pedido confirmado</h2>
        <p className="pedido-subtitle">
          Gracias por tu compra. Nos ponemos en contacto a la brevedad.
        </p>
        <Link href="/" className="pedido-back-link">seguir comprando</Link>
      </div>
    </main>
  );
}
