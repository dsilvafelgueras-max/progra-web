'use client';
import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from './ProductGrid';
import { products } from '../data/catalog';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const { currency, usdRate, addToCart } = useCart();

  const results = useMemo(() => {
    const normalized = normalize(query.trim());
    if (!normalized) return [];

    return products.filter((p) => {
      const haystack = normalize([p.name, p.category, p.description].join(' '));
      return haystack.includes(normalized);
    });
  }, [query]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    router.replace(trimmed ? `/buscar?q=${encodeURIComponent(trimmed)}` : '/buscar');
  }

  return (
    <main className="react-content">
      <div className="category-header">
        <p className="eyebrow">Buscar</p>
        <h2>Resultados</h2>
        {query.trim() && <p>{results.length} {results.length === 1 ? 'pieza' : 'piezas'} para &quot;{query.trim()}&quot;</p>}
      </div>

      <form className="search-box catalog-search" onSubmit={handleSubmit}>
        <label>
          <span>Buscar</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Anillos, earcuff..."
          />
        </label>
      </form>

      {query.trim() ? (
        <ProductGrid
          products={results}
          currency={currency}
          rate={usdRate}
          formatMoney={formatMoney}
          onAdd={addToCart}
        />
      ) : (
        <section className="empty-grid">
          <h2>Escribi algo para buscar</h2>
          <p>Probá con el nombre, la categoria o una palabra de la descripcion.</p>
        </section>
      )}
    </main>
  );
}
