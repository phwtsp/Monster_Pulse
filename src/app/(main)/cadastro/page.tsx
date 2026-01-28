'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from './cadastro.module.css'
import { Loader2, Plus, User, Zap, Coffee, ShoppingBag, Gamepad } from 'lucide-react'

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
    const [loading, setLoading] = useState(false)

    // Form State
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const [gamesPerDay, setGamesPerDay] = useState('') // New Field
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        const otherBrandsString = otherBrandsList.join(', ')

        const { error } = await supabase.from('surveys').insert({
            user_email: user?.email,
            age: parseInt(age),
            gender,
            preferences_monster: preferencesMonster,
            consumption_moments: moments,
            other_brands: otherBrandsString,
            games_per_day: parseInt(gamesPerDay || '0'), // Insert new field
        })

        if (error) {
            alert('Erro ao salvar: ' + error.message)
        } else {
            alert('Cadastro salvo com sucesso!')
            setAge('')
            setGender('')
            setNewBrand('')
            setOtherBrandsList([])
            setPreferencesMonster([])
            setMoments([])
            setGamesPerDay('')
        }
        setLoading(false)
    }

    return (
        <div className={styles.container}>
            <div className={styles.bgImage} />
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

                {/* Section: Jogos */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Gamepad size={20} color="#97d700" />
                        <h2 className={styles.sectionTitle}>Jogos</h2>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Quantidade de jogos por dia</label>
                        <input
                            type="number"
                            placeholder="Ex: 2"
                            value={gamesPerDay}
                            onChange={e => setGamesPerDay(e.target.value)}
                            className={styles.input}
                            required
                        />
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
                                    <label key={flavor} className={`${styles.checkboxBox} ${preferencesMonster.includes(flavor) ? styles.activeCheckbox : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={preferencesMonster.includes(flavor)}
                                            onChange={() => togglePreference(setPreferencesMonster, preferencesMonster, flavor)}
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
                                    <label key={flavor} className={`${styles.checkboxBox} ${preferencesMonster.includes(flavor) ? styles.activeCheckbox : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={preferencesMonster.includes(flavor)}
                                            onChange={() => togglePreference(setPreferencesMonster, preferencesMonster, flavor)}
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
                                    <label key={flavor} className={`${styles.checkboxBox} ${preferencesMonster.includes(flavor) ? styles.activeCheckbox : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={preferencesMonster.includes(flavor)}
                                            onChange={() => togglePreference(setPreferencesMonster, preferencesMonster, flavor)}
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
                                    <label key={flavor} className={`${styles.checkboxBox} ${preferencesMonster.includes(flavor) ? styles.activeCheckbox : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={preferencesMonster.includes(flavor)}
                                            onChange={() => togglePreference(setPreferencesMonster, preferencesMonster, flavor)}
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
                        <Coffee size={20} color="#97d700" />
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
                                <span key={idx} className={styles.tag}>{brand}</span>
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
                        {MOMENTS.map(moment => (
                            <label key={moment} className={`${styles.checkboxBox} ${moments.includes(moment) ? styles.activeCheckbox : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={moments.includes(moment)}
                                    onChange={() => togglePreference(setMoments, moments, moment)}
                                    className={styles.hiddenCheckbox}
                                />
                                {moment}
                            </label>
                        ))}
                    </div>
                </section>

                <button type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? <Loader2 className="animate-spin" /> : 'SALVAR CADASTRO'}
                </button>
            </form>
        </div>
    )
}
