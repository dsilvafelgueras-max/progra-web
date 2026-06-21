'use client';
import { useState } from 'react';
import { products as allProducts } from '../data/catalog';
import CategoryGrid from './CategoryGrid';

const CATEGORIES = ['Todos', 'Anillos', 'Aros', 'Collares', 'Earcuff', 'Pulseras'];

const catalog = allProducts.filter((p) => !p.isGiftCard);

export default function ProductosClient() {
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filtered =
    activeFilter === 'Todos'
      ? catalog
      : catalog.filter((p) => p.category === activeFilter);

  return (
    <main className="react-content">
      <div className="category-header">
        <p className="eyebrow">Colección</p>
        <h2>Productos</h2>
        <p>{filtered.length} piezas</p>
      </div>

      <div className="productos-filters">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`productos-filter-btn${activeFilter === cat ? ' is-active' : ''}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <CategoryGrid products={filtered} />
    </main>
  );
}
