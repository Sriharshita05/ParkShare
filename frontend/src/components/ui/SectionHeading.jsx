export default function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  return (
    <div className={`mx-auto max-w-2xl ${align === 'center' ? 'text-center' : 'text-left mx-0'}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-4 text-3xl font-extrabold text-navy-900 sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-navy-600">{description}</p>}
    </div>
  )
}
