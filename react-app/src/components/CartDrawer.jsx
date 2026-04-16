export default function CartDrawer({
  items,
  currency,
  rate,
  formatMoney,
  onClose,
  onRemove,
  onOpenCheckout,
}) {
  const total = items.reduce((accumulator, item) => {
    return accumulator + item.priceArs * item.quantity;
  }, 0);

  return (
    <aside className="cart-drawer-react">
      <div className="cart-drawer-head">
        <div>
          <p className="eyebrow">Estado global</p>
          <h2>Carrito React</h2>
        </div>
        <button type="button" className="ghost-button-react" onClick={onClose}>
          Cerrar
        </button>
      </div>

      <div className="cart-drawer-items">
        {items.length === 0 ? (
          <p className="cart-empty">Todavia no agregaste productos en esta version React.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="cart-row-react">
              <div>
                <h3>{item.name}</h3>
                <p>
                  {item.category} · {item.quantity} unidad{item.quantity > 1 ? "es" : ""}
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
        <button type="button" className="primary-button-react" onClick={onOpenCheckout}>
          Finalizar compra
        </button>
      </div>
    </aside>
  );
}
