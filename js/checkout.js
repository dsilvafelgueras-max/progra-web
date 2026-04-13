import {
  fetchUsdToArsRate,
  formatPrice,
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
  deliveryMethod: "domicilio",
  paymentMethod: "mercado-pago",
  couponOpen: false,
  couponCode: "",
  couponDiscountRate: 0,
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
  summarySubtotal: document.querySelector("#checkout-subtotal"),
  summaryTotal: document.querySelector("#checkout-total"),
  summaryShipping: document.querySelector("#checkout-shipping"),
  summaryDiscountRow: document.querySelector("#checkout-discount-row"),
  summaryDiscount: document.querySelector("#checkout-discount"),
  checkoutForm: document.querySelector("#checkout-form"),
  checkoutSuccess: document.querySelector("#checkout-success"),
  checkoutSubmit: document.querySelector("#checkout-submit"),
  checkoutError: document.querySelector("#checkout-error"),
  couponToggle: document.querySelector("#checkout-coupon-toggle"),
  couponForm: document.querySelector("#checkout-coupon-form"),
  couponInput: document.querySelector("#checkout-coupon-input"),
  couponMessage: document.querySelector("#checkout-coupon-message"),
  deliveryRadios: Array.from(document.querySelectorAll('input[name="deliveryMethod"]')),
  deliveryPanels: Array.from(document.querySelectorAll("[data-delivery-panel]")),
  deliveryRequiredInputs: Array.from(document.querySelectorAll("[data-delivery-required]")),
  paymentRadios: Array.from(document.querySelectorAll('input[name="paymentMethod"]')),
  paymentPanels: Array.from(document.querySelectorAll("[data-payment-panel]")),
  paymentRequiredInputs: Array.from(document.querySelectorAll("[data-payment-required]")),
};

const couponCodes = {
  SANGRIA10: 0.1,
  BIENVENIDA15: 0.15,
  JOYAS20: 0.2,
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

function renderCheckoutSummary() {
  const items = getCartDetailed();
  const subtotalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotalPrice * state.couponDiscountRate);
  const totalPrice = Math.max(0, subtotalPrice - discountAmount);

  if (!els.summaryItems) return;

  if (items.length === 0) {
    els.summaryItems.innerHTML =
      '<div class="empty-state">Tu carrito esta vacio. Agrega productos antes de continuar con la compra.</div>';
    if (els.summarySubtotal) els.summarySubtotal.textContent = formatPrice(0, state.currency);
    if (els.summaryDiscount) els.summaryDiscount.textContent = formatPrice(0, state.currency);
    if (els.summaryDiscountRow) els.summaryDiscountRow.hidden = true;
    if (els.summaryTotal) els.summaryTotal.textContent = formatPrice(0, state.currency);
    if (els.checkoutSubmit) els.checkoutSubmit.disabled = true;
    return;
  }

  els.summaryItems.innerHTML = items
    .map(
      (item) => `
        <article class="checkout-summary-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="checkout-summary-copy">
            <h3>${item.name}</h3>
            <p>${item.quantity} unidad${item.quantity > 1 ? "es" : ""}</p>
          </div>
          <strong>${formatPrice(item.price * item.quantity, state.currency)}</strong>
        </article>
      `
    )
    .join("");

  if (els.summarySubtotal) els.summarySubtotal.textContent = formatPrice(subtotalPrice, state.currency);
  if (els.summaryDiscount) els.summaryDiscount.textContent = `- ${formatPrice(discountAmount, state.currency)}`;
  if (els.summaryDiscountRow) els.summaryDiscountRow.hidden = discountAmount === 0;
  if (els.summaryTotal) els.summaryTotal.textContent = formatPrice(totalPrice, state.currency);
  if (els.summaryShipping) {
    const labels = {
      domicilio: "Entrega a domicilio",
      encuentro: "Punto de encuentro por correo",
      retiro: "Retiro en el local",
    };
    els.summaryShipping.textContent = labels[state.deliveryMethod] ?? "A coordinar";
  }
  if (els.checkoutSubmit) els.checkoutSubmit.disabled = false;
}

function renderCouponState() {
  if (els.couponForm) els.couponForm.hidden = !state.couponOpen;
  if (els.couponToggle) {
    els.couponToggle.textContent = state.couponOpen
      ? "Ocultar cupon de descuento"
      : "Agregar cupon de descuento";
  }
}

function setCouponMessage(message, type = "info") {
  if (!els.couponMessage) return;
  els.couponMessage.hidden = !message;
  els.couponMessage.textContent = message;
  els.couponMessage.dataset.state = type;
}

function applyCoupon(rawCode) {
  const normalizedCode = rawCode.trim().toUpperCase();

  if (!normalizedCode) {
    state.couponCode = "";
    state.couponDiscountRate = 0;
    setCouponMessage("Ingresa un codigo para aplicar el descuento.", "error");
    renderCheckoutSummary();
    return;
  }

  const discountRate = couponCodes[normalizedCode];

  if (!discountRate) {
    state.couponCode = "";
    state.couponDiscountRate = 0;
    setCouponMessage("Ese codigo no es valido.", "error");
    renderCheckoutSummary();
    return;
  }

  state.couponCode = normalizedCode;
  state.couponDiscountRate = discountRate;
  setCouponMessage(`Codigo aplicado: ${normalizedCode} (${Math.round(discountRate * 100)}% OFF)`, "success");
  renderCheckoutSummary();
}

function renderDeliveryMethod() {
  els.deliveryPanels.forEach((panel) => {
    const isActive = panel.dataset.deliveryPanel === state.deliveryMethod;
    panel.hidden = !isActive;

    panel
      .querySelectorAll("input, select, textarea")
      .forEach((field) => {
        field.disabled = !isActive;
      });
  });

  els.deliveryRequiredInputs.forEach((input) => {
    input.required = input.dataset.deliveryRequired === state.deliveryMethod;
  });

  els.deliveryRadios.forEach((radio) => {
    radio.checked = radio.value === state.deliveryMethod;
  });

  renderCheckoutSummary();
}

function renderPaymentMethod() {
  els.paymentPanels.forEach((panel) => {
    panel.hidden = panel.dataset.paymentPanel !== state.paymentMethod;
  });

  els.paymentRequiredInputs.forEach((input) => {
    const allowedMethods = (input.dataset.paymentRequired || "").split(" ");
    input.required = allowedMethods.includes(state.paymentMethod);
  });

  els.paymentRadios.forEach((radio) => {
    radio.checked = radio.value === state.paymentMethod;
  });
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
      renderCheckoutSummary();
    });
  });

  els.deliveryRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      state.deliveryMethod = radio.value;
      renderDeliveryMethod();
    });
  });

  els.paymentRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      state.paymentMethod = radio.value;
      renderPaymentMethod();
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

  els.checkoutForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.cart.length === 0) return;
    if (!els.checkoutForm.reportValidity()) {
      if (els.checkoutError) els.checkoutError.hidden = false;
      return;
    }
    if (els.checkoutError) els.checkoutError.hidden = true;
    clearCart();
    els.checkoutForm.reset();
    state.deliveryMethod = "domicilio";
    state.paymentMethod = "mercado-pago";
    state.couponCode = "";
    state.couponDiscountRate = 0;
    renderDeliveryMethod();
    renderPaymentMethod();
    renderCouponState();
    setCouponMessage("", "info");
    if (els.checkoutSuccess) els.checkoutSuccess.hidden = false;
  });

  els.couponForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    applyCoupon(els.couponInput?.value ?? "");
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

    const couponToggleTrigger = event.target.closest("#checkout-coupon-toggle");
    if (couponToggleTrigger) {
      state.couponOpen = !state.couponOpen;
      renderCouponState();
      if (state.couponOpen) {
        requestAnimationFrame(() => els.couponInput?.focus());
      }
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
  renderDeliveryMethod();
  renderPaymentMethod();
  renderCouponState();
  renderCheckoutSummary();
  bindEvents();
  fetchUsdToArsRate().then(() => {
    renderCart();
    renderCheckoutSummary();
  });
}

init();
