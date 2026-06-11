'use client';
import Link from 'next/link';

export default function ProductCard({ product, price, onAdd }) {
  const isGiftCard = product.isGiftCard === true;

  return (
    <article className={`product-card-react${isGiftCard ? ' gift-card-product' : ''}`}>
      <Link href={`/producto/${product.id}`} className="product-card-link">
        {isGiftCard ? (
          <div className="gift-card-visual-react">
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
          <>
            <div className="product-image-react">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-copy-react">
              <p>{product.category}</p>
              <h3>{product.name}</h3>
              <span>{price}</span>
            </div>
          </>
        )}
      </Link>
      <button type="button" onClick={() => onAdd(product.id)}>
        {isGiftCard ? 'Agregar al carrito' : 'Agregar'}
      </button>
    </article>
  );
}
