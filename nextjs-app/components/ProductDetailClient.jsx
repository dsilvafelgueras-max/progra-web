'use client';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

export default function ProductDetailClient({ product }) {
  const { currency, usdRate, addToCart } = useCart();

  return (
    <main className="react-content">
      <article className="product-detail">
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <p className="eyebrow">{product.category}</p>
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-desc">{product.description}</p>
          <strong className="product-detail-price">
            {formatMoney(product.priceArs, currency, usdRate)}
          </strong>
          <button
            type="button"
            className="primary-button-react"
            onClick={() => addToCart(product.id)}
          >
            Agregar al carrito
          </button>
        </div>
      </article>
    </main>
  );
}
