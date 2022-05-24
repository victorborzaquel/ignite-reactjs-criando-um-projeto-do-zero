import Link from 'next/link';
import { ReactElement } from 'react';
import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link href="/">
          <a>
            <img src="/Logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </div>
  );
}
