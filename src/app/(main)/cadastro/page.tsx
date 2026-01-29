'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from './cadastro.module.css'
import { Loader2, Plus, User, Zap, Coffee, ShoppingBag, X, CheckCircle, Utensils, Sandwich, Dumbbell, Users, MoreHorizontal, Cylinder } from 'lucide-react'
import * as gtag from '@/lib/gtag'

// Icon mapping (simplified for demo) or just section headers
const FLAVORS = {
    original: ['Monster Energy Green', 'Monster Energy Zero Sugar', 'Monster Absolutely Zero'],
    juice: ['Monster Mango Loco', 'Monster Pacific Punch', 'Monster Pipeline Punch', 'Monster Rio Punch Juice', 'Monster Khaotic'],
    ultra: ['Monster Ultra Watermelon', 'Monster Ultra Paradise', 'Monster Ultra Violet', 'Monster Ultra Fiesta Mango', 'Monster Ultra Peachy Keen', 'Monster Ultra'],
    dragon: ['Monster Dragon Ice Tea Limão', 'Monster Dragon Ice Tea Pêssego'],
}

const MOMENTS = [
    'Café da Manhã',
    'Almoço',
    'Lanche',
    'Para Treinar',
    'Para Confraternizar',
    'Outros'
]

export default function CadastroPage() {
    useEffect(() => {
        document.title = "Monster Pesquisa | Cadastro"
    }, [])

    const [loading, setLoading] = useState(false)

    // Form State
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')

    const [newBrand, setNewBrand] = useState('')
    const [otherBrandsList, setOtherBrandsList] = useState<string[]>([])

    // Consolidated Preferences
    const [preferencesMonster, setPreferencesMonster] = useState<string[]>([])
    const [moments, setMoments] = useState<string[]>([])

    const togglePreference = (setter: any, list: string[], item: string) => {
        if (list.includes(item)) {
            setter(list.filter((i: string) => i !== item))
        } else {
            setter([...list, item])
        }
    }

    const addOtherBrand = () => {
        if (newBrand.trim()) {
            setOtherBrandsList([...otherBrandsList, newBrand.trim()])
            setNewBrand('')
        }
    }

    const removeOtherBrand = (indexToRemove: number) => {
        setOtherBrandsList(otherBrandsList.filter((_, idx) => idx !== indexToRemove))
    }

    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Retrieve user from localStorage (Direct Bypass Login)
        const storedUser = localStorage.getItem('monster_user')
        let userEmail = storedUser ? JSON.parse(storedUser).email : null

        // Extra safety check
        if (typeof userEmail === 'string') {
            userEmail = userEmail.trim()
        }

        if (!userEmail) {
            alert('Erro: Usuário não identificado. Faça login novamente.')
            setLoading(false)
            return
        }

        const otherBrandsString = otherBrandsList.join(', ')

        const payload = {
            user_email: userEmail,
            age: parseInt(age),
            gender,
            preferences_monster: preferencesMonster,
            consumption_moments: moments,
            other_brands: otherBrandsString,
        }

        console.log('Sending Payload:', payload)

        const { error } = await supabase.from('surveys').insert(payload)

        if (error) {
            console.error('Supabase Error:', error)
            alert(`Erro ao salvar: ${error.message} | Payload Email: ${payload.user_email}`)
        } else {
            // Show custom success modal instead of alert
            setShowSuccessModal(true)

            // Track Registration Event
            gtag.event({
                action: 'sign_up',
                category: 'survey',
                label: 'new_registration',
            })
        }
        setLoading(false)
    }

    const handleCloseModal = () => {
        setShowSuccessModal(false)
        // Reset form
        setAge('')
        setGender('')
        setNewBrand('')
        setOtherBrandsList([])
        setPreferencesMonster([])
        setMoments([])

        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const [hoveredFlavor, setHoveredFlavor] = useState<string | null>(null)

    const handleInteractionStart = (flavor: string) => {
        // Don't show if already selected
        if (preferencesMonster.includes(flavor)) return
        setHoveredFlavor(flavor)
    }

    const handleInteractionEnd = () => {
        setHoveredFlavor(null)
    }

    const getImageUrl = (flavor: string) => {
        return `/latas/${flavor}.png`
    }

    return (
        <div className={styles.container}>
            <div className={styles.bgImage} />

            {/* Success Modal */}
            {showSuccessModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <CheckCircle size={64} color="#97d700" style={{ margin: '0 auto' }} />
                        <h2 className={styles.modalTitle}>Cadastro Salvo!</h2>
                        <p className={styles.modalText}>As informações foram registradas com sucesso.</p>
                        <button onClick={handleCloseModal} className={styles.modalButton}>
                            OK, Novo Cadastro
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Can Display */}
            {hoveredFlavor && (
                <div className={styles.floatingCanContainer}>
                    <img
                        src={getImageUrl(hoveredFlavor)}
                        alt={hoveredFlavor}
                        className={styles.floatingCanImage}
                    />
                </div>
            )}

            <h1 className={styles.title}>Ficha de Cadastro</h1>
            <form onSubmit={handleSubmit} className={styles.form}>

                {/* Section: Perfil */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <User size={20} color="#97d700" />
                        <h2 className={styles.sectionTitle}>Perfil</h2>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Idade</label>
                            <input
                                type="number"
                                placeholder="Sua idade"
                                value={age}
                                onChange={e => setAge(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Sexo</label>
                            <div className={styles.radiosContainer}>
                                {['Masculino', 'Feminino', 'Outros'].map(opt => (
                                    <label key={opt} className={`${styles.radioBox} ${gender === opt ? styles.activeRadio : ''}`}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={opt}
                                            checked={gender === opt}
                                            onChange={e => setGender(opt)}
                                            className={styles.hiddenRadio}
                                            required
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>



                {/* Preferences Monster */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Zap size={20} color="#97d700" />
                        <h2 className={styles.sectionTitle}>Preferências Monster</h2>
                    </div>
                    <p className={styles.helperText}>Quais sabores de Monster você mais gosta? (selecione quantos quiser)</p>

                    <div className={styles.flavorGroupsContainer}>
                        <div className={styles.flavorGroup}>
                            <h3>Linha Original e Zero</h3>
                            <div className={styles.checkboxGrid}>
                                {FLAVORS.original.map(flavor => (
                                    <label
                                        key={flavor}
                                        className={`${styles.checkboxBox} ${preferencesMonster.includes(flavor) ? styles.activeCheckbox : ''}`}
                                        onMouseEnter={() => handleInteractionStart(flavor)}
                                        onMouseLeave={handleInteractionEnd}
                                        onTouchStart={() => handleInteractionStart(flavor)}
                                        onTouchEnd={handleInteractionEnd}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={preferencesMonster.includes(flavor)}
                                            onChange={() => {
                                                togglePreference(setPreferencesMonster, preferencesMonster, flavor)
                                                setHoveredFlavor(null)
                                            }}
                                            className={styles.hiddenCheckbox}
                                        />
                                        {flavor}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.flavorGroup}>
                            <h3>Linha Juice</h3>
                            <div className={styles.checkboxGrid}>
                                {FLAVORS.juice.map(flavor => (
                                    <label
                                        key={flavor}
                                        className={`${styles.checkboxBox} ${preferencesMonster.includes(flavor) ? styles.activeCheckbox : ''}`}
                                        onMouseEnter={() => handleInteractionStart(flavor)}
                                        onMouseLeave={handleInteractionEnd}
                                        onTouchStart={() => handleInteractionStart(flavor)}
                                        onTouchEnd={handleInteractionEnd}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={preferencesMonster.includes(flavor)}
                                            onChange={() => {
                                                togglePreference(setPreferencesMonster, preferencesMonster, flavor)
                                                setHoveredFlavor(null)
                                            }}
                                            className={styles.hiddenCheckbox}
                                        />
                                        {flavor}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.flavorGroup}>
                            <h3>Linha Ultra (Zero Açúcar)</h3>
                            <div className={styles.checkboxGrid}>
                                {FLAVORS.ultra.map(flavor => (
                                    <label
                                        key={flavor}
                                        className={`${styles.checkboxBox} ${preferencesMonster.includes(flavor) ? styles.activeCheckbox : ''}`}
                                        onMouseEnter={() => handleInteractionStart(flavor)}
                                        onMouseLeave={handleInteractionEnd}
                                        onTouchStart={() => handleInteractionStart(flavor)}
                                        onTouchEnd={handleInteractionEnd}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={preferencesMonster.includes(flavor)}
                                            onChange={() => {
                                                togglePreference(setPreferencesMonster, preferencesMonster, flavor)
                                                setHoveredFlavor(null)
                                            }}
                                            className={styles.hiddenCheckbox}
                                        />
                                        {flavor}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.flavorGroup}>
                            <h3>Linha Dragon Tea</h3>
                            <div className={styles.checkboxGrid}>
                                {FLAVORS.dragon.map(flavor => (
                                    <label
                                        key={flavor}
                                        className={`${styles.checkboxBox} ${preferencesMonster.includes(flavor) ? styles.activeCheckbox : ''}`}
                                        onMouseEnter={() => handleInteractionStart(flavor)}
                                        onMouseLeave={handleInteractionEnd}
                                        onTouchStart={() => handleInteractionStart(flavor)}
                                        onTouchEnd={handleInteractionEnd}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={preferencesMonster.includes(flavor)}
                                            onChange={() => {
                                                togglePreference(setPreferencesMonster, preferencesMonster, flavor)
                                                setHoveredFlavor(null)
                                            }}
                                            className={styles.hiddenCheckbox}
                                        />
                                        {flavor}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Other Brands */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Cylinder size={20} color="#97d700" />
                        <h2 className={styles.sectionTitle}>Outros Energéticos</h2>
                    </div>
                    <div className={styles.addBrandRow}>
                        <input
                            type="text"
                            placeholder="Ex: Red Bull, TNT Energy..."
                            value={newBrand}
                            onChange={e => setNewBrand(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addOtherBrand()
                                }
                            }}
                            className={styles.input}
                        />
                        <button type="button" onClick={addOtherBrand} className={styles.addButton}>
                            Adicionar
                        </button>
                    </div>
                    {otherBrandsList.length > 0 && (
                        <div className={styles.tagsContainer}>
                            {otherBrandsList.map((brand, idx) => (
                                <span key={idx} className={styles.tag}>
                                    {brand}
                                    <button
                                        type="button"
                                        onClick={() => removeOtherBrand(idx)}
                                        className={styles.removeTagButton}
                                        title="Remover"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                {/* Moments */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <ShoppingBag size={20} color="#97d700" />
                        <h2 className={styles.sectionTitle}>Momentos de Consumo</h2>
                    </div>
                    <p className={styles.helperText}>Em que momentos você toma energético?</p>
                    <div className={styles.checkboxGrid}>
                        {MOMENTS.map(moment => {
                            let Icon = MoreHorizontal;
                            if (moment === 'Café da Manhã') Icon = Coffee;
                            if (moment === 'Almoço') Icon = Utensils;
                            if (moment === 'Lanche') Icon = Sandwich;
                            if (moment === 'Para Treinar') Icon = Dumbbell;
                            if (moment === 'Para Confraternizar') Icon = Users;

                            return (
                                <label key={moment} className={`${styles.checkboxBox} ${moments.includes(moment) ? styles.activeCheckbox : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={moments.includes(moment)}
                                        onChange={() => togglePreference(setMoments, moments, moment)}
                                        className={styles.hiddenCheckbox}
                                    />
                                    <Icon size={18} color="#97d700" style={{ marginRight: '8px' }} />
                                    {moment}
                                </label>
                            )
                        })}
                    </div>
                </section>

                <button type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? <Loader2 className="animate-spin" /> : 'SALVAR CADASTRO'}
                </button>
            </form>
        </div>
    )
}
