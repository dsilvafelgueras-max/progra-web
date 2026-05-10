export default function StaticPageShell({ eyebrow, title, children }) {
  return (
    <main className="react-content static-page-react">
      <header className="static-page-header-react">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
      </header>
      <section className="static-page-body-react">{children}</section>
    </main>
  );
}
