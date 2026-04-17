import {
  fetchUsdToArsRate,
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
  paymentOpen: false,
  paymentTab: "custom",
  selectedQuantity: 1,
};

const els = {
  root: document.querySelector("#product-page-root"),
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
  paymentModal: document.querySelector("#payment-modal"),
  paymentModalBody: document.querySelector("#payment-modal-body"),
  paymentTabs: Array.from(document.querySelectorAll("[data-payment-tab]")),
  currencySwitch: document.querySelector(".currency-switch"),
  topbarRight: document.querySelector(".topbar-right"),
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

function mountCurrencySwitch() {
  if (!els.currencySwitch || !els.topbarRight) return;
  els.currencySwitch.classList.add("topbar-currency");
  els.topbarRight.appendChild(els.currencySwitch);
}

function getCurrentProduct() {
  const params = new URLSearchParams(window.location.search);
  return getProductById(params.get("id"));
}

function getDetailMeta(product) {
  if (product.isGiftCard) {
    return {
      material: "Digital",
      availability: "Disponible",
      delivery: "Online",
    };
  }

  const material = product.id.includes("dorado") ? "Bano dorado" : "Plata";
  const availability = "Disponible";
  const delivery = "Envio a todo el pais";
  return { material, availability, delivery };
}

function getPaymentDetails(product) {
  const installmentBase = Math.round(product.price / 3);
  const customDiscountTotal = Math.round(product.price * 0.9);
  const customDiscountInstallment = Math.round(customDiscountTotal / 3);

  return {
    installmentBase,
    customDiscountTotal,
    customDiscountInstallment,
    customMethods: [
      {
        title: "Efectivo",
        detail: "10% de descuento pagando en efectivo",
        total: customDiscountTotal,
      },
      {
        title: "Transferencia o deposito bancario",
        detail: "10% de descuento pagando con transferencia o deposito bancario",
        total: customDiscountTotal,
      },
    ],
    mercadoPlans: [
      {
        title: `1 cuota de ${formatPrice(product.price, state.currency)} sin interes`,
        total: product.price,
        logos: ["amex", "mastercard", "visa"],
      },
      {
        title: `3 cuotas de ${formatPrice(installmentBase, state.currency)} sin interes`,
        total: product.price,
        logos: ["amex", "mastercard", "visa", "naranja"],
      },
    ],
  };
}

function getPaymentLogoMarkup(name) {
  const labels = {
    amex: "American Express",
    "apple-pay": "Apple Pay",
    mastercard: "Mastercard",
    visa: "Visa",
    naranja: "Naranja",
  };

  const extensions = {
    amex: "svg",
    "apple-pay": "png",
    mastercard: "svg",
    visa: "png",
    naranja: "png",
  };

  return `<img class="payment-option-logo" src="./assets/payments/${name}.${extensions[name]}" alt="${labels[name]}" />`;
}

function getGiftCardInfoMarkup(product) {
  if (!product?.isGiftCard) return "";

  return `
    <div class="gift-card-info-box">
      <p class="gift-card-info-kicker">GIFT CARD ONLINE</p>
      <h2>Como usarla?</h2>
      <ul class="gift-card-info-list">
        <li>Visita nuestra tienda online.</li>
        <li>Elige tus piezas favoritas.</li>
        <li>Ingresa el codigo al finalizar tu compra.</li>
        <li>Si tienes alguna duda, no dudes en escribirnos.</li>
      </ul>
    </div>
  `;
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
  const payment = getPaymentDetails(product);
  document.title = `${product.name} | SANGRIA`;
  els.root.innerHTML = `
    <section class="product-page-card fade-in">
      <div class="product-page-media">
        <button class="product-thumb is-active" type="button" data-image-src="${product.image}" data-image-alt="${product.name}">
          <img src="${product.image}" alt="${product.name}" class="${buildImageClasses(product.imageClass, product.imageSizeClass)}" />
        </button>
        ${
          product.hoverImage
            ? `<button class="product-thumb" type="button" data-image-src="${product.hoverImage}" data-image-alt="${product.name} vista alternativa">
                <img src="${product.hoverImage}" alt="${product.name} vista alternativa" class="${buildImageClasses(product.hoverImageClass, product.hoverImageSizeClass ?? product.imageSizeClass)}" />
              </button>`
            : ""
        }
        <div class="product-page-image-shell">
          <img src="${product.image}" alt="${product.name}" class="${buildImageClasses(product.imageClass, product.imageSizeClass)}" id="detail-main-image" />
        </div>
      </div>
      <div class="product-page-copy">
        <p class="breadcrumb">Inicio / ${product.category} / ${product.name}</p>
        <h1>${product.name}</h1>
        <p class="product-page-price">${formatPrice(product.price, state.currency)}</p>
        <button class="installment-pill" type="button" data-open-payment>
          <strong>3 cuotas sin interes</strong>
          <span>de ${formatPrice(payment.installmentBase, state.currency)} Â· ver medios de pago</span>
        </button>
        <p class="product-page-description">${product.description}</p>
        <div class="product-page-meta">
          <div><span>Material</span><strong>${meta.material}</strong></div>
          <div><span>Estado</span><strong>${meta.availability}</strong></div>
          <div><span>Envio</span><strong>${meta.delivery}</strong></div>
        </div>
        <div class="product-quantity-block">
          <span class="product-quantity-label">Cantidad</span>
          <div class="product-purchase-row">
            <div class="product-quantity-control" aria-label="Selector de cantidad">
              <button class="quantity-button" type="button" data-decrease-qty aria-label="Restar una unidad">-</button>
              <strong class="quantity-value">${state.selectedQuantity}</strong>
              <button class="quantity-button" type="button" data-increase-qty aria-label="Sumar una unidad">+</button>
            </div>
            <button class="primary-button" type="button" data-add-cart="${product.id}">Agregar al carrito</button>
          </div>
        </div>
        ${getGiftCardInfoMarkup(product)}
        <div class="product-page-actions">
          <a class="secondary-button button-link" href="./${product.slug}.html">Ver mas ${product.category.toLowerCase()}</a>
        </div>
      </div>
    </section>
  `;

  renderPaymentModal(product);
}

function renderPaymentModal(product) {
  if (!els.paymentModalBody) return;
  const payment = getPaymentDetails(product);

  if (state.paymentTab === "custom") {
    els.paymentModalBody.innerHTML = `
      <div class="payment-modal-section-title">Pagos Personalizados 10% OFF</div>
      ${payment.customMethods
        .map(
          (method) => `
            <article class="payment-option-card">
              <div class="payment-option-copy">
                <p class="payment-option-kicker">${method.title}</p>
                <h3>${method.detail}</h3>
                <p>Total: <strong>${formatPrice(method.total, state.currency)}</strong></p>
                <p>Tambien podes abonarlo en 3 cuotas de <strong>${formatPrice(payment.customDiscountInstallment, state.currency)}</strong> sin interes.</p>
              </div>
            </article>
          `
        )
        .join("")}
    `;
  } else {
    els.paymentModalBody.innerHTML = `
      <div class="payment-modal-section-title">Mercado Pago</div>
      ${payment.mercadoPlans
        .map(
          (plan) => `
            <article class="payment-option-card">
              <div class="payment-option-copy">
                <h3>${plan.title}</h3>
                <div class="payment-option-logos">
                  ${plan.logos.map((logo) => getPaymentLogoMarkup(logo)).join("")}
                </div>
              </div>
              <div class="payment-option-total">
                <span>Total</span>
                <strong>${formatPrice(plan.total, state.currency)}</strong>
              </div>
            </article>
          `
        )
        .join("")}
    `;
  }

  els.paymentTabs.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.paymentTab === state.paymentTab);
  });
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
    els.cartItems.innerHTML = `<div class="empty-state">Todavia no agregaste productos. Selecciona una pieza del catalogo para guardarla aca.</div>`;
    return;
  }

  els.cartItems.innerHTML = items
    .map(
      (item) => `
        <article class="cart-row">
          <div>
            <h3>${item.name}</h3>
            <p>${item.category} Â· ${item.quantity} unidad${item.quantity > 1 ? "es" : ""}</p>
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

function addToCart(productId, quantity = 1) {
  const existing = state.cart.find((item) => item.id === productId);
  if (existing) existing.quantity += quantity;
  else state.cart.push({ id: productId, quantity });
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

function setPaymentOpen(nextValue) {
  state.paymentOpen = nextValue;
  if (els.paymentModal) {
    els.paymentModal.hidden = !nextValue;
    els.paymentModal.classList.toggle("open", nextValue);
    els.paymentModal.setAttribute("aria-hidden", String(!nextValue));
  }
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
    if (addTrigger) {
      addToCart(addTrigger.dataset.addCart, state.selectedQuantity);
      state.selectedQuantity = 1;
      renderProduct();
      return;
    }
    const decreaseQtyTrigger = event.target.closest("[data-decrease-qty]");
    if (decreaseQtyTrigger) {
      state.selectedQuantity = Math.max(1, state.selectedQuantity - 1);
      renderProduct();
      return;
    }
    const increaseQtyTrigger = event.target.closest("[data-increase-qty]");
    if (increaseQtyTrigger) {
      state.selectedQuantity += 1;
      renderProduct();
      return;
    }
    const openPaymentTrigger = event.target.closest("[data-open-payment]");
    if (openPaymentTrigger) return setPaymentOpen(true);
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
      els.searchForm?.classList.toggle("is-open");
      els.searchInput?.focus();
      return;
    }
    const closePaymentTrigger = event.target.closest("[data-close-payment]");
    if (closePaymentTrigger) return setPaymentOpen(false);
    const paymentTabTrigger = event.target.closest("[data-payment-tab]");
    if (paymentTabTrigger) {
      state.paymentTab = paymentTabTrigger.dataset.paymentTab;
      return renderPaymentModal(getCurrentProduct());
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

  els.paymentModal?.addEventListener("click", (event) => {
    if (event.target === els.paymentModal) {
      setPaymentOpen(false);
    }
  });
}

function init() {
  setPaymentOpen(false);
  ensureClearCartButton();
  renderCurrencyButtons();
  renderProduct();
  renderCart();
  bindEvents();
  fetchUsdToArsRate().then(() => {
    renderProduct();
    renderCart();
  });
}

init();





