import Link from 'next/link';

const homeCategories = [
  {
    label: 'Anillos',
    href: '/anillos',
    image: '/products/anillo-sello-catalogo.png',
  },
  {
    label: 'Pulseras',
    href: '/pulseras',
    image: '/products/pulsera-cadena-toggle.png',
  },
  {
    label: 'Aros',
    href: '/aros',
    image: '/products/aros-2.png',
  },
  {
    label: 'Earcuff',
    href: '/earcuff',
    image: '/products/earcuff-2.png',
  },
  {
    label: 'Collares',
    href: '/collares',
    image: '/products/collar-toggle.png',
  },
];

export default function HomeCategoryStrip() {
  return (
    <section className="home-category-strip" aria-label="Categorias principales">
      {homeCategories.map((category) => (
        <Link href={category.href} className="home-category-card" key={category.href}>
          <div className="home-category-image">
            <img src={category.image} alt={category.label} />
          </div>
          <span>{category.label}</span>
        </Link>
      ))}
    </section>
  );
}
