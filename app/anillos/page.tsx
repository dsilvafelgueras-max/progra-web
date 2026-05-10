import type { Metadata } from "next";
import { products } from "../../data/catalog";
import CategoryGrid from "../../components/CategoryGrid";

export const metadata: Metadata = { title: "Anillos" };

export default function AnillosPage() {
  const anillos = products.filter((p) => p.category === "Anillos");

  return (
    <main className="react-content">
      <div className="category-header">
        <p className="eyebrow">Coleccion</p>
        <h2>Anillos</h2>
        <p>{anillos.length} piezas</p>
      </div>
      <CategoryGrid products={anillos} />
    </main>
  );
}
