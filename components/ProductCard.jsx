'use client';
import Link from 'next/link';

export default function ProductCard({ product, price, onAdd }) {
  return (
    <article className="product-card-react">
      <Link href={`/producto/${product.id}`} className="product-card-link">
        <div className={`product-image-react ${product.imageClass ?? ''}`}>
          <img src={product.image} alt={product.name} className={product.imageSizeClass ?? ''} />
        </div>
        <div className="product-copy-react">
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
