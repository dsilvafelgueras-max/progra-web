'use client';
import CheckoutForm from './CheckoutForm';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

export default function CheckoutPageClient() {
  const { cartItems, currency, usdRate } = useCart();

  return (
    <main className="react-content">
      <CheckoutForm
        items={cartItems}
        currency={currency}
        rate={usdRate}
        formatMoney={formatMoney}
      />
    </main>
  );
}
