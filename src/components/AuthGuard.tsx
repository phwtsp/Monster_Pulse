'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        // Run check on mount
        const user = localStorage.getItem('monster_user')

        if (!user) {
            router.push('/login')
        } else {
            setAuthorized(true)
        }
        setChecking(false)
    }, [router])

    if (checking) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: '#000',
                color: '#fff',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <Loader2 className="animate-spin" color="#97d700" size={48} />
                <p style={{ margin: 0, color: '#aaa' }}>Carregando a pesquisa BGS 2026...</p>
                <a
                    href="/login"
                    style={{
                        color: '#97d700',
                        fontWeight: 700,
                        textDecoration: 'underline'
                    }}
                >
                    Abrir tela de login
                </a>
            </div>
        )
    }

    if (!authorized) {
        return null
    }

    return <>{children}</>
}
