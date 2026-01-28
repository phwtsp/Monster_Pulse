'use client'

import styles from './page.module.css'
import Link from 'next/link'
import { ClipboardList, BarChart3, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className={styles.landingContainer}>
      <div className={styles.logoArea}>
        {/* Using Lucide icon as placeholder for Monster Logo to look "premium" */}
        <Zap size={100} color="#97d700" fill="#97d700" className={styles.glow} />
        <h1 className={styles.brandTitle}>MONSTER<br />ENERGY</h1>
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
