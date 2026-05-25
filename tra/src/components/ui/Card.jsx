import React from 'react';
import styles from './Card.module.css';

export function Card({ children, className = '', hoverable = false, glass = false }) {
  const cardClass = [
    styles.card,
    hoverable ? styles.hoverable : '',
    glass ? styles.glass : '',
    className
  ].filter(Boolean).join(' ');

  return <div className={cardClass}>{children}</div>;
}

export function CardHeader({ children, className = '' }) {
  return <div className={`${styles.cardHeader} ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`${styles.cardContent} ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`${styles.cardFooter} ${className}`}>{children}</div>;
}
