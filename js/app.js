import {
  fetchUsdToArsRate,
  filters,
  formatPrice,
  getProductsByCategory,
  getProductById,
  loadCart,
  loadCurrency,
  products,
  saveCart,
  saveCurrency,
} from "./data.js";

const state = {
  activeFilter: "Todas",
  cart: loadCart(),
  currency: loadCurrency(),
  cartOpen: false,
  menuOpen: false,
};

const els = {
  filters: document.querySelector("#filters"),
  productGrid: document.querySelector("#product-grid"),
  carouselPrev: document.querySelector("[data-carousel-prev]"),
  carouselNext: document.querySelector("[data-carousel-next]"),
  cartCount: document.querySelector("#cart-count"),
  cartDrawer: document.querySelector("#cart-drawer"),
  cartItems: document.querySelector("#cart-items"),
  cartTotal: document.querySelector("#cart-total"),
  cartFooter: document.querySelector(".cart-footer"),
  menuDrawer: document.querySelector("#menu-drawer"),
  overlay: document.querySelector("#overlay"),
  menuButtons: Array.from(document.querySelectorAll(".menu-button")),
  searchForm: document.querySelector("[data-search-form]"),
  searchInput: document.querySelector("[data-search-input]"),
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

const searchRoutes = [
  { keywords: ["anillo", "anillos", "ring"], href: "./anillos.html" },
  { keywords: ["pulsera", "pulseras", "bracelet"], href: "./pulseras.html" },
  { keywords: ["collar", "collares", "colgante"], href: "./collares.html" },
  { keywords: ["aro", "aros", "earring"], href: "./aros.html" },
  { keywords: ["earcuff", "ear cuff", "cuff"], href: "./earcuff.html" },
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

function renderFilters() {
  if (!els.filters) return;

  els.filters.innerHTML = filters
    .map(
      (filter) => `
        <button
          class="filter-button ${filter === state.activeFilter ? "active" : ""}"
          type="button"
          data-filter="${filter}"
          aria-pressed="${filter === state.activeFilter}"
        >
          ${filter}
        </button>
      `
    )
    .join("");
}

function renderProducts() {
  if (!els.productGrid) return;

  const visible = getProductsByCategory(state.activeFilter);

  if (visible.length === 0) {
    els.productGrid.innerHTML = `
      <article class="product-card fade-in">
        <div class="product-body">
          <p class="product-category">Proximamente</p>
          <h3>Esta categoria todavia no tiene productos cargados</h3>
          <p>Cuando agreguemos nuevas piezas, van a aparecer aca.</p>
        </div>
      </article>
    `;
    return;
  }

  els.productGrid.innerHTML = visible
    .map(
      (product, index) => `
        <article class="product-card fade-in" style="animation-delay: ${index * 40}ms">
          <button class="product-image product-image-button" type="button" data-view-product="${product.id}" aria-label="Ver ${product.name}">
            ${
              product.hoverImage
                ? `
            <div class="product-image-stack">
              <img src="${product.image}" alt="${product.name}" class="product-image-primary ${product.imageClass ?? ""}" />
              <img src="${product.hoverImage}" alt="${product.name} vista alternativa" class="product-image-hover ${product.hoverImageClass ?? ""}" />
            </div>
            `
                : `<img src="${product.image}" alt="${product.name}" class="${product.imageClass ?? ""}" />`
            }
          </button>
          <div class="product-body">
            <p class="product-category">${product.category}</p>
            <h3><button class="product-link" type="button" data-view-product="${product.id}">${product.name}</button></h3>
            <div class="product-footer">
              <span class="price">${formatPrice(product.price, state.currency)}</span>
              <button class="primary-button" type="button" data-add-cart="${product.id}">Agregar</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  requestAnimationFrame(updateCarouselControls);
}

function getCarouselStep() {
  if (!els.productGrid) return 320;
  const firstCard = els.productGrid.querySelector(".product-card");
  if (!firstCard) return 320;
  const gap = Number.parseFloat(window.getComputedStyle(els.productGrid).columnGap || window.getComputedStyle(els.productGrid).gap || "16");
  return firstCard.getBoundingClientRect().width + gap;
}

function updateCarouselControls() {
  if (!document.body.classList.contains("home-page") || !els.productGrid) return;
  if (!els.carouselPrev || !els.carouselNext) return;

  const maxScroll = Math.max(0, els.productGrid.scrollWidth - els.productGrid.clientWidth);
  const current = els.productGrid.scrollLeft;

  els.carouselPrev.disabled = current <= 4;
  els.carouselNext.disabled = current >= maxScroll - 4;
}

function scrollCarousel(direction) {
  if (!els.productGrid) return;
  els.productGrid.scrollBy({ left: getCarouselStep() * direction, behavior: "smooth" });
  window.setTimeout(updateCarouselControls, 220);
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

function clearCart() {
  state.cart = [];
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
  if (document.body.classList.contains("home-page")) {
    els.searchForm?.addEventListener("pointerdown", (event) => {
      if (event.target === els.searchInput) return;
      event.preventDefault();
      requestAnimationFrame(() => {
        els.searchInput?.focus();
        els.searchInput?.select();
      });
    });
  }

  els.currencyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.currency = button.dataset.currency;
      saveCurrency(state.currency);
      renderCurrencyButtons();
      renderProducts();
      renderCart();
    });
  });

  els.searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSearchSubmit(els.searchInput?.value ?? "");
  });

  els.filters?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    state.activeFilter = button.dataset.filter;
    renderFilters();
    renderProducts();
  });

  els.carouselPrev?.addEventListener("click", () => scrollCarousel(-1));
  els.carouselNext?.addEventListener("click", () => scrollCarousel(1));
  els.productGrid?.addEventListener("scroll", updateCarouselControls, { passive: true });
  window.addEventListener("resize", updateCarouselControls);

  document.addEventListener("click", (event) => {
    const scrollTrigger = event.target.closest("[data-scroll]");
    if (scrollTrigger) {
      const target = document.querySelector(scrollTrigger.dataset.scroll);
      setMenuOpen(false);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
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
    const toggleSearchTrigger = event.target.closest("[data-toggle-search]");
    if (toggleSearchTrigger) {
      if (document.body.classList.contains("home-page")) {
        requestAnimationFrame(() => {
          els.searchInput?.focus();
          els.searchInput?.select();
        });
        return;
      }
      els.searchForm?.classList.toggle("is-open");
      els.searchInput?.focus();
      return;
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
  renderFilters();
  renderProducts();
  renderCart();
  bindEvents();
  fetchUsdToArsRate().then(() => {
    renderProducts();
    renderCart();
  });
}

init();


