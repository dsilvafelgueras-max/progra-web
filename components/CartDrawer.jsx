'use client';
import Link from 'next/link';

export default function CartDrawer({ items, currency, rate, formatMoney, onClose, onRemove }) {
  const total = items.reduce((acc, item) => acc + item.priceArs * item.quantity, 0);

  return (
    <aside className="cart-drawer-react">
      <div className="cart-drawer-head">
        <div>
          <p className="eyebrow">Carrito</p>
          <h2>Tu seleccion</h2>
        </div>
        <button type="button" className="ghost-button-react" onClick={onClose}>
          Cerrar
        </button>
      </div>

      <div className="cart-drawer-items">
        {items.length === 0 ? (
          <p className="cart-empty">No agregaste productos todavia.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="cart-row-react">
              <div>
                <h3>{item.name}</h3>
                <p>
                  {item.category} · {item.quantity} unidad{item.quantity > 1 ? 'es' : ''}
                </p>
              </div>
              <div className="cart-row-side">
                <strong>{formatMoney(item.priceArs * item.quantity, currency, rate)}</strong>
                <button type="button" onClick={() => onRemove(item.id)}>
                  Quitar
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="cart-drawer-footer">
        <div className="cart-total-react">
          <span>Total</span>
          <strong>{formatMoney(total, currency, rate)}</strong>
        </div>
        <Link href="/checkout" className="primary-button-react btn-link" onClick={onClose}>
          Finalizar compra
        </Link>
      </div>
    </aside>
  );
}
