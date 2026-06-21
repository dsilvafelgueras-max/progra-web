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
          className={`product-fav-btn${saved ? ' is-saved' : ''}`}
          aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          onClick={() => toggle(product.id)}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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
