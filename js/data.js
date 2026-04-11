export const products = [
  {
    id: "pulsera-onda",
    name: "Pulsera Onda",
    category: "Pulseras",
    slug: "pulseras",
    price: 138000,
    priceLabel: "$138.000",
    image: "./assets/products/pulsera-onda-catalogo.png",
    description: "Pulsera ancha con capas fluidas y gesto organico en plata.",
  },
  {
    id: "anillo-torsion",
    name: "Anillo Torsion",
    category: "Anillos",
    slug: "anillos",
    price: 74000,
    priceLabel: "$74.000",
    image: "./assets/products/anillo-torsion.jpg",
    description: "Anillo fino con relieve irregular y perfil de torsion.",
  },
  {
    id: "anillo-escultura",
    name: "Anillo Escultura",
    category: "Anillos",
    slug: "anillos",
    price: 82000,
    priceLabel: "$82.000",
    image: "./assets/products/anillo-escultura.jpg",
    description: "Anillo escultorico de volumen suave con presencia minima.",
  },
  {
    id: "anillo-sello",
    name: "Anillo Sello Crudo",
    category: "Anillos",
    slug: "anillos",
    price: 91000,
    priceLabel: "$91.000",
    image: "./assets/products/anillo-sello-catalogo.png",
    description: "Sello texturado con superficie erosionada y caracter bruto.",
  },
  {
    id: "anillo-dorado",
    name: "Anillo Dorado Organico",
    category: "Anillos",
    slug: "anillos",
    price: 97000,
    priceLabel: "$97.000",
    image: "./assets/products/anillo-dorado.jpg",
    description: "Anillo dorado con textura erosionada y volumen irregular.",
  },
  {
    id: "anillo-vintage",
    name: "Anillo Vintage Ornamental",
    category: "Anillos",
    slug: "anillos",
    price: 102000,
    priceLabel: "$102.000",
    image: "./assets/products/anillo-vintage.png",
    hoverImage: "./assets/products/anillo-vintage-hover.jpg",
    imageClass: "is-square-crop",
    description: "Anillo de plata con frente ornamental y presencia simetrica.",
  },
  {
    id: "anillo-gema-verde",
    name: "Anillo Gema Verde",
    category: "Anillos",
    slug: "anillos",
    price: 118000,
    priceLabel: "$118.000",
    image: "./assets/products/anillo-gema-verde.png",
    imageClass: "is-square-crop",
    description: "Anillo de plata con gema verde tallada y marco irregular.",
  },
];

export const filters = ["Todas", "Anillos", "Pulseras", "Aros", "Collares"];
export const storageKey = "sangria-cart";
export const currencyStorageKey = "sangria-currency";
export const usdRate = 1000;

export function loadCart() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(storageKey, JSON.stringify(cart));
}

export function loadCurrency() {
  return localStorage.getItem(currencyStorageKey) || "ARS";
}

export function saveCurrency(currency) {
  localStorage.setItem(currencyStorageKey, currency);
}

export function formatPrice(value, currency = "ARS") {
  if (currency === "USD") {
    return `USD ${Math.round(value / usdRate).toLocaleString("en-US")}`;
  }

  return `ARS ${value.toLocaleString("es-AR")}`;
}

export function getProductsByCategory(category) {
  if (category === "Todas") {
    return products;
  }

  return products.filter((product) => product.category === category);
}

export function getProductsBySlug(slug) {
  return products.filter((product) => product.slug === slug);
}

export function getProductById(id) {
  return products.find((product) => product.id === id) ?? null;
}
