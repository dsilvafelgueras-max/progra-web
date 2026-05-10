import StaticPageShell from '../../components/StaticPageShell';

export default function ContactoPage() {
  return (
    <StaticPageShell eyebrow="Contacto" title="Consulta personalizada">
      <form className="static-form-react">
        <label>
          <span>Nombre</span>
          <input type="text" placeholder="Tu nombre" required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" placeholder="tu@email.com" required />
        </label>
        <label className="is-full">
          <span>Mensaje</span>
          <textarea placeholder="Contanos que pieza te interesa" rows={7} required />
        </label>
        <button type="submit" className="primary-button-react">
          Enviar consulta
        </button>
      </form>
    </StaticPageShell>
  );
}
