import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">

      <div className="footer-columns">

        <div className="footer-col">
          <h3 className="footer-col-title">Ayuda</h3>
          <Link href="/contacto">Contactanos</Link>
          <Link href="/cambios">Cambios y devoluciones</Link>
          <Link href="/guia-talles">Guia de talles</Link>
          <Link href="/cuidados">Cuidados</Link>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Legal</h3>
          <Link href="/arrepentimiento">Boton de arrepentimiento</Link>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Sobre Sangria</h3>
          <Link href="/nuestra-historia">Nuestra historia</Link>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Seguinos</h3>
          <a href="https://www.instagram.com/sangriajewelry/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.tiktok.com/@lolisilvafelgue" target="_blank" rel="noreferrer">Tiktok</a>
        </div>

      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© {new Date().getFullYear()} Sangria. Todos los derechos reservados.</p>
        <p className="footer-signature">SANGRIA</p>
      </div>

    </footer>
  );
}
