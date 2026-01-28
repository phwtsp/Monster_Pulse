import Sidebar from '@/components/Sidebar/Sidebar'
import MobileTrigger from '@/components/MobileTrigger'
import styles from './layout.module.css'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={styles.container}>
            <MobileTrigger />
            <Sidebar />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    )
}
