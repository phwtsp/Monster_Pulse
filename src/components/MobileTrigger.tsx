'use client'
import { Menu } from 'lucide-react'

export default function MobileTrigger() {
    return (
        <button
            onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
            className="mobile-trigger-btn"
            aria-label="Toggle Menu"
        >
            <Menu color="#000" size={24} />
        </button>
    )
}
