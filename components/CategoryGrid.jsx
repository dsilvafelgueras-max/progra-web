'use client';
import ProductGrid from './ProductGrid';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

export default function CategoryGrid({ products }) {
  const { currency, usdRate, addToCart } = useCart();

  return (
    <ProductGrid
      products={products}
      currency={currency}
      rate={usdRate}
      formatMoney={formatMoney}
      onAdd={addToCart}
    />
  );
}
