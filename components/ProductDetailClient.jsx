'use client';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

export default function ProductDetailClient({ product }) {
  const { currency, usdRate, addToCart } = useCart();
  const isGiftCard = product.isGiftCard === true;
  const price = formatMoney(product.priceArs, currency, usdRate);
  const installment = formatMoney(Math.round(product.priceArs / 3), currency, usdRate);

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
          {!isGiftCard && (
            <div className="payment-summary">
              <p className="payment-summary-line">3 cuotas sin interés de {installment}</p>
              <p className="payment-summary-line">10% de descuento pagando con transferencia o depósito bancario</p>
            </div>
          )}
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
          {!isGiftCard && (
            <div className="product-accordion">
              <details className="product-accordion-item">
                <summary className="product-accordion-trigger">Cambios y devoluciones</summary>
                <div className="product-accordion-body">
                  <p>Aceptamos cambios dentro de los 30 días de recibido el pedido, siempre que la pieza esté en condiciones originales y sin uso. Para iniciar un cambio, escribinos a través del formulario de contacto o por Instagram con tu número de pedido.</p>
                </div>
              </details>
              <details className="product-accordion-item">
                <summary className="product-accordion-trigger">Envíos y retiros</summary>
                <div className="product-accordion-body">
                  <p>Realizamos envíos a todo el país a través de correo privado. El tiempo de preparación es de 2 a 5 días hábiles. También podés coordinar retiro en nuestro taller en Buenos Aires escribiéndonos antes.</p>
                </div>
              </details>
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
