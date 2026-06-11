import StaticPageShell from '../../components/StaticPageShell';

export default function ArrepentimientoPage() {
  return (
    <StaticPageShell eyebrow="Legal" title="Boton de arrepentimiento">
      <div className="static-copy-react">
        <p>
          Si te arrepentiste de una compra, podes pedir la cancelacion enviando este formulario
          con tu numero de orden. Tenes como maximo hasta 10 dias corridos desde que recibiste el
          producto.
        </p>
      </div>

      <form className="static-form-react">
        <label>
          <span>Nombre</span>
          <input type="text" placeholder="ej.: Maria Perez" required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" placeholder="ej.: tuemail@email.com" required />
        </label>
        <label>
          <span>Telefono</span>
          <input type="tel" placeholder="ej.: 1123445567" required />
        </label>
        <label className="is-full">
          <span>Mensaje</span>
          <textarea rows={7} placeholder="ej.: Tu mensaje" required />
        </label>
        <button type="submit" className="primary-button-react">
          Enviar solicitud
        </button>
      </form>
    </StaticPageShell>
  );
}
