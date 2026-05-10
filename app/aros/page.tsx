import type { Metadata } from "next";
import { products } from "../../data/catalog";
import CategoryGrid from "../../components/CategoryGrid";

export const metadata: Metadata = { title: "Aros" };

export default function ArosPage() {
  const aros = products.filter((p) => p.category === "Aros");

  return (
    <main className="react-content">
      <div className="category-header">
        <p className="eyebrow">Coleccion</p>
        <h2>Aros</h2>
        <p>{aros.length > 0 ? `${aros.length} piezas` : "Proximamente"}</p>
      </div>
      <CategoryGrid products={aros} />
    </main>
  );
}
