import StaticPageShell from '../../components/StaticPageShell';

const sizes = [
  ['N°8', '15,0 mm'],
  ['N°9', '15,2 mm'],
  ['N°10', '15,6 mm'],
  ['N°11', '16,0 mm'],
  ['N°12', '16,2 mm'],
  ['N°13', '16,6 mm'],
  ['N°14', '17,0 mm'],
  ['N°15', '17,2 mm'],
  ['N°16', '17,6 mm'],
  ['N°17', '17,9 mm'],
  ['N°18', '18,2 mm'],
  ['N°19', '18,6 mm'],
  ['N°20', '19,0 mm'],
  ['N°21', '19,3 mm'],
  ['N°22', '20,0 mm'],
  ['N°23', '20,3 mm'],
  ['N°24', '20,6 mm'],
  ['N°25', '21,0 mm'],
];

export default function GuiaTallesPage() {
  return (
    <StaticPageShell eyebrow="Guia de talles" title="Como saber mi talle de anillo">
      <div className="static-copy-react">
        <p>
          Tu pieza es unica. Elegir el talle correcto de anillo es super importante para que te
          quede perfecto. Aca te dejamos una guia simple para medir tu talle desde casa.
        </p>

        <h2>Opcion 1: usa un anillo que ya te quede bien</h2>
        <p>
          Toma un anillo que ya te quede comodo en el dedo donde usaras tu nuevo anillo. Medi el
          diametro interno del anillo en milimetros, sin contar el metal.
        </p>

        <h2>Opcion 2: medi con una tira de papel</h2>
        <p>
          Corta una tira de papel o usa un hilo delgado, envolvelo alrededor de la base del dedo
          y medi la longitud total donde se cruza.
        </p>

        <h2>Tips importantes</h2>
        <ul>
          <li>Medi tu dedo al final del dia, cuando suele estar mas grande.</li>
          <li>Evita medirlo si esta frio, porque puede estar mas delgado de lo normal.</li>
          <li>Si estas entre dos talles, te recomendamos elegir el mas grande.</li>
        </ul>
      </div>

      <div className="size-grid-react">
        {sizes.map(([label, value]) => (
          <div key={label} className="size-item-react">
            <div className="size-circle-react">{label}</div>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </StaticPageShell>
  );
}
