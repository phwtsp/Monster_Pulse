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
    const [isOpen, setIsOpen] = useState(false) // For mobile

    useEffect(() => {
        // Check local session
        const stored = localStorage.getItem('monster_user')
        if (stored) {
            setUser(JSON.parse(stored))
        }

        // Listen for storage updates (login event)
        const handleStorage = () => {
            const updated = localStorage.getItem('monster_user')
            if (updated) setUser(JSON.parse(updated))
        }
        window.addEventListener('storage', handleStorage)

        // Listen for Mobile Toggle
        const handleToggle = () => setIsOpen(prev => !prev)
        window.addEventListener('toggle-sidebar', handleToggle)

        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('toggle-sidebar', handleToggle)
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('monster_user')
        router.push('/login')
    }

    const menuItems = [
        { name: 'Início', path: '/', icon: Home },
        { name: 'Cadastro', path: '/cadastro', icon: ClipboardList },
        { name: 'Relatório', path: '/relatorios', icon: BarChart3 },
    ]

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(styles.overlay, isOpen && styles.overlayOpen)}
                onClick={() => setIsOpen(false)}
            />

            <div className={clsx(styles.sidebar, isOpen && styles.open)}>
                <div className={styles.logoBox}>
                    {/* Using <img> for simplicity with public folder, or Next Image */}
                    <img
                        src="/monster-logo-horizontal.png"
                        alt="Monster Energy"
                        style={{ maxWidth: '180px', height: 'auto' }}
                    />
                </div>

                <div className={styles.navSection}>
                    <nav className={styles.nav}>
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.path

                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={clsx(styles.link, isActive && styles.active)}
                                    onClick={() => setIsOpen(false)} // Close on navigate (mobile)
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
                                {(user.name || user.email)?.[0]?.toUpperCase()}
                            </div>
                            <div className={styles.userDetails}>
                                <span className={styles.userName}>{user.name || 'Usuário'}</span>
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
        </>
    )
}
