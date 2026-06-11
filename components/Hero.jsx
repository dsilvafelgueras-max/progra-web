import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-media">
        <img src="/mujer.jpg" alt="Coleccion SANGRIA" />
      </div>
      <div className="hero-copy">
        <div className="hero-origin">
          <p>MADE A MANO IN BUENOS AIRES, ARGENTINA</p>
        </div>
        <Link href="/anillos" className="hero-cta">VER ANILLOS</Link>
      </div>
    </section>
  );
}
