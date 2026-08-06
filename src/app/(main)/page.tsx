'use client'

import styles from './page.module.css'
import Link from 'next/link'
import { ClipboardList, BarChart3 } from 'lucide-react'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    document.title = "Monster BGS 2026 | Início"
  }, [])
  return (
    <div className={styles.landingContainer}>
      <div className={styles.bgImage} aria-hidden="true" />
      <div className={styles.logoArea}>
        <img
          src="/bgs/logo-m-bgs.png"
          alt="Monster BGS 2026"
          className={styles.logoImage}
        />
      </div>

      <div className={styles.actionButtons}>
        <Link href="/cadastro" className={styles.bigButton}>
          <ClipboardList size={24} />
          PESQUISA
        </Link>
        <Link href="/relatorios" className={styles.bigButton}>
          <BarChart3 size={24} />
          RELATÓRIO
        </Link>
      </div>
    </div>
  )
}
