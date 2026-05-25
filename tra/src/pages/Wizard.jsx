import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Train, Car, Bus, MapPin, Users, Calendar, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProgressSteps } from '../components/ui/ProgressSteps';
import styles from './Wizard.module.css';

const STEPS = ['Location', 'Destination', 'Transport', 'Details', 'Budget'];

const TRANSPORT_OPTIONS = [
  { id: 'flight', name: 'Flight', icon: Plane },
  { id: 'train', name: 'Train', icon: Train },
  { id: 'car', name: 'Car / Drive', icon: Car },
  { id: 'bus', name: 'Bus', icon: Bus },
];

export function Wizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    startLocation: '',
    destination: '',
    transport: 'flight',
    groupSize: 4,
    days: 4,
    budget: 25000
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Simulate generating AI trip and go to results
      navigate('/results', { state: { formData } });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.container}>
      <ProgressSteps steps={STEPS} currentStep={currentStep} />
      
      <Card className={styles.wizardCard}>
        {currentStep === 0 && (
          <div>
            <h2 className={styles.stepTitle}>Where are you starting from?</h2>
            <div className={styles.formGroup}>
              <Input 
                icon={MapPin}
                placeholder="e.g. Mumbai, Maharashtra"
                value={formData.startLocation}
                onChange={(e) => updateForm('startLocation', e.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h2 className={styles.stepTitle}>Where do you want to go?</h2>
            <div className={styles.formGroup}>
              <Input 
                icon={MapPin}
                placeholder="e.g. Goa"
                value={formData.destination}
                onChange={(e) => updateForm('destination', e.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className={styles.stepTitle}>How do you want to travel?</h2>
            <div className={styles.transportGrid}>
              {TRANSPORT_OPTIONS.map((opt) => (
                <div 
                  key={opt.id}
                  className={`${styles.transportCard} ${formData.transport === opt.id ? styles.selected : ''}`}
                  onClick={() => updateForm('transport', opt.id)}
                >
                  <opt.icon size={24} className={styles.transportIcon} />
                  <div className={styles.transportName}>{opt.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className={styles.stepTitle}>Trip details</h2>
            <div className={styles.formGroup}>
              <Input 
                label="Number of Travelers"
                icon={Users}
                type="number"
                min="1"
                value={formData.groupSize}
                onChange={(e) => updateForm('groupSize', e.target.value)}
              />
              <Input 
                label="Number of Days"
                icon={Calendar}
                type="number"
                min="1"
                value={formData.days}
                onChange={(e) => updateForm('days', e.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 className={styles.stepTitle}>What's your total budget (₹)?</h2>
            <div className={styles.formGroup}>
              <Input 
                icon={DollarSign}
                type="number"
                min="1000"
                value={formData.budget}
                onChange={(e) => updateForm('budget', e.target.value)}
              />
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Total for {formData.groupSize} people in Indian Rupees (₹)
              </p>
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <Button 
            variant="secondary" 
            onClick={handleBack} 
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === STEPS.length - 1 ? 'Generate Plan' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
