'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { WizardStep, WIZARD_STEPS } from './types';
import styles from './WizardStepper.module.css';

interface WizardStepperProps {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
}

export function WizardStepper({ currentStep, completedSteps }: WizardStepperProps) {
  const currentIndex = WIZARD_STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className={styles.stepper}>
      {WIZARD_STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.key);
        const isCurrent = step.key === currentStep;
        const isPending = index > currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div
              className={`${styles.step} ${
                isCompleted ? styles.completed : isCurrent ? styles.current : styles.pending
              }`}
            >
              <div className={styles.stepNumber}>
                {isCompleted ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className={styles.stepLabel}>{step.shortLabel}</div>
            </div>
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={`${styles.connector} ${
                  isCompleted ? styles.connectorCompleted : ''
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
