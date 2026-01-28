'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, BarChart3, LogOut, Zap, User } from 'lucide-react'
import styles from './Sidebar.module.css'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
        })
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const menuItems = [
        { name: 'Início', path: '/', icon: Home },
        { name: 'Cadastro', path: '/cadastro', icon: ClipboardList },
        { name: 'Relatórios', path: '/relatorios', icon: BarChart3 },
    ]

    return (
        <div className={styles.sidebar}>
            <div className={styles.logoBox}>
                <Zap fill="#97d700" stroke="#000" size={32} />
                <div className={styles.logoTitle}>Monster Frame</div>
                <div className={styles.logoSubtitle}>Event Data Collector</div>
            </div>

            <div className={styles.navSection}>
                <div className={styles.navTitle}>Navegação</div>
                <nav className={styles.nav}>
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.path

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={clsx(styles.link, isActive && styles.active)}
                            >
                                <Icon size={18} style={{ marginRight: 10 }} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className={styles.userSection}>
                {user && (
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>paulo.pereira</span>
                            <span className={styles.userEmail}>
                                {user.email?.length > 18 ? user.email.substring(0, 18) + '...' : user.email}
                            </span>
                        </div>
                    </div>
                )}
                <button onClick={handleLogout} className={styles.logoutButton}>
                    <LogOut size={16} />
                    Sair
                </button>
            </div>
        </div>
    )
}
