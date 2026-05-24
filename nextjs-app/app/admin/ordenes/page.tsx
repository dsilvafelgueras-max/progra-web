import type { Metadata } from "next";
import AdminOrdenesClient from "../../../components/AdminOrdenesClient";

export const metadata: Metadata = { title: "Admin — Órdenes" };

export default function AdminOrdenesPage() {
  return <AdminOrdenesClient />;
}
