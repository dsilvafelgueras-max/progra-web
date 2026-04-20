'use client';
import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import FilterBar from './FilterBar';
import ProductGrid from './ProductGrid';
import { categories, products } from '../data/catalog';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

export default function CatalogClient() {
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { currency, usdRate, addToCart } = useCart();

  const visibleProducts = useMemo(() => {
    const normalized = deferredSearch
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');

    return products
      .filter((p) => activeCategory === 'Todas' || p.category === activeCategory)
      .filter((p) => {
        if (!normalized) return true;
        const haystack = [p.name, p.category, p.description]
          .join(' ')
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '');
        return haystack.includes(normalized);
      });
  }, [activeCategory, deferredSearch]);

  return (
    <main className="react-content">
      <label className="search-box catalog-search">
        <span>Buscar</span>
        <input
          type="search"
          value={search}
          onChange={(e) => startTransition(() => setSearch(e.target.value))}
          placeholder="Anillos, earcuff..."
        />
      </label>

      <FilterBar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <ProductGrid
        products={visibleProducts}
        currency={currency}
        rate={usdRate}
        formatMoney={formatMoney}
        onAdd={addToCart}
      />
    </main>
  );
}
