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
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="20" height="20">
            <path
              d="M12 20C6 16 2 13 2 8.5C2 5.4 4.4 3 7.5 3C9.3 3 10.9 3.8 12 5.1C13.1 3.8 14.7 3 16.5 3C19.6 3 22 5.4 22 8.5C22 13 18 16 12 20Z"
              fill={saved ? '#1A0A10' : 'none'}
              stroke="#1A0A10"
              strokeWidth="1.8"
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
