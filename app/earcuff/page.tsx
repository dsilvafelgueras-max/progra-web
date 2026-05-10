import type { Metadata } from "next";
import { products } from "../../data/catalog";
import CategoryGrid from "../../components/CategoryGrid";

export const metadata: Metadata = { title: "Earcuff" };

export default function EarcuffPage() {
  const earcuffs = products.filter((p) => p.category === "Earcuff");

  return (
    <main className="react-content">
      <div className="category-header">
        <p className="eyebrow">Coleccion</p>
        <h2>Earcuff</h2>
        <p>{earcuffs.length} piezas</p>
      </div>
      <CategoryGrid products={earcuffs} />
    </main>
  );
}
