'use client';
import { useState } from 'react';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

export default function ProductDetailClient({ product }) {
  const { currency, usdRate, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  function increase() {
    setQuantity((current) => current + 1);
  }

  function decrease() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function handleAdd() {
    for (let i = 0; i < quantity; i += 1) addToCart(product.id);
  }

  return (
    <main className="react-content">
      <article className="product-detail">
        <div className={`product-detail-image ${product.imageClass ?? ''}`}>
          <img src={product.image} alt={product.name} className={product.imageSizeClass ?? ''} />
        </div>
        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-desc">{product.description}</p>
          <strong className="product-detail-price">
            {formatMoney(product.priceArs, currency, usdRate)}
          </strong>
          <div className="product-detail-actions-react">
            <div className="quantity-picker-react">
              <button type="button" onClick={decrease}>
                -
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={increase}>
                +
              </button>
            </div>
            <button type="button" className="primary-button-react" onClick={handleAdd}>
              Agregar al carrito
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}
