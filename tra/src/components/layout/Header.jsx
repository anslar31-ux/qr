import React from 'react';
import { Link } from 'react-router-dom';
import { Map, User } from 'lucide-react';
import { Button } from '../ui/Button';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link to="/" className={styles.logo}>
          <Map className={styles.logoIcon} size={24} />
          <span>PlanNGo</span>
        </Link>
        
        <div className={styles.actions}>
          <Link to="/login">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link to="/plan">
            <Button variant="primary" size="sm">Start Planning</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
