import Link from 'next/link';

const paymentLogos = [
  { src: '/assets/payments/mercado-pago.webp', alt: 'Mercado Pago' },
  { src: '/assets/payments/apple-pay.png', alt: 'Apple Pay' },
  { src: '/assets/payments/visa.png', alt: 'Visa' },
  { src: '/assets/payments/mastercard.svg', alt: 'Mastercard' },
  { src: '/assets/payments/amex.svg', alt: 'American Express' },
  { src: '/assets/payments/naranja.png', alt: 'Naranja' },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer-react">
      <div className="site-footer-grid">
        <div>
          <p className="eyebrow">Ayuda</p>
          <div className="footer-links-react">
            <Link href="/contacto">contactanos</Link>
            <Link href="/guia-talles">guia de talles</Link>
            <Link href="/cuidados">cuidados</Link>
          </div>
        </div>

        <div>
          <p className="eyebrow">Legal</p>
          <div className="footer-links-react">
            <Link href="/arrepentimiento">boton de arrepentimiento</Link>
          </div>
        </div>

        <div>
          <p className="eyebrow">Seguinos</p>
          <div className="footer-links-react footer-socials-react">
            <a href="https://www.instagram.com/sangriajewelry/" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">
              TikTok
            </a>
          </div>
        </div>
      </div>

      <div className="footer-payments-react">
        <span>Medios de pago</span>
        <div className="footer-payment-grid-react">
          {paymentLogos.map((logo) => (
            <div key={logo.alt} className="footer-payment-box-react">
              <img src={logo.src} alt={logo.alt} />
            </div>
          ))}
        </div>
      </div>

      <p className="footer-brand-react">SANGRIA</p>
    </footer>
  );
}
