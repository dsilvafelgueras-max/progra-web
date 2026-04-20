'use client';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, currency, rate, formatMoney, onAdd }) {
  if (products.length === 0) {
    return (
      <section className="empty-grid">
        <h2>No encontramos productos para ese filtro</h2>
        <p>Proba con otra categoria o con una busqueda menos especifica.</p>
      </section>
    );
  }

  return (
    <section className="product-grid-react">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          price={formatMoney(product.priceArs, currency, rate)}
          onAdd={onAdd}
        />
      ))}
    </section>
  );
}
