import type { Metadata } from "next";
import { products } from "../../data/catalog";
import CategoryGrid from "../../components/CategoryGrid";

export const metadata: Metadata = { title: "Collares" };

export default function CollaresPage() {
  const collares = products.filter((p) => p.category === "Collares");

  return (
    <main className="react-content">
      <div className="category-header">
        <p className="eyebrow">Coleccion</p>
        <h2>Collares</h2>
        <p>{collares.length > 0 ? `${collares.length} piezas` : "Proximamente"}</p>
      </div>
      <CategoryGrid products={collares} />
    </main>
  );
}
