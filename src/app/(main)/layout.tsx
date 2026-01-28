import Sidebar from '@/components/Sidebar/Sidebar'
import MobileTrigger from '@/components/MobileTrigger'
import styles from './layout.module.css'
import AuthGuard from '@/components/AuthGuard'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard>
            <div className={styles.container}>
                <MobileTrigger />
                <Sidebar />
                <main className={styles.mainContent}>
                    {children}
                </main>
            </div>
        </AuthGuard>
    )
}
