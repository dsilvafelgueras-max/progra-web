import type { Metadata } from "next";
import PedidoClient from "../../../components/PedidoClient";

export const metadata: Metadata = { title: "Pedido confirmado — Sangría" };

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PedidoClient orderId={id} />;
}
