import {
  formatPrice,
  getProductById,
  loadCart,
  loadCurrency,
  products,
  saveCart,
  saveCurrency,
} from "./data.js";

const giftCards = products.filter((product) => product.isGiftCard);

const state = {
  cart: loadCart(),
  currency: loadCurrency(),
  cartOpen: false,
  menuOpen: false,
};

const els = {
  grid: document.querySelector("[data-gift-card-grid]"),
  cartCount: document.querySelector("#cart-count"),
  cartDrawer: document.querySelector("#cart-drawer"),
  cartItems: document.querySelector("#cart-items"),
  cartTotal: document.querySelector("#cart-total"),
  cartFooter: document.querySelector(".cart-footer"),
  menuDrawer: document.querySelector("#menu-drawer"),
  overlay: document.querySelector("#overlay"),
  menuButtons: Array.from(document.querySelectorAll("[data-toggle-menu]")),
  currencyButtons: Array.from(document.querySelectorAll("[data-currency]")),
};

function ensureClearCartButton() {
  if (!els.cartFooter || els.cartFooter.querySelector("[data-clear-cart]")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "ghost-button full-width clear-cart-button";
  button.dataset.clearCart = "true";
  button.textContent = "Vaciar carrito";
  els.cartFooter.prepend(button);
}

function goToProduct(productId) {
  const product = getProductById(productId);
  if (!product) return;
  window.location.href = `./producto.html?id=${product.id}`;
}

function renderCurrencyButtons() {
  els.currencyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.currency === state.currency);
  });
}

function renderGiftCards() {
  if (!els.grid) return;

  els.grid.innerHTML = giftCards
    .map(
      (product, index) => `
        <article class="gift-card-shop-item fade-in" style="animation-delay: ${index * 40}ms">
          <button
            class="gift-card-visual"
            type="button"
            data-view-product="${product.id}"
            aria-label="Ver ${product.name}"
          >
            <span class="gift-card-visual-brand">SANGRIA</span>
            <span class="gift-card-visual-mark" aria-hidden="true"></span>
            <span class="gift-card-visual-copy">
              <span class="gift-card-visual-title">GIFT CARD</span>
              <strong>${formatPrice(product.price, state.currency)}</strong>
            </span>
          </button>
          <div class="gift-card-shop-body">
            <div class="product-footer">
              <button class="primary-button full-width" type="button" data-add-cart="${product.id}">Agregar al carrito</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function getCartDetailed() {
  return state.cart
    .map((entry) => {
      const product = products.find((item) => item.id === entry.id);
      if (!product) return null;
      return { ...product, quantity: entry.quantity };
    })
    .filter(Boolean);
}

function renderCart() {
  const items = getCartDetailed();
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (els.cartCount) els.cartCount.textContent = String(totalCount);
  if (els.cartTotal) els.cartTotal.textContent = formatPrice(totalPrice, state.currency);
  const clearButton = els.cartFooter?.querySelector("[data-clear-cart]");
  if (clearButton) clearButton.disabled = items.length === 0;
  if (!els.cartItems) return;

  if (items.length === 0) {
    els.cartItems.innerHTML =
      '<div class="empty-state">Todavia no agregaste productos. Selecciona una gift card para guardarla aca.</div>';
    return;
  }

  els.cartItems.innerHTML = items
    .map(
      (item) => `
        <article class="cart-row">
          <div>
            <h3>${item.name}</h3>
            <p>${item.category} · ${item.quantity} unidad${item.quantity > 1 ? "es" : ""}</p>
          </div>
          <div>
            <strong>${formatPrice(item.price * item.quantity, state.currency)}</strong>
            <button class="remove-button" type="button" data-remove-cart="${item.id}">Quitar</button>
          </div>
        </article>
      `
    )
    .join("");
}

function addToCart(productId) {
  const existing = state.cart.find((item) => item.id === productId);
  if (existing) existing.quantity += 1;
  else state.cart.push({ id: productId, quantity: 1 });

  saveCart(state.cart);
  renderCart();
  setCartOpen(true);
}

function removeFromCart(productId) {
  state.cart = state.cart
    .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
    .filter((item) => item.quantity > 0);

  saveCart(state.cart);
  renderCart();
}

function clearCart() {
  state.cart = [];
  saveCart(state.cart);
  renderCart();
}

function syncOverlay() {
  if (!els.overlay) return;
  els.overlay.hidden = !(state.cartOpen || state.menuOpen);
}

function setCartOpen(nextValue) {
  state.cartOpen = nextValue;
  els.cartDrawer?.classList.toggle("open", nextValue);
  els.cartDrawer?.setAttribute("aria-hidden", String(!nextValue));

  if (nextValue) {
    state.menuOpen = false;
    els.menuDrawer?.classList.remove("open");
    els.menuDrawer?.setAttribute("aria-hidden", "true");
    els.menuButtons.forEach((button) => button.setAttribute("aria-expanded", "false"));
  }

  syncOverlay();
}

function setMenuOpen(nextValue) {
  state.menuOpen = nextValue;
  els.menuDrawer?.classList.toggle("open", nextValue);
  els.menuDrawer?.setAttribute("aria-hidden", String(!nextValue));
  els.menuButtons.forEach((button) => button.setAttribute("aria-expanded", String(nextValue)));

  if (nextValue) {
    state.cartOpen = false;
    els.cartDrawer?.classList.remove("open");
    els.cartDrawer?.setAttribute("aria-hidden", "true");
  }

  syncOverlay();
}

function bindEvents() {
  els.currencyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.currency = button.dataset.currency;
      saveCurrency(state.currency);
      renderCurrencyButtons();
      renderGiftCards();
      renderCart();
    });
  });

  document.addEventListener("click", (event) => {
    const addTrigger = event.target.closest("[data-add-cart]");
    if (addTrigger) return addToCart(addTrigger.dataset.addCart);

    const viewTrigger = event.target.closest("[data-view-product]");
    if (viewTrigger) return goToProduct(viewTrigger.dataset.viewProduct);

    const removeTrigger = event.target.closest("[data-remove-cart]");
    if (removeTrigger) return removeFromCart(removeTrigger.dataset.removeCart);
    const clearTrigger = event.target.closest("[data-clear-cart]");
    if (clearTrigger) return clearCart();

    const toggleCartTrigger = event.target.closest("[data-toggle-cart]");
    if (toggleCartTrigger) return setCartOpen(!state.cartOpen);

    const toggleMenuTrigger = event.target.closest("[data-toggle-menu]");
    if (toggleMenuTrigger) return setMenuOpen(!state.menuOpen);
  });

  els.overlay?.addEventListener("click", () => {
    setCartOpen(false);
    setMenuOpen(false);
  });
}

function init() {
  ensureClearCartButton();
  renderCurrencyButtons();
  renderGiftCards();
  renderCart();
  bindEvents();
}

init();
