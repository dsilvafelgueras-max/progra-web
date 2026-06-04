export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-copy">© {new Date().getFullYear()} Sangria. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
