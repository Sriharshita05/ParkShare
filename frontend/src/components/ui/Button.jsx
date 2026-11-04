import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-glow hover:from-brand-400 hover:to-brand-600 hover:-translate-y-0.5',
  dark: 'bg-navy-900 text-white shadow-soft hover:bg-navy-800 hover:-translate-y-0.5',
  secondary: 'bg-white text-navy-800 border border-navy-200 shadow-soft hover:border-brand-300 hover:text-brand-700',
  ghost: 'text-navy-700 hover:bg-navy-50',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-soft',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
}

const sizes = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
}

export default function Button({
  as,
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  children,
  ...props
}) {
  const classes = `group inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`
  const content = (
    <>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
      {IconRight && !loading && <IconRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }
  const Tag = as || 'button'
  return (
    <Tag className={classes} disabled={loading || props.disabled} {...props}>
      {content}
    </Tag>
  )
}
