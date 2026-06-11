'use client';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import { formatMoney } from '../lib/currency';

export default function CartOverlays() {
  const { cartItems, currency, usdRate, cartOpen, setCartOpen, removeFromCart } = useCart();

  if (!cartOpen) return null;

  return (
    <div className="overlay-react" onClick={() => setCartOpen(false)}>
      <div onClick={(e) => e.stopPropagation()}>
        <CartDrawer
          items={cartItems}
          currency={currency}
          rate={usdRate}
          formatMoney={formatMoney}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
        />
      </div>
    </div>
  );
}
