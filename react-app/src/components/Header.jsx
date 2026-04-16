export default function Header({
  search,
  onSearchChange,
  currency,
  onCurrencyChange,
  cartCount,
  onOpenCart,
}) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">React storefront</p>
        <h1>SANGRIA React Lab</h1>
      </div>

      <div className="header-tools">
        <label className="search-box">
          <span>Buscar</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Anillos, earcuff..."
          />
        </label>

        <div className="currency-switcher" role="group" aria-label="Moneda">
          <button
            type="button"
            className={currency === "ARS" ? "is-active" : ""}
            onClick={() => onCurrencyChange("ARS")}
          >
            ARS
          </button>
          <button
            type="button"
            className={currency === "USD" ? "is-active" : ""}
            onClick={() => onCurrencyChange("USD")}
          >
            USD
          </button>
        </div>

        <button type="button" className="cart-chip" onClick={onOpenCart}>
          Carrito
          <strong>{cartCount}</strong>
        </button>
      </div>
    </header>
  );
}
