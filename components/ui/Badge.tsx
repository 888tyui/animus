'use client'

import { type FC, type ReactNode } from 'react'
import styles from './Badge.module.css'

interface BadgeProps {
  children: ReactNode
  color: string
  variant?: 'filled' | 'outline'
  size?: 'sm' | 'md'
}

const Badge: FC<BadgeProps> = ({
  children,
  color,
  variant = 'filled',
  size = 'sm',
}) => {
  const classNames = [styles.badge, styles[variant], styles[size]].join(' ')

  const inlineStyles =
    variant === 'filled'
      ? {
          backgroundColor: `${color}26`,
          color,
        }
      : {
          borderColor: `${color}4D`,
          color,
        }

  return (
    <span className={classNames} style={inlineStyles}>
      {children}
    </span>
  )
}

export default Badge
