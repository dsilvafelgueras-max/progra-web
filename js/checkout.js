import {
  fetchUsdToArsRate,
  formatPrice,
  loadCart,
  loadCurrency,
  products,
  saveCart,
  saveCurrency,
} from "./data.js";
import { enhanceSessionLink } from "./session.js";

const state = {
  cart: loadCart(),
  currency: loadCurrency(),
  cartOpen: false,
  menuOpen: false,
};

const els = {
  cartCount: document.querySelector("#cart-count"),
  cartDrawer: document.querySelector("#cart-drawer"),
  cartItems: document.querySelector("#cart-items"),
  cartTotal: document.querySelector("#cart-total"),
  cartFooter: document.querySelector(".cart-footer"),
  menuDrawer: document.querySelector("#menu-drawer"),
  overlay: document.querySelector("#overlay"),
  menuButtons: Array.from(document.querySelectorAll("[data-toggle-menu]")),
  searchForm: document.querySelector("[data-search-form]"),
  searchInput: document.querySelector("[data-search-input]"),
  currencyButtons: Array.from(document.querySelectorAll("[data-currency]")),
  summaryItems: document.querySelector("#checkout-summary-items"),
  summaryTotal: document.querySelector("#checkout-total"),
  checkoutForm: document.querySelector("#checkout-form"),
  checkoutError: document.querySelector("#checkout-error"),
};

const searchRoutes = [
  { keywords: ["anillo", "anillos", "ring"], href: "./anillos.html" },
  { keywords: ["pulsera", "pulseras", "bracelet"], href: "./pulseras.html" },
  { keywords: ["collar", "collares", "colgante"], href: "./collares.html" },
  { keywords: ["aro", "aros", "earring"], href: "./aros.html" },
  { keywords: ["earcuff", "ear cuff", "cuff"], href: "./earcuff.html" },
  { keywords: ["gift", "tarjeta", "regalo"], href: "./tarjeta-regalo.html" },
];

function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function handleSearchSubmit(rawValue) {
  const value = normalize(rawValue.trim());
  if (!value) return;
  const match = searchRoutes.find((route) =>
    route.keywords.some((keyword) => value.includes(keyword))
  );
  window.location.href = match?.href ?? "./anillos.html";
}

function ensureClearCartButton() {
  if (!els.cartFooter || els.cartFooter.querySelector("[data-clear-cart]")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ghost-button full-width clear-cart-button";
  button.dataset.clearCart = "true";
  button.textContent = "Vaciar carrito";
  els.cartFooter.prepend(button);
}

function renderCurrencyButtons() {
  els.currencyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.currency === state.currency);
  });
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
    els.cartItems.innerHTML = `<div class="empty-state">Tu carrito esta vacio.</div>`;
    return;
  }

  els.cartItems.innerHTML = items
    .map((item) => `
      <article class="cart-row">
        ${item.image ? `<img class="cart-thumbnail" src="${item.image}" alt="">` : ""}
        <div class="cart-row-body">
          <div class="cart-row-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">${formatPrice(item.price * item.quantity, state.currency)}</span>
          </div>
          <div class="cart-row-meta">
            <span>${item.quantity} unidad${item.quantity > 1 ? "es" : ""}</span>
            <button class="remove-button" type="button" data-remove-cart="${item.id}">quitar</button>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function renderCheckoutSummary() {
  const items = getCartDetailed();
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (els.summaryTotal) els.summaryTotal.textContent = formatPrice(total, state.currency);
  if (!els.summaryItems) return;

  if (items.length === 0) {
    els.summaryItems.innerHTML = `<p class="empty-state">Tu carrito esta vacio.</p>`;
    return;
  }

  els.summaryItems.innerHTML = items
    .map((item) => `
      <div class="css-item">
        <span>${item.name} <small>x${item.quantity}</small></span>
        <span>${formatPrice(item.price * item.quantity, state.currency)}</span>
      </div>
    `)
    .join("");
}

function removeFromCart(productId) {
  state.cart = state.cart
    .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
    .filter((item) => item.quantity > 0);
  saveCart(state.cart);
  renderCart();
  renderCheckoutSummary();
}

function clearCart() {
  state.cart = [];
  saveCart(state.cart);
  renderCart();
  renderCheckoutSummary();
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
    els.menuButtons.forEach((b) => b.setAttribute("aria-expanded", "false"));
  }
  syncOverlay();
}

function setMenuOpen(nextValue) {
  state.menuOpen = nextValue;
  els.menuDrawer?.classList.toggle("open", nextValue);
  els.menuDrawer?.setAttribute("aria-hidden", String(!nextValue));
  els.menuButtons.forEach((b) => b.setAttribute("aria-expanded", String(nextValue)));
  if (nextValue) {
    state.cartOpen = false;
    els.cartDrawer?.classList.remove("open");
    els.cartDrawer?.setAttribute("aria-hidden", "true");
  }
  syncOverlay();
}

function showConfirmation() {
  const main = document.querySelector("main");
  if (main) {
    main.className = "section checkout-confirm";
    main.innerHTML = `
      <p class="section-tag">Compra finalizada</p>
      <h1 class="checkout-confirm-title">Tu pedido fue recibido.</h1>
      <p class="checkout-confirm-sub">Te contactamos a la brevedad para coordinar el pago y el envio. Revisa tu correo electronico.</p>
      <a class="primary-button button-link checkout-confirm-btn" href="./anillos.html">Seguir viendo piezas</a>
    `;
  }
}

function bindEvents() {
  els.currencyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.currency = button.dataset.currency;
      saveCurrency(state.currency);
      renderCurrencyButtons();
      renderCart();
      renderCheckoutSummary();
    });
  });

  els.checkoutForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.cart.length === 0) return;
    if (!els.checkoutForm.reportValidity()) {
      if (els.checkoutError) els.checkoutError.hidden = false;
      return;
    }
    clearCart();
    showConfirmation();
  });

  document.addEventListener("click", (event) => {
    const removeTrigger = event.target.closest("[data-remove-cart]");
    if (removeTrigger) return removeFromCart(removeTrigger.dataset.removeCart);
    const clearTrigger = event.target.closest("[data-clear-cart]");
    if (clearTrigger) return clearCart();
    const toggleCartTrigger = event.target.closest("[data-toggle-cart]");
    if (toggleCartTrigger) return setCartOpen(!state.cartOpen);
    const toggleMenuTrigger = event.target.closest("[data-toggle-menu]");
    if (toggleMenuTrigger) return setMenuOpen(!state.menuOpen);
  });

  els.searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSearchSubmit(els.searchInput?.value ?? "");
  });

  els.overlay?.addEventListener("click", () => {
    setCartOpen(false);
    setMenuOpen(false);
  });
}

function init() {
  ensureClearCartButton();
  enhanceSessionLink();
  renderCurrencyButtons();
  renderCart();
  renderCheckoutSummary();
  bindEvents();
  fetchUsdToArsRate().then(() => {
    renderCart();
    renderCheckoutSummary();
  });
}

init();
