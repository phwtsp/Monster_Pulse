import Sidebar from '@/components/Sidebar/Sidebar'
import styles from './layout.module.css'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    )
}
