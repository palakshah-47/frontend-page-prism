import styles from './Button.module.css'
import clsx from 'clsx'

const Button = ({ children, className, variant = 'primary', ...props }) => {
  const variantStyles = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    danger: styles.buttonDanger,
  }

  return (
    <button
      type="button"
      className={clsx(
        styles.button,
        className,
        variantStyles[variant] || variantStyles.primary
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
