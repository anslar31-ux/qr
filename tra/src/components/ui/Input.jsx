import React from 'react';
import styles from './Input.module.css';

export const Input = React.forwardRef(({
  label,
  icon: Icon,
  error,
  className = '',
  wrapperClassName = '',
  ...props
}, ref) => {
  const inputClass = [
    styles.input,
    Icon ? styles.withIcon : '',
    error ? styles.error : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.inputWrapper} ${wrapperClassName}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputContainer}>
        {Icon && (
          <div className={styles.iconWrapper}>
            <Icon size={18} />
          </div>
        )}
        <input ref={ref} className={inputClass} {...props} />
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
