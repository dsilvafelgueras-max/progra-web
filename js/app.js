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
  sortOption: "popular",
  cart: loadCart(),
  currency: loadCurrency(),
  cartOpen: false,
  menuOpen: false,
  sortOpen: false,
};

const els = {
  filters: document.querySelector("#filters"),
  productGrid: document.querySelector("#product-grid"),
  carouselPrev: document.querySelector("[data-carousel-prev]"),
  carouselNext: document.querySelector("[data-carousel-next]"),
  productGrid2: document.querySelector("#product-grid-otros"),
  carouselPrev2: document.querySelector("[data-carousel-prev2]"),
  carouselNext2: document.querySelector("[data-carousel-next2]"),
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
  sortPanel: null,
  sortTrigger: null,
};

const sortOptions = [
  { value: "popular", label: "Mas vendidos" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name-asc", label: "A - Z" },
  { value: "name-desc", label: "Z - A" },
  { value: "newest", label: "Mas nuevo al mas viejo" },
  { value: "oldest", label: "Mas viejo al mas nuevo" },
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

  const match = searchRoutes.find((route) =>
    route.keywords.some((keyword) => value.includes(keyword))
  );

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

function ensureSortPanel() {
  if (els.sortPanel) return;

  const panel = document.createElement("div");
  panel.className = "sort-panel";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="sort-panel-card" role="dialog" aria-modal="true" aria-labelledby="sort-panel-title">
      <div class="sort-panel-head">
        <h3 id="sort-panel-title">Ordenar</h3>
        <button class="sort-panel-close" type="button" data-close-sort>Cerrar</button>
      </div>
      <div class="sort-panel-options">
        ${sortOptions
          .map(
            (option) => `
              <label class="sort-option">
                <input type="radio" name="catalog-sort" value="${option.value}" ${
                  option.value === state.sortOption ? "checked" : ""
                } />
                <span>${option.label}</span>
              </label>
            `
          )
          .join("")}
      </div>
    </div>
  `;

  document.body.appendChild(panel);
  els.sortPanel = panel;
}

function renderSortPanel() {
  ensureSortPanel();
  if (!els.sortPanel) return;

  els.sortPanel
    .querySelectorAll('input[name="catalog-sort"]')
    .forEach((input) => {
      input.checked = input.value === state.sortOption;
    });

  if (els.sortTrigger) {
    els.sortTrigger.querySelector("[data-sort-label]").textContent = getSortLabel();
  }
}

function setSortOpen(nextValue) {
  state.sortOpen = nextValue;
  ensureSortPanel();
  if (!els.sortPanel) return;
  els.sortPanel.hidden = !nextValue;
  els.sortPanel.classList.toggle("open", nextValue);
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

  els.filters.innerHTML = `
    <button class="sort-trigger" type="button" data-toggle-sort>
      <span>Filtrar:</span>
      <strong data-sort-label>${getSortLabel()}</strong>
    </button>
    <div class="filter-pill-group">
      ${els.filters.innerHTML}
    </div>
  `;

  els.sortTrigger = els.filters.querySelector("[data-toggle-sort]");
  renderSortPanel();
}

function buildProductCard(product, index) {
  return `
    <article class="product-card fade-in" style="animation-delay: ${index * 40}ms">
      <button class="product-image product-image-button" type="button" data-view-product="${product.id}" aria-label="Ver ${product.name}">
        ${
          product.hoverImage
            ? `<div class="product-image-stack">
                <img src="${product.image}" alt="${product.name}" class="${buildImageClasses("product-image-primary", product.imageClass, product.imageSizeClass)}" />
                <img src="${product.hoverImage}" alt="${product.name} vista alternativa" class="${buildImageClasses("product-image-hover", product.hoverImageClass, product.hoverImageSizeClass ?? product.imageSizeClass)}" />
               </div>`
            : `<img src="${product.image}" alt="${product.name}" class="${buildImageClasses(product.imageClass, product.imageSizeClass)}" />`
        }
      </button>
      <div class="product-body">
        <h3><button class="product-link" type="button" data-view-product="${product.id}">${product.name}</button></h3>
        <div class="product-footer">
          <span class="price">${formatPrice(product.price, state.currency)}</span>
          <button class="primary-button" type="button" data-add-cart="${product.id}">Agregar</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  if (!els.productGrid) return;

  const visible = sortProducts(getProductsByCategory("Anillos"));

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

  els.productGrid.innerHTML = visible.map(buildProductCard).join("");
  requestAnimationFrame(updateCarouselControls);
}

function renderOtrosProducts() {
  if (!els.productGrid2) return;

  const otras = ["Pulseras", "Aros", "Earcuff", "Collares"];
  const visible = products.filter((p) => otras.includes(p.category));

  if (visible.length === 0) {
    els.productGrid2.innerHTML = `<article class="product-card fade-in"><div class="product-body"><p class="product-category">Proximamente</p><h3>Mas piezas proximamente</h3></div></article>`;
    return;
  }

  els.productGrid2.innerHTML = visible.map(buildProductCard).join("");
  requestAnimationFrame(updateCarouselControls2);
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

function updateCarouselControls2() {
  if (!els.productGrid2 || !els.carouselPrev2 || !els.carouselNext2) return;

  const maxScroll = Math.max(0, els.productGrid2.scrollWidth - els.productGrid2.clientWidth);
  const current = els.productGrid2.scrollLeft;

  els.carouselPrev2.disabled = current <= 4;
  els.carouselNext2.disabled = current >= maxScroll - 4;
}

function scrollCarousel(direction) {
  if (!els.productGrid) return;
  els.productGrid.scrollBy({ left: getCarouselStep() * direction, behavior: "smooth" });
  window.setTimeout(updateCarouselControls, 220);
}

function scrollCarousel2(direction) {
  if (!els.productGrid2) return;
  const firstCard = els.productGrid2.querySelector(".product-card");
  const step = firstCard ? firstCard.getBoundingClientRect().width + 16 : 320;
  els.productGrid2.scrollBy({ left: step * direction, behavior: "smooth" });
  window.setTimeout(updateCarouselControls2, 220);
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
  els.carouselPrev2?.addEventListener("click", () => scrollCarousel2(-1));
  els.carouselNext2?.addEventListener("click", () => scrollCarousel2(1));
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
    const toggleSortTrigger = event.target.closest("[data-toggle-sort]");
    if (toggleSortTrigger) return setSortOpen(!state.sortOpen);
    const closeSortTrigger = event.target.closest("[data-close-sort]");
    if (closeSortTrigger) return setSortOpen(false);
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

    if (
      state.sortOpen &&
      els.sortPanel &&
      !event.target.closest(".sort-panel-card")
    ) {
      setSortOpen(false);
    }
  });

  document.addEventListener("change", (event) => {
    const sortOption = event.target.closest('input[name="catalog-sort"]');
    if (!sortOption) return;
    state.sortOption = sortOption.value;
    renderSortPanel();
    renderProducts();
    setSortOpen(false);
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
  renderOtrosProducts();
  renderCart();
  bindEvents();
  fetchUsdToArsRate().then(() => {
    renderProducts();
    renderOtrosProducts();
    renderCart();
  });
}

init();


