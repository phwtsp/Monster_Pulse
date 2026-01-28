'use client'

import styles from './page.module.css'
import Link from 'next/link'
import { ClipboardList, BarChart3, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className={styles.landingContainer}>
      <div className={styles.logoArea}>
        <img
          src="/monster-logo-home.png"
          alt="Monster Energy"
          className={styles.logoImage}
        />
      </div>

      <div className={styles.actionButtons}>
        <Link href="/cadastro" className={styles.bigButton}>
          <ClipboardList size={24} />
          CADASTROS
        </Link>
        <Link href="/relatorios" className={styles.bigButton}>
          <BarChart3 size={24} />
          RELATÓRIOS
        </Link>
      </div>
    </div>
  )
}
