'use client'

import styles from './page.module.css'
import Link from 'next/link'
import { ClipboardList, BarChart3, Zap } from 'lucide-react'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    document.title = "Monster Pesquisa | Início"
  }, [])
  return (
    <div className={styles.landingContainer}>
      <video
        className={styles.bgVideo}
        autoPlay
        loop
        muted
        playsInline
        src="https://www.callofduty.com/cod/cdn/bo7/BO7_IGS_CODHQ_BaseKA_1696x1056_02sk_CLEAN_Compressed.mp4"
      />
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
          CADASTRO
        </Link>
        <Link href="/relatorios" className={styles.bigButton}>
          <BarChart3 size={24} />
          RELATÓRIO
        </Link>
      </div>
    </div>
  )
}
