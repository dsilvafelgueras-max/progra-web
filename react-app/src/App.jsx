import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import ProductGrid from "./components/ProductGrid";
import CartDrawer from "./components/CartDrawer";
import CheckoutForm from "./components/CheckoutForm";
import LearningPanel from "./components/LearningPanel";
import { categories, products } from "./data/catalog";
import { learningTopics } from "./data/learning";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { fetchUsdRate, formatMoney } from "./lib/currency";

function App() {
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useLocalStorage("sangria-react-currency", "ARS");
  const [cart, setCart] = useLocalStorage("sangria-react-cart", []);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [usdRate, setUsdRate] = useState(1400);
  const [rateStatus, setRateStatus] = useState("Usando valor inicial");

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let cancelled = false;

    async function loadRate() {
      try {
        const rate = await fetchUsdRate();

        if (!cancelled) {
          setUsdRate(rate);
          setRateStatus("Actualizado con fetch + async/await");
        }
      } catch {
        if (!cancelled) {
          setRateStatus("Sin conexion, usando valor local");
        }
      }
    }

    loadRate();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = deferredSearch
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

    const getByCategory = function getByCategory(product) {
      if (activeCategory === "Todas") return true;
      return product.category === activeCategory;
    };

    return products
      .filter(getByCategory)
      .filter((product) => {
        if (!normalizedSearch) return true;

        const haystack = [product.name, product.category, product.description]
          .join(" ")
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "");

        return haystack.includes(normalizedSearch);
      });
  }, [activeCategory, deferredSearch]);

  const cartItems = useMemo(() => {
    return cart
      .map((entry) => {
        const product = products.find((item) => item.id === entry.id);

        if (!product) return null;

        return {
          ...product,
          quantity: entry.quantity,
        };
      })
      .filter(Boolean);
  }, [cart]);

  const cartCount = cartItems.reduce((accumulator, item) => accumulator + item.quantity, 0);

  function addToCart(productId) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === productId);

      if (existing) {
        return currentCart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...currentCart, { id: productId, quantity: 1 }];
    });

    setCartOpen(true);
  }

  const removeFromCart = function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleSearchChange = (nextValue) => {
    startTransition(() => {
      setSearch(nextValue);
    });
  };

  return (
    <div className="react-shell">
      <Header
        search={search}
        onSearchChange={handleSearchChange}
        currency={currency}
        onCurrencyChange={setCurrency}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="react-content">
        <section className="hero-react">
          <div className="hero-copy-react">
            <p className="eyebrow">Componentes + hooks</p>
            <h2>Catalogo React para mostrar conocimientos reales en GitHub</h2>
            <p>
              Esta base incorpora componentes funcionales, props, useState, useEffect,
              formularios controlados, localStorage y fetch de cotizacion.
            </p>
          </div>
          <div className="hero-metrics-react">
            <article>
              <strong>{products.length}</strong>
              <span>productos cargados</span>
            </article>
            <article>
              <strong>{cartCount}</strong>
              <span>items en carrito</span>
            </article>
            <article>
              <strong>{visibleProducts.length}</strong>
              <span>resultados visibles</span>
            </article>
          </div>
        </section>

        <FilterBar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        <ProductGrid
          products={visibleProducts}
          currency={currency}
          rate={usdRate}
          formatMoney={formatMoney}
          onAdd={addToCart}
        />

        <LearningPanel topics={learningTopics} rate={usdRate} rateStatus={rateStatus} />
      </main>

      {cartOpen ? (
        <div className="overlay-react" onClick={() => setCartOpen(false)}>
          <div onClick={(event) => event.stopPropagation()}>
            <CartDrawer
              items={cartItems}
              currency={currency}
              rate={usdRate}
              formatMoney={formatMoney}
              onClose={() => setCartOpen(false)}
              onRemove={removeFromCart}
              onOpenCheckout={() => {
                setCartOpen(false);
                setCheckoutOpen(true);
              }}
            />
          </div>
        </div>
      ) : null}

      {checkoutOpen ? (
        <div className="overlay-react overlay-soft" onClick={() => setCheckoutOpen(false)}>
          <div onClick={(event) => event.stopPropagation()}>
            <CheckoutForm
              items={cartItems}
              currency={currency}
              rate={usdRate}
              formatMoney={formatMoney}
              onClose={() => setCheckoutOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
