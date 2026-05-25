import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Map, Wallet, Users, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import styles from './Landing.module.css';

export function Landing() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className="container">
          <h1 className={styles.title}>
            Budget group travel, <br />
            <span className="text-gradient">planned by AI.</span>
          </h1>
          <p className={styles.subtitle}>
            PlanNGo generates complete trip itineraries, splits costs, and finds the best budget options for your group in seconds.
          </p>
          <div className={styles.ctaGroup}>
            <Link to="/plan">
              <Button size="lg" className={styles.heroBtn}>
                <Sparkles size={18} />
                Plan Your Trip
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Smarter travel, simpler planning</h2>
          <div className={styles.featureGrid}>
            <Card hoverable className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Wallet size={24} />
              </div>
              <h3 className={styles.featureTitle}>Budget Optimization</h3>
              <p className={styles.featureDesc}>
                Set your total budget and let AI find the best combination of transport, stay, and food that fits everyone's pocket.
              </p>
            </Card>
            
            <Card hoverable className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Users size={24} />
              </div>
              <h3 className={styles.featureTitle}>Group Collaboration</h3>
              <p className={styles.featureDesc}>
                Easily split costs, share itineraries, and let your group vote on the best options before finalizing.
              </p>
            </Card>

            <Card hoverable className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Compass size={24} />
              </div>
              <h3 className={styles.featureTitle}>Smart Routes</h3>
              <p className={styles.featureDesc}>
                Choose between the cheapest, fastest, or a balanced route. We analyze thousands of paths instantly.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
