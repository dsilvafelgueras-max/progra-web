import StaticPageShell from '../../components/StaticPageShell';

export default function CambiosPage() {
  return (
    <StaticPageShell eyebrow="Ayuda" title="Cambios y devoluciones">
      <div className="static-copy-react">
        <p>
          Si necesitas cambiar o devolver una pieza, escribinos dentro de los 10 dias corridos
          desde recibida la compra para revisar tu caso.
        </p>

        <h2>Condiciones</h2>
        <ul>
          <li>La pieza debe estar sin uso y en su packaging original.</li>
          <li>Los costos de envio pueden variar segun el motivo del cambio.</li>
          <li>Las piezas realizadas a pedido se revisan caso por caso.</li>
        </ul>
      </div>
    </StaticPageShell>
  );
}
