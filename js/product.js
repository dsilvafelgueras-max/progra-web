import {
  formatPrice,
  getProductById,
  loadCart,
  loadCurrency,
  products,
  saveCart,
  saveCurrency,
} from "./data.js";

const state = {
  cart: loadCart(),
  currency: loadCurrency(),
  cartOpen: false,
  menuOpen: false,
};

const els = {
  root: document.querySelector("#product-page-root"),
  cartCount: document.querySelector("#cart-count"),
  cartDrawer: document.querySelector("#cart-drawer"),
  cartItems: document.querySelector("#cart-items"),
  cartTotal: document.querySelector("#cart-total"),
  menuDrawer: document.querySelector("#menu-drawer"),
  overlay: document.querySelector("#overlay"),
  menuButtons: Array.from(document.querySelectorAll(".menu-button")),
  searchForm: document.querySelector("[data-search-form]"),
  searchInput: document.querySelector("[data-search-input]"),
  currencyButtons: Array.from(document.querySelectorAll("[data-currency]")),
};

const searchRoutes = [
  { keywords: ["anillo", "anillos", "ring"], href: "./anillos.html" },
  { keywords: ["pulsera", "pulseras", "bracelet"], href: "./pulseras.html" },
  { keywords: ["collar", "collares", "colgante"], href: "./collares.html" },
  { keywords: ["aro", "aros", "earring"], href: "./aros.html" },
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

function getCurrentProduct() {
  const params = new URLSearchParams(window.location.search);
  return getProductById(params.get("id"));
}

function getDetailMeta(product) {
  const material = product.id.includes("dorado") ? "Baño dorado" : "Plata";
  const availability = "Disponible";
  const delivery = "Envio a todo el pais";
  return { material, availability, delivery };
}

function renderProduct() {
  if (!els.root) return;
  const product = getCurrentProduct();

  if (!product) {
    els.root.innerHTML = `
      <section class="product-page-card">
        <p class="breadcrumb">Producto</p>
        <h1>Producto no encontrado</h1>
        <a class="primary-button button-link" href="./index.html">Volver a la tienda</a>
      </section>
    `;
    return;
  }

  const meta = getDetailMeta(product);
  document.title = `${product.name} | SANGRIA`;

  els.root.innerHTML = `
    <section class="product-page-card fade-in">
      <div class="product-page-media">
        <div class="product-page-image-shell">
          <img src="${product.image}" alt="${product.name}" class="${product.imageClass ?? ""}" id="detail-main-image" />
        </div>
        ${
          product.hoverImage
            ? `<button class="product-thumb is-active" type="button" data-image-src="${product.image}" data-image-alt="${product.name}">
                <img src="${product.image}" alt="${product.name}" class="${product.imageClass ?? ""}" />
              </button>
              <button class="product-thumb" type="button" data-image-src="${product.hoverImage}" data-image-alt="${product.name} vista alternativa">
                <img src="${product.hoverImage}" alt="${product.name} vista alternativa" class="${product.hoverImageClass ?? ""}" />
              </button>`
            : ""
        }
      </div>
      <div class="product-page-copy">
        <p class="breadcrumb">Inicio / ${product.category} / ${product.name}</p>
        <p class="product-category">${product.category}</p>
        <h1>${product.name}</h1>
        <p class="product-page-price">${formatPrice(product.price, state.currency)}</p>
        <p class="product-page-description">${product.description}</p>
        <div class="product-page-meta">
          <div><span>Material</span><strong>${meta.material}</strong></div>
          <div><span>Estado</span><strong>${meta.availability}</strong></div>
          <div><span>Envio</span><strong>${meta.delivery}</strong></div>
        </div>
        <div class="product-page-actions">
          <button class="primary-button" type="button" data-add-cart="${product.id}">Agregar al carrito</button>
          <a class="secondary-button button-link" href="./${product.slug}.html">Ver mas ${product.category.toLowerCase()}</a>
        </div>
      </div>
    </section>
  `;
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
  if (!els.cartItems) return;

  if (items.length === 0) {
    els.cartItems.innerHTML = `<div class="empty-state">Todavia no agregaste productos. Selecciona una pieza del catalogo para guardarla aca.</div>`;
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

function syncOverlay() {
  if (els.overlay) els.overlay.hidden = !(state.cartOpen || state.menuOpen);
}

function setCartOpen(nextValue) {
  state.cartOpen = nextValue;
  els.cartDrawer?.classList.toggle("open", nextValue);
  els.cartDrawer?.setAttribute("aria-hidden", String(!nextValue));
  if (nextValue) setMenuOpen(false, false);
  syncOverlay();
}

function setMenuOpen(nextValue, sync = true) {
  state.menuOpen = nextValue;
  els.menuDrawer?.classList.toggle("open", nextValue);
  els.menuDrawer?.setAttribute("aria-hidden", String(!nextValue));
  els.menuButtons.forEach((button) => button.setAttribute("aria-expanded", String(nextValue)));
  if (nextValue) {
    state.cartOpen = false;
    els.cartDrawer?.classList.remove("open");
    els.cartDrawer?.setAttribute("aria-hidden", "true");
  }
  if (sync) syncOverlay();
}

function bindEvents() {
  els.currencyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.currency = button.dataset.currency;
      saveCurrency(state.currency);
      renderCurrencyButtons();
      renderProduct();
      renderCart();
    });
  });

  els.searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSearchSubmit(els.searchInput?.value ?? "");
  });

  document.addEventListener("click", (event) => {
    const addTrigger = event.target.closest("[data-add-cart]");
    if (addTrigger) return addToCart(addTrigger.dataset.addCart);
    const removeTrigger = event.target.closest("[data-remove-cart]");
    if (removeTrigger) return removeFromCart(removeTrigger.dataset.removeCart);
    const toggleCartTrigger = event.target.closest("[data-toggle-cart]");
    if (toggleCartTrigger) return setCartOpen(!state.cartOpen);
    const toggleMenuTrigger = event.target.closest("[data-toggle-menu]");
    if (toggleMenuTrigger) return setMenuOpen(!state.menuOpen);
    const toggleSearchTrigger = event.target.closest("[data-toggle-search]");
    if (toggleSearchTrigger) {
      els.searchForm?.classList.toggle("is-open");
      els.searchInput?.focus();
      return;
    }
    const thumbTrigger = event.target.closest("[data-image-src]");
    if (thumbTrigger) {
      const mainImage = document.querySelector("#detail-main-image");
      const thumbButtons = Array.from(document.querySelectorAll(".product-thumb"));
      if (mainImage) {
        mainImage.src = thumbTrigger.dataset.imageSrc;
        mainImage.alt = thumbTrigger.dataset.imageAlt;
      }
      thumbButtons.forEach((button) =>
        button.classList.toggle("is-active", button === thumbTrigger)
      );
    }
  });

  els.overlay?.addEventListener("click", () => {
    setCartOpen(false);
    setMenuOpen(false);
  });
}

function init() {
  renderCurrencyButtons();
  renderProduct();
  renderCart();
  bindEvents();
}

init();
