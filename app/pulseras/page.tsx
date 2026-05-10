import type { Metadata } from "next";
import { products } from "../../data/catalog";
import CategoryGrid from "../../components/CategoryGrid";

export const metadata: Metadata = { title: "Pulseras" };

export default function PulserasPage() {
  const pulseras = products.filter((p) => p.category === "Pulseras");

  return (
    <main className="react-content">
      <div className="category-header">
        <p className="eyebrow">Coleccion</p>
        <h2>Pulseras</h2>
        <p>{pulseras.length} piezas</p>
      </div>
      <CategoryGrid products={pulseras} />
    </main>
  );
}
