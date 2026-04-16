export default function LearningPanel({ topics, rate, rateStatus }) {
  return (
    <section className="learning-panel">
      <div className="learning-head">
        <div>
          <p className="eyebrow">Conceptos incorporados</p>
          <h2>Base de estudio integrada al codigo</h2>
        </div>
        <div className="rate-badge">
          <span>Cotizacion USD/ARS</span>
          <strong>{rate ? rate.toLocaleString("es-AR") : "..."}</strong>
          <small>{rateStatus}</small>
        </div>
      </div>

      <div className="learning-grid">
        {topics.map((topic) => (
          <article key={topic.title} className="learning-card">
            <h3>{topic.title}</h3>
            <ul>
              {topic.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
