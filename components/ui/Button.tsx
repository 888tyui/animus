'use client'

import { type FC, type ReactNode, type ButtonHTMLAttributes } from 'react'
import Spinner from './Spinner'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  loading?: boolean
  children: ReactNode
}

const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading

  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    isDisabled ? styles.disabled : '',
    loading ? styles.loading : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classNames} disabled={isDisabled} {...props}>
      {loading ? (
        <Spinner size="sm" color={variant === 'primary' ? '#06050E' : undefined} />
      ) : (
        icon && <span className={styles.icon}>{icon}</span>
      )}
      <span>{children}</span>
    </button>
  )
}

export default Button
