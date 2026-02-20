import React from 'react'
import styles from './ErrorMessage.module.css'
import Button from './Button'

/**
 * Displays an error message to the user with optional retry and dismiss actions.
 * @param {string} message - The error message to display
 * @param {() => void} [onRetry] - Optional callback when user clicks "Try again"
 * @param {() => void} [onDismiss] - Optional callback when user dismisses the error
 */
const ErrorMessage = ({ message, onRetry, onDismiss }) => {
  if (!message) return null

  return (
    <div className={styles.error} role="alert">
      <span className={styles.message}>{message}</span>
      <div className={styles.actions}>
        {onRetry && (
          <Button onClick={onRetry} className={styles.retryButton}>
            Try again
          </Button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={styles.dismiss}
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage
