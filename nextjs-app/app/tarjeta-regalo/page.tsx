import StaticPageShell from '../../components/StaticPageShell';
import { products } from '../../data/catalog';
import CategoryGrid from '../../components/CategoryGrid';

export default function TarjetaRegaloPage() {
  const giftCards = products.filter(
    (product) => 'isGiftCard' in product && product.isGiftCard === true
  );

  return (
    <StaticPageShell eyebrow="" title="Tarjetas de Regalo">
      <div className="static-copy-react">
        <p>
          Elegi una gift card digital de SANGRIA para regalar una pieza sin tener que elegir el
          modelo en el momento.
        </p>
      </div>
      <CategoryGrid products={giftCards} />
    </StaticPageShell>
  );
}
