import type { Metadata } from "next";
import CuentaClient from "../../components/CuentaClient";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function CuentaPage() {
  return <CuentaClient />;
}
