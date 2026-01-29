'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import styles from './login.module.css'
import { Loader2, Zap, Mail } from 'lucide-react'
import * as gtag from '@/lib/gtag'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const router = useRouter()

    useEffect(() => {
        document.title = "Monster Pesquisa | Login"
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg('')

        try {
            // 1. Check if user is authorized 
            const { data: user, error: userError } = await supabase
                .from('authorized_users')
                .select('email, name')
                .eq('email', email)
                .single()

            if (userError || !user) {
                setErrorMsg('Este e-mail não possui permissão de acesso.')
                setLoading(false)
                return
            }

            // 2. Direct Bypass Login
            // We use localStorage to persist a simple "session"
            localStorage.setItem('monster_user', JSON.stringify({ email: user.email, name: user.name }))

            // Dispatch to notify other components (Sidebar) immediately
            window.dispatchEvent(new Event('storage'))

            // Track Login Event
            gtag.event({
                action: 'login',
                category: 'authentication',
                label: email,
            })

            // Redirect
            router.push('/')

        } catch (err: any) {
            setErrorMsg('Ocorreu um erro inesperado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.centeredContent}>

                <div className={styles.logoHeader}>
                    <Image
                        src="/monster-logo-full.png"
                        alt="Monster Pulse"
                        width={280}
                        height={80}
                        priority
                        style={{ objectFit: 'contain', marginBottom: '1rem' }}
                    />
                    <p className={styles.brandSubtitle}>Event Data Collector</p>
                </div>

                <div className={styles.card}>
                    {!sent ? (
                        <form onSubmit={handleLogin} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Email de Acesso</label>
                                <div className={styles.inputWrapper}>
                                    <Mail size={20} className={styles.inputIcon} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleLogin(e)
                                        }}
                                        placeholder="Digite seu email"
                                        className={styles.input}
                                        required
                                    />
                                </div>
                            </div>

                            {errorMsg && <p className={styles.error}>{errorMsg}</p>}

                            <button type="submit" disabled={loading} className={styles.button}>
                                {loading ? <Loader2 className="animate-spin" /> : 'Acessa App'}
                            </button>

                            <p className={styles.footerText}>
                                Faça login com o e-mail previamente cadastrado. Para solicitar cadastro{' '}
                                <a
                                    href="http://wa.me/5514998229745"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#97d700', textDecoration: 'none', fontWeight: 'bold' }}
                                >
                                    entre em contato
                                </a>
                            </p>
                        </form>
                    ) : (
                        <div className={styles.success}>
                            <div className={styles.iconCircleSuccess}>
                                <Mail size={32} color="#97d700" />
                            </div>
                            <h2 className={styles.successTitle}>Verifique seu Email</h2>
                            <p>Enviamos um link de acesso para <b>{email}</b></p>
                            <button onClick={() => setSent(false)} className={styles.linkButton}>
                                Voltar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
