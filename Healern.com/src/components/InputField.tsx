import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'

type CommonProps = {
  label: string
  helperText?: string
  error?: string
  icon?: ReactNode
  rightSlot?: ReactNode
  className?: string
}

type InputFieldProps = CommonProps & {
  as?: 'input'
  inputProps?: InputHTMLAttributes<HTMLInputElement>
}

type SelectFieldProps = CommonProps & {
  as: 'select'
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>
  children: ReactNode
}

type Props = InputFieldProps | SelectFieldProps

export function InputField(props: Props) {
  const {
    label,
    helperText,
    error,
    icon,
    rightSlot,
    className = '',
  } = props

  const baseControlClasses = [
    'w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10',
    icon ? 'pl-11' : '',
    rightSlot ? 'pr-12' : '',
    error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <label className={['block space-y-2', className].filter(Boolean).join(' ')}>
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
            {icon}
          </span>
        ) : null}

        {props.as === 'select' ? (
          <select
            className={`${baseControlClasses} appearance-none pr-10`}
            {...props.selectProps}
          >
            {props.children}
          </select>
        ) : (
          <input className={baseControlClasses} {...props.inputProps} />
        )}

        {rightSlot ? (
          <span className="absolute inset-y-0 right-3 flex items-center">
            {rightSlot}
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400">{helperText}</p>
      ) : null}
    </label>
  )
}
