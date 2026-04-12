import {
  formatPrice,
  loadCart,
  products,
  saveCart,
  loadCurrency,
  saveCurrency,
} from "./data.js";

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
    els.cartItems.innerHTML =
      '<div class="empty-state">Todavia no agregaste productos. Selecciona una pieza del catalogo para guardarla aca.</div>';
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
      renderCart();
    });
  });

  els.searchForm?.addEventListener("pointerdown", (event) => {
    if (event.target === els.searchInput) return;
    event.preventDefault();
    requestAnimationFrame(() => {
      els.searchInput?.focus();
      els.searchInput?.select();
    });
  });

  els.searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSearchSubmit(els.searchInput?.value ?? "");
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

    const toggleSearchTrigger = event.target.closest("[data-toggle-search]");
    if (toggleSearchTrigger) {
      requestAnimationFrame(() => {
        els.searchInput?.focus();
        els.searchInput?.select();
      });
    }
  });

  els.overlay?.addEventListener("click", () => {
    setCartOpen(false);
    setMenuOpen(false);
  });
}

function init() {
  ensureClearCartButton();
  renderCurrencyButtons();
  renderCart();
  bindEvents();
}

init();
