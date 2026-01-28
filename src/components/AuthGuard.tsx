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
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#000'
            }}>
                <Loader2 className="animate-spin" color="#97d700" size={48} />
            </div>
        )
    }

    if (!authorized) {
        return null
    }

    return <>{children}</>
}
