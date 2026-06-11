'use client';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

export default function ProductDetailClient({ product }) {
  const { currency, usdRate, addToCart } = useCart();
  const isGiftCard = product.isGiftCard === true;
  const price = formatMoney(product.priceArs, currency, usdRate);

  return (
    <main className="react-content">
      <article className={`product-detail${isGiftCard ? ' gift-card-detail' : ''}`}>
        {isGiftCard ? (
          <div className="gift-card-visual-react gift-card-detail-visual">
            <img src={product.giftImage ?? product.image} alt="" aria-hidden="true" />
            <div className="gift-card-visual-content">
              <span className="gift-card-brand-react">SANGRIA</span>
              <div>
                <span className="gift-card-label-react">GIFT CARD</span>
                <strong>{price.replace('ARS ', '$')}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
          </div>
        )}
        <div className="product-detail-info">
          <p className="eyebrow">{product.category}</p>
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-desc">{product.description}</p>
          <strong className="product-detail-price">
            {price}
          </strong>
          {isGiftCard && product.details?.length ? (
            <div className="gift-card-detail-box">
              <p>Datos de la card</p>
              <ul>
                {product.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          ) : null}
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
