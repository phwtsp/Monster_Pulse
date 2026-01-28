'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from './relatorios.module.css'
import { Download, Users, BarChart2, Heart, Activity, Zap } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: '#000', border: '1px solid #333', padding: '10px', borderRadius: '4px' }}>
                <p style={{ color: '#fff', marginBottom: 0 }}>{`${payload[0].name}`}</p>
                <p style={{ color: '#97d700', fontWeight: 'bold' }}>{`${payload[0].value}`}</p>
            </div>
        )
    }
    return null
}

export default function RelatoriosPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // KPIs

    const [total, setTotal] = useState(0)
    const [avgAge, setAvgAge] = useState(0)
    const [topFlavor, setTopFlavor] = useState('-')
    const [genderData, setGenderData] = useState<any[]>([])
    const [ageData, setAgeData] = useState<any[]>([])
    const [flavorData, setFlavorData] = useState<any[]>([])
    const [gamesData, setGamesData] = useState<any[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const { data: surveys, error } = await supabase
            .from('surveys')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error(error)
            setLoading(false)
            return
        }

        if (surveys) {
            setData(surveys)
            calculateMetrics(surveys)
        }
        setLoading(false)
    }

    const calculateMetrics = (surveys: any[]) => {
        // ... (Existing metrics logic: Total, Avg Age, Top Flavor, Pie, Gender, Age) ...
        // 1. Total
        setTotal(surveys.length)

        // 2. Avg Age
        const totalAge = surveys.reduce((acc, curr) => acc + (curr.age || 0), 0)
        setAvgAge(surveys.length ? Math.round(totalAge / surveys.length) : 0)

        // 3. Top Flavor & Pie Data
        const flavorCounts: Record<string, number> = {}
        surveys.forEach(s => {
            if (s.preferences_monster && Array.isArray(s.preferences_monster)) {
                s.preferences_monster.forEach((f: string) => {
                    flavorCounts[f] = (flavorCounts[f] || 0) + 1
                })
            }
        })
        const sortedFlavors = Object.entries(flavorCounts).sort((a, b) => b[1] - a[1])
        setTopFlavor(sortedFlavors[0] ? sortedFlavors[0][0] : '-')
        setFlavorData(sortedFlavors.slice(0, 10).map(([name, value]) => ({ name, value })))

        // 4. Gender Data
        const genderCounts: Record<string, number> = { Masculino: 0, Feminino: 0, Outros: 0 }
        surveys.forEach(s => {
            if (genderCounts[s.gender] !== undefined) genderCounts[s.gender]++
        })
        setGenderData([
            { name: 'Masculino', value: genderCounts['Masculino'] },
            { name: 'Feminino', value: genderCounts['Feminino'] },
            { name: 'Outros', value: genderCounts['Outros'] }
        ])

        // 5. Age Buckets
        const buckets = { '18-25': 0, '26-35': 0, '36-45': 0, '45+': 0 }
        surveys.forEach(s => {
            const a = s.age
            if (a >= 18 && a <= 25) buckets['18-25']++
            else if (a >= 26 && a <= 35) buckets['26-35']++
            else if (a >= 36 && a <= 45) buckets['36-45']++
            else if (a > 45) buckets['45+']++
        })
        setAgeData(Object.entries(buckets).map(([name, value]) => ({ name, value })))

        // 6. Games per Day Logic (0 to Max)
        // Find max games value
        let maxGames = 0
        surveys.forEach(s => {
            if (s.games_per_day > maxGames) maxGames = s.games_per_day
        })
        // Initialize counts for 0 to maxGames
        const gamesCounts: Record<number, number> = {}
        for (let i = 0; i <= maxGames; i++) {
            gamesCounts[i] = 0
        }
        // Count
        surveys.forEach(s => {
            const g = s.games_per_day || 0
            if (gamesCounts[g] !== undefined) gamesCounts[g]++
        })
        // Convert to array
        const gamesChartData = Object.entries(gamesCounts).map(([qty, count]) => ({
            name: qty.toString(), // Axis X
            value: count // Axis Y
        }))
        setGamesData(gamesChartData)
    }

    const downloadCSV = () => {
        // Strict Format
        const header = ['Data e Hora do Cadastro', 'Idade', 'Sexo', 'Jogos por Dia', 'Sabores Preferidos', 'Outros Energéticos Consumidos', 'Momentos de Consumo do Energético']

        const rows = data.map(row => {
            const dateObj = new Date(row.created_at)
            const dateStr = dateObj.toLocaleDateString('pt-BR')
            const timeStr = dateObj.toLocaleTimeString('pt-BR')
            const dateTime = `"${dateStr}, ${timeStr}"`

            const flavors = Array.isArray(row.preferences_monster)
                ? `"${row.preferences_monster.join(', ')}"`
                : `"${row.preferences_monster || ''}"`

            const others = row.other_brands ? `"${row.other_brands}"` : ''

            const moments = Array.isArray(row.consumption_moments)
                ? `"${row.consumption_moments.join(', ')}"`
                : `"${row.consumption_moments || ''}"`

            // New Field
            const games = row.games_per_day || 0

            return [
                dateTime,
                row.age,
                row.gender,
                games,
                flavors,
                others,
                moments
            ].join(',')
        })

        const csvContent = [header.join(','), ...rows].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'monster_pesquisa.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const COLORS = ['#97d700', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Relatórios</h1>
                <p className={styles.subtitle}>Análise dos dados coletados no Monster Energy Day</p>
                <button onClick={downloadCSV} className={styles.exportButton}>
                    <Download size={18} />
                    Exportar Excel
                </button>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>Total de Cadastros</span>
                        <Users size={20} color="#97d700" />
                    </div>
                    <div className={styles.bigNumber}>{total}</div>
                    <div className={styles.cardFooter}>participantes registrados</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>Idade Média</span>
                        <BarChart2 size={20} color="#0088FE" />
                    </div>
                    <div className={styles.bigNumber}>{avgAge} <span className={styles.unit}>anos</span></div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>Sabor Mais Popular</span>
                        <Heart size={20} color="#AF19FF" />
                    </div>
                    <div className={styles.flavorName}>{topFlavor}</div>
                    <div className={styles.cardFooter}>votos contabilizados</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>Taxa de Conversão</span>
                        <Activity size={20} color="#FFBB28" />
                    </div>
                    <div className={styles.bigNumber}>100%</div>
                    <div className={styles.cardFooter}>cadastros completos</div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className={styles.chartsRow}>
                {/* Pie Chart */}
                <div className={styles.chartCardLarge}>
                    <h3 className={styles.chartTitle}>Distribuição de Sabores Preferidos</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={flavorData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                                >
                                    {flavorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Sexo */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Distribuição por Sexo</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={genderData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                <Bar dataKey="value" fill="#97d700" barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className={styles.chartRowFull}>
                {/* Age Chart */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Distribuição por Faixa Etária</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={ageData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                <Bar dataKey="value" fill="#97d700" barSize={80} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Games Chart (New) */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Jogos por Dia</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={gamesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" allowDecimals={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                <Bar dataKey="value" fill="#AF19FF" barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className={styles.tableSection}>
                <div className={styles.tableHeader}>
                    <Zap size={18} color="#97d700" style={{ marginRight: 8 }} />
                    Dados Detalhados
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Data e Hora</th>
                                <th>Idade</th>
                                <th>Sexo</th>
                                <th>Sabores</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row) => (
                                <tr key={row.id}>
                                    <td>{new Date(row.created_at).toLocaleString('pt-BR')}</td>
                                    <td>{row.age}</td>
                                    <td>{row.gender}</td>
                                    <td className={styles.truncate}>
                                        {Array.isArray(row.preferences_monster)
                                            ? row.preferences_monster.join(', ')
                                            : row.preferences_monster}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.tableFooter}>
                    E mais {data.length > 10 ? data.length - 10 : 0} cadastros...
                </div>
            </div>

        </div>
    )
}
