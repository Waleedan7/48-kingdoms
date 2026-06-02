'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'

const TOURNAMENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export default function NationsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [nations, setNations] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      const { data: nat } = await supabase
        .from('nations')
        .select('*')
        .eq('tournament_id', TOURNAMENT_ID)
        .order('group_label')
        .order('name')

      setProfile(prof)
      setNations(nat || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = nations.filter(n => {
    const matchSearch = n.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      n.status === filter ||
      n.group_label === filter
    return matchSearch && matchFilter
  })

  const groups = Array.from(new Set(nations.map((n: any) => n.group_label))).sort()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Impact, sans-serif', fontSize: 28, color: 'var(--gold)' }}>
        LOADING NATIONS...
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar username={profile?.username} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 36, color: '#fff', marginBottom: 4 }}>
            🌍 ALL <span style={{ color: 'var(--gold)' }}>NATIONS</span>
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(209,212,209,0.5)' }}>
            {nations.filter(n => n.status === 'available').length} available ·{' '}
            {nations.filter(n => n.owner_id).length} drafted ·{' '}
            {nations.length} total
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search nations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '8px 14px', color: '#fff',
              fontFamily: 'Montserrat, sans-serif', fontSize: 13,
              outline: 'none', width: 200,
            }}
          />
          {['all', 'available', 'drafted', 'eliminated', 'champion'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', border: 'none', fontFamily: 'Montserrat, sans-serif',
              textTransform: 'capitalize',
              background: filter === f ? 'var(--red)' : 'var(--surface)',
              color: filter === f ? '#fff' : 'rgba(209,212,209,0.5)',
            }}>{f}</button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {groups.map((g: any) => (
              <button key={g} onClick={() => setFilter(filter === g ? 'all' : g)} style={{
                padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'Montserrat, sans-serif',
                background: filter === g ? 'var(--blue)' : 'transparent',
                color: filter === g ? '#fff' : 'rgba(209,212,209,0.4)',
              }}>Grp {g}</button>
            ))}
          </div>
        </div>

        {/* Nations Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: 12,
        }}>
          {filtered.map(n => (
            <div key={n.id} className="card" style={{
              padding: '1.2rem',
              transition: 'transform 0.2s, border-color 0.2s',
              borderColor: n.owner_id === profile?.id
                ? 'rgba(255,215,0,0.3)'
                : 'rgba(255,255,255,0.07)',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {/* Flag */}
              <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
                <img
                  src={n.flag_url}
                  alt={n.name}
                  style={{ width: '100%', height: 65, objectFit: 'cover', borderRadius: 6 }}
                />
                <span style={{
                  position: 'absolute', top: 5, right: 5,
                  background: 'rgba(0,0,0,0.75)',
                  color: 'rgba(209,212,209,0.8)',
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 4,
                }}>Grp {n.group_label}</span>
              </div>

              {/* Name */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                {n.name}
              </div>

              {/* Status */}
              <span className={`badge status-${n.status}`} style={{ marginBottom: 8, display: 'inline-flex' }}>
                {n.status}
              </span>

              {/* Owner */}
              <div style={{ fontSize: 11, marginBottom: 8 }}>
                {n.owner_id ? (
                  <span style={{
                    color: n.owner_id === profile?.id ? 'var(--gold)' : 'rgba(209,212,209,0.5)',
                  }}>
                    {n.owner_id === profile?.id ? '⭐ Yours' : '👤 Drafted'}
                  </span>
                ) : (
                  <span style={{ color: 'var(--green)' }}>✅ Available</span>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {[
                  ['W', n.wins, 'var(--green)'],
                  ['D', n.draws, 'rgba(209,212,209,0.5)'],
                  ['L', n.losses, 'var(--red)'],
                  ['G', n.goals_scored, 'var(--gold)'],
                ].map(([label, val, color]) => (
                  <div key={label as string} style={{
                    background: 'var(--surface2)', borderRadius: 4,
                    padding: '4px 6px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 10, color: 'rgba(209,212,209,0.4)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: color as string }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Points */}
              <div style={{
                marginTop: 8, textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8,
              }}>
                <span style={{ fontFamily: 'Impact, sans-serif', fontSize: 20, color: 'var(--gold)' }}>
                  {n.total_points}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(209,212,209,0.3)', marginLeft: 4 }}>PTS</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(209,212,209,0.3)', fontSize: 14 }}>
            No nations found
          </div>
        )}
      </div>
    </div>
  )
}
