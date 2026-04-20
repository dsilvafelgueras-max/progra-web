'use client';
import Link from 'next/link';

export default function ProductCard({ product, price, onAdd }) {
  return (
    <article className="product-card-react">
      <Link href={`/producto/${product.id}`} className="product-card-link">
        <div className="product-image-react">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-copy-react">
          <p>{product.category}</p>
          <h3>{product.name}</h3>
          <span>{price}</span>
        </div>
      </Link>
      <button type="button" onClick={() => onAdd(product.id)}>
        Agregar
      </button>
    </article>
  );
}
