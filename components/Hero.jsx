import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-media">
        <Image
          src="/mujer.jpg"
          alt="Coleccion SANGRIA"
          fill
          priority
          sizes="100vw"
        />
      </div>
      <div className="hero-copy">
        <div className="hero-origin">
          <p>MADE A MANO IN BUENOS AIRES, ARGENTINA</p>
          <p>EFFORTLESS PIECES</p>
        </div>
        <Link href="/anillos" className="hero-cta">
          ver piezas
        </Link>
      </div>
    </section>
  );
}
