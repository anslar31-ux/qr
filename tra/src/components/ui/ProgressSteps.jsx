import React from 'react';
import { Check } from 'lucide-react';
import styles from './ProgressSteps.module.css';

export function ProgressSteps({ steps, currentStep }) {
  return (
    <div className={styles.container}>
      <div className={styles.line} />
      <div 
        className={styles.progressLine} 
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div 
            key={index} 
            className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
          >
            <div className={styles.circle}>
              {isCompleted ? <Check size={16} /> : index + 1}
            </div>
            <span className={styles.label}>{step}</span>
          </div>
        );
      })}
    </div>
  );
}
