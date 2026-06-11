import StaticPageShell from '../../components/StaticPageShell';

export default function CuidadosPage() {
  return (
    <StaticPageShell eyebrow="Cuidados" title="Cuidado de tus piezas de plata">
      <div className="static-copy-react">
        <p>
          La plata es un material noble y duradero, pero requiere ciertos cuidados para conservar
          su brillo y belleza original con el paso del tiempo.
        </p>

        <h2>Recomendaciones</h2>
        <ul>
          <li>Evita el contacto con agua, perfumes, cremas y productos quimicos.</li>
          <li>Quitate las piezas antes de banarte, hacer ejercicio o nadar.</li>
          <li>Guardalas en un lugar seco, idealmente en su packaging o en bolsas individuales.</li>
          <li>Limpia la pieza suavemente con un pano especial para plata.</li>
          <li>Usalas con frecuencia: el contacto con la piel ayuda a mantener su apariencia.</li>
        </ul>

        <p className="care-note-react">
          Importante: con el tiempo, la plata puede oscurecerse naturalmente debido a la
          oxidacion. Esto es normal y no afecta la calidad de la pieza. Con una limpieza adecuada,
          recupera su brillo original.
        </p>
      </div>
    </StaticPageShell>
  );
}
