import './Section.css'

export default function Section({ title, children, id }) {
  return (
    <section className="main-section" aria-labelledby={id}>
      <h2 id={id} className="section-title">{title}</h2>
      {children}
    </section>
  )
}
