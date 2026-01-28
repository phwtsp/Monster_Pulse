'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import styles from './login.module.css'
import { Loader2, Zap, Mail } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg('')

        try {
            // 1. Check if user is authorized 
            const { data: user, error: userError } = await supabase
                .from('authorized_users')
                .select('email')
                .eq('email', email)
                .single()

            if (userError || !user) {
                setErrorMsg('Este e-mail não possui permissão de acesso.')
                setLoading(false)
                return
            }

            // 2. Direct Bypass Login
            // We use localStorage to persist a simple "session"
            localStorage.setItem('monster_user', JSON.stringify({ email: user.email }))

            // Dispatch to notify other components (Sidebar) immediately
            window.dispatchEvent(new Event('storage'))

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
                    <div className={styles.iconCircle}>
                        <Zap size={32} color="#000" fill="#000" />
                    </div>
                    <h1 className={styles.brandName}>Monster Frame</h1>
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
                                {loading ? <Loader2 className="animate-spin" /> : 'Entrar no App'}
                            </button>

                            <p className={styles.footerText}>Acesso rápido e seguro apenas com email</p>
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
