'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import { products } from '../data/catalog';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

export default function HomeProductCarousel() {
  const trackRef = useRef(null);
  const { currency, usdRate, addToCart } = useCart();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateControls = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateControls();
    window.addEventListener('resize', updateControls);
    return () => window.removeEventListener('resize', updateControls);
  }, [updateControls]);

  function scroll(direction) {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.querySelector('.product-card-react');
    const gap = Number.parseFloat(window.getComputedStyle(el).columnGap || '16');
    const step = firstCard ? firstCard.getBoundingClientRect().width + gap : 320;
    el.scrollBy({ left: step * direction, behavior: 'smooth' });
    window.setTimeout(updateControls, 220);
  }

  return (
    <section className="section catalog react-content">
      <div className="section-heading catalog-heading">
        <p className="section-tag">Tienda</p>
      </div>
      <div className="catalog-carousel">
        <button
          type="button"
          className="catalog-arrow"
          onClick={() => scroll(-1)}
          disabled={!canPrev}
          aria-label="Ver productos anteriores"
        >
          ‹
        </button>

        <div className="product-carousel" ref={trackRef} onScroll={updateControls}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              price={formatMoney(product.priceArs, currency, usdRate)}
              onAdd={addToCart}
            />
          ))}
        </div>

        <button
          type="button"
          className="catalog-arrow"
          onClick={() => scroll(1)}
          disabled={!canNext}
          aria-label="Ver mas productos"
        >
          ›
        </button>
      </div>
    </section>
  );
}
