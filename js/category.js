import {
  fetchUsdToArsRate,
  formatPrice,
  getProductsBySlug,
  getProductById,
  loadCart,
  loadCurrency,
  products,
  saveCart,
  saveCurrency,
} from "./data.js";

const page = document.body.dataset.categoryPage;

const state = {
  cart: loadCart(),
  currency: loadCurrency(),
  cartOpen: false,
  menuOpen: false,
  filterOpen: false,
  sortOption: "popular",
};

const els = {
  title: document.querySelector("#category-title"),
  productGrid: document.querySelector("#category-grid"),
  sortMount: null,
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
  currencySwitch: document.querySelector(".currency-switch"),
  topbarRight: document.querySelector(".topbar-right"),
  sortPanel: null,
  sortTrigger: null,
  filterDrawer: null,
};

const sortOptions = [
  { value: "popular", label: "más vendidos" },
  { value: "newest", label: "nuevo" },
  { value: "price-asc", label: "precio: menor a mayor" },
  { value: "price-desc", label: "precio: mayor a menor" },
];

function ensureClearCartButton() {
  if (!els.cartFooter || els.cartFooter.querySelector("[data-clear-cart]")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "ghost-button full-width clear-cart-button";
  button.dataset.clearCart = "true";
  button.textContent = "Vaciar carrito";
  els.cartFooter.prepend(button);
}

const pageCopy = {
  anillos: { title: "Anillos", subtitle: "Todos los anillos de SANGRIA en una pantalla propia." },
  pulseras: { title: "Pulseras", subtitle: "Pulseras escultoricas y de gran presencia visual." },
  collares: { title: "Collares", subtitle: "Collares con colgantes y piezas de identidad marcada." },
  aros: { title: "Aros", subtitle: "Categoria preparada para las proximas incorporaciones." },
  earcuff: { title: "Earcuff", subtitle: "Piezas envolventes para sumar textura y volumen a la oreja." },
};

const searchRoutes = [
  { keywords: ["anillo", "anillos", "ring"], href: "./anillos.html" },
  { keywords: ["pulsera", "pulseras", "bracelet"], href: "./pulseras.html" },
  { keywords: ["collar", "collares", "colgante"], href: "./collares.html" },
  { keywords: ["aro", "aros", "earring"], href: "./aros.html" },
  { keywords: ["earcuff", "ear cuff", "cuff"], href: "./earcuff.html" },
];

function buildImageClasses(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function handleSearchSubmit(rawValue) {
  const value = normalize(rawValue.trim());
  if (!value) return;
  const match = searchRoutes.find((route) => route.keywords.some((keyword) => value.includes(keyword)));
  window.location.href = match?.href ?? "./anillos.html";
}

function getSortLabel(value = state.sortOption) {
  return sortOptions.find((option) => option.value === value)?.label ?? "Mas vendidos";
}

function sortProducts(items) {
  const sorted = [...items];

  switch (state.sortOption) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name, "es"));
    case "newest":
      return sorted.reverse();
    case "oldest":
    case "popular":
    default:
      return sorted;
  }
}

function ensureFilterTrigger() {
  if (els.sortMount || !els.productGrid?.parentElement) return;
  const toolbar = document.createElement("div");
  toolbar.className = "filter-trigger-bar";
  toolbar.innerHTML = `
    <button class="filter-trigger-btn" type="button" data-open-filter>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
        <line x1="0" y1="1" x2="16" y2="1"/>
        <line x1="3" y1="6" x2="13" y2="6"/>
        <line x1="6" y1="11" x2="10" y2="11"/>
      </svg>
      filtrar
    </button>
  `;
  els.productGrid.parentElement.insertBefore(toolbar, els.productGrid);
  els.sortMount = toolbar;
}

function ensureFilterDrawer() {
  if (els.filterDrawer) return;
  const drawer = document.createElement("aside");
  drawer.className = "filter-drawer";
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = `
    <div class="filter-drawer-head">
      <span class="filter-drawer-title">filtrar</span>
      <button class="filter-drawer-close" type="button" data-close-filter aria-label="Cerrar filtros">×</button>
    </div>
    <div class="filter-drawer-body">
      <div class="filter-drawer-group">
        <p class="filter-drawer-label">ordenar</p>
        ${sortOptions.map((option) => `
          <button
            class="filter-drawer-option${option.value === state.sortOption ? " is-active" : ""}"
            type="button"
            data-sort-value="${option.value}"
          >${option.label}</button>
        `).join("")}
      </div>
    </div>
  `;
  document.body.appendChild(drawer);
  els.filterDrawer = drawer;
}

function renderSortToolbar() {
  ensureFilterTrigger();
  ensureFilterDrawer();
  if (!els.filterDrawer) return;
  els.filterDrawer.querySelectorAll("[data-sort-value]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.sortValue === state.sortOption);
  });
}

function setFilterOpen(nextValue) {
  state.filterOpen = nextValue;
  ensureFilterDrawer();
  els.filterDrawer?.classList.toggle("open", nextValue);
  els.filterDrawer?.setAttribute("aria-hidden", String(!nextValue));
  if (nextValue) {
    state.cartOpen = false;
    state.menuOpen = false;
    els.cartDrawer?.classList.remove("open");
    els.menuDrawer?.classList.remove("open");
  }
  syncOverlay();
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

function mountCurrencySwitch() {
  if (!els.currencySwitch || !els.topbarRight) return;
  els.currencySwitch.classList.add("topbar-currency");
  els.topbarRight.appendChild(els.currencySwitch);
}

function renderPageHeader(items) {
  const copy = pageCopy[page] ?? { title: "Catalogo", subtitle: "Piezas de la coleccion." };
  if (els.title) {
    els.title.textContent = copy.title;
  }
}

function renderProducts() {
  const items = sortProducts(getProductsBySlug(page));
  renderPageHeader(items);

  if (items.length === 0) {
    els.productGrid.innerHTML = `<article class="product-card fade-in"><div class="product-body"><p class="product-category">Proximamente</p><h3>Esta categoria todavia no tiene productos cargados</h3><p>Cuando agreguemos nuevas piezas, las vas a ver aca.</p></div></article>`;
    return;
  }

  els.productGrid.innerHTML = items
    .map(
      (product, index) => `
        <article class="product-card fade-in" style="animation-delay: ${index * 40}ms">
          <button class="product-image product-image-button" type="button" data-view-product="${product.id}" aria-label="Ver ${product.name}">${
            product.hoverImage
              ? `
            <div class="product-image-stack">
              <img src="${product.image}" alt="${product.name}" class="${buildImageClasses("product-image-primary", product.imageClass, product.imageSizeClass)}" />
              <img src="${product.hoverImage}" alt="${product.name} vista alternativa" class="${buildImageClasses("product-image-hover", product.hoverImageClass, product.hoverImageSizeClass ?? product.imageSizeClass)}" />
            </div>
          `
              : `<img src="${product.image}" alt="${product.name}" class="${buildImageClasses(product.imageClass, product.imageSizeClass)}" />`
          }</button>
          <div class="product-body">
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
}

function getCartDetailed() {
  return state.cart.map((entry) => {
    const product = products.find((item) => item.id === entry.id);
    if (!product) return null;
    return { ...product, quantity: entry.quantity };
  }).filter(Boolean);
}

function renderCart() {
  const items = getCartDetailed();
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  els.cartCount.textContent = String(totalCount);
  els.cartTotal.textContent = formatPrice(totalPrice, state.currency);
  const clearButton = els.cartFooter?.querySelector("[data-clear-cart]");
  if (clearButton) clearButton.disabled = items.length === 0;

  if (items.length === 0) {
    els.cartItems.innerHTML = `<div class="empty-state">Todavia no agregaste productos. Selecciona una pieza del catalogo para guardarla aca.</div>`;
    return;
  }

  els.cartItems.innerHTML = items.map((item) => `
    <article class="cart-row">
      <div><h3>${item.name}</h3><p>${item.quantity} unidad${item.quantity > 1 ? "es" : ""}</p></div>
      <div><strong>${formatPrice(item.price * item.quantity, state.currency)}</strong><button class="remove-button" type="button" data-remove-cart="${item.id}">Quitar</button></div>
    </article>
  `).join("");
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
  state.cart = state.cart.map((item) => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0);
  saveCart(state.cart);
  renderCart();
}

function clearCart() {
  state.cart = [];
  saveCart(state.cart);
  renderCart();
}

function syncOverlay() {
  els.overlay.hidden = !(state.cartOpen || state.menuOpen || state.filterOpen);
}

function setCartOpen(nextValue) {
  state.cartOpen = nextValue;
  els.cartDrawer.classList.toggle("open", nextValue);
  els.cartDrawer.setAttribute("aria-hidden", String(!nextValue));
  if (nextValue) setMenuOpen(false, false);
  syncOverlay();
}

function setMenuOpen(nextValue, sync = true) {
  state.menuOpen = nextValue;
  els.menuDrawer.classList.toggle("open", nextValue);
  els.menuDrawer.setAttribute("aria-hidden", String(!nextValue));
  els.menuButtons.forEach((button) => button.setAttribute("aria-expanded", String(nextValue)));
  if (nextValue) {
    state.cartOpen = false;
    els.cartDrawer.classList.remove("open");
    els.cartDrawer.setAttribute("aria-hidden", "true");
  }
  if (sync) syncOverlay();
}

function bindEvents() {
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
    const sortOptionTrigger = event.target.closest("[data-sort-value]");
    if (sortOptionTrigger) {
      state.sortOption = sortOptionTrigger.dataset.sortValue;
      renderSortToolbar();
      renderProducts();
      setFilterOpen(false);
      return;
    }
    const openFilterTrigger = event.target.closest("[data-open-filter]");
    if (openFilterTrigger) return setFilterOpen(true);
    const closeFilterTrigger = event.target.closest("[data-close-filter]");
    if (closeFilterTrigger) return setFilterOpen(false);
    const toggleSearchTrigger = event.target.closest("[data-toggle-search]");
    if (toggleSearchTrigger) {
      els.searchForm?.classList.toggle("is-open");
      els.searchInput?.focus();
    }
  });

  els.overlay.addEventListener("click", () => {
    setCartOpen(false);
    setMenuOpen(false);
    setFilterOpen(false);
  });
}

function init() {
  bindEvents();
  ensureClearCartButton();
  mountCurrencySwitch();
  renderSortToolbar();
  renderCurrencyButtons();
  renderProducts();
  renderCart();
  fetchUsdToArsRate().then(() => {
    renderProducts();
    renderCart();
  });
}

init();




