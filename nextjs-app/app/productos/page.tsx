import type { Metadata } from "next";
import ProductosClient from "../../components/ProductosClient";

export const metadata: Metadata = { title: "Productos — Sangria" };

export default function ProductosPage() {
  return <ProductosClient />;
}
