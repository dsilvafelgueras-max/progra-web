'use client';
import Link from 'next/link';
import { useFavorites } from '../context/FavoritesContext';

export default function ProductCard({ product, price, onAdd }) {
  const isGiftCard = product.isGiftCard === true;
  const { isFavorite, toggle } = useFavorites();
  const saved = isFavorite(product.id);

  return (
    <article className={`product-card-react${isGiftCard ? ' gift-card-product' : ''}`}>
      {!isGiftCard && (
        <button
          type="button"
          className="product-fav-btn"
          aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          onClick={() => toggle(product.id)}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="22" height="22">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill={saved ? '#1A0A10' : 'none'}
              stroke="#1A0A10"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

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
