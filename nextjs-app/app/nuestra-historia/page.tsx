import StaticPageShell from '../../components/StaticPageShell';

export default function NuestraHistoriaPage() {
  return (
    <StaticPageShell eyebrow="Sobre nosotras" title="Nuestra historia">
      <div className="static-copy-react">
        <p>Sangría nace de una intuición: la de crear algo que no sea solo objeto, sino experiencia.</p>

        <p>No empezó como una marca, sino como una búsqueda. Una forma de traducir lo que no siempre se puede decir en palabras: el cuerpo, la energía, los momentos que dejan huella. Cada pieza surge desde ahí, desde lo esencial, sin artificio.</p>

        <p>Trabajamos con materiales que respiran, que cambian, que se transforman con el tiempo. Nos interesa lo imperfecto, lo orgánico, lo que tiene textura y memoria. Porque creemos que lo verdadero no es pulido: es vivido.</p>

        <p>Sangría es mezcla. De influencias, de estados, de caminos. Hay algo visceral en su nombre, algo que remite a lo que circula, a lo que conecta. A lo que nos atraviesa.</p>

        <p>No diseñamos para adornar, sino para acompañar. Para que cada pieza se vuelva parte de quien la lleva.</p>

        <p className="historia-cierre">Esto no es solo joyería.<br />Es una forma de sentir.</p>
      </div>
    </StaticPageShell>
  );
}
