'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'

export default function CreateLeaguePage() {
  const [profile, setProfile] = useState<any>(null)
  const [name, setName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(16)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof?.role !== 'admin') { router.push('/leagues'); return }
      setProfile(prof)
    }
    load()
  }, [])

  const handleCreate = async () => {
    setError('')
    if (!name.trim()) { setError('League name is required'); return }
    setLoading(true)

    const { data, error: err } = await supabase
      .from('tournaments')
      .insert({
        name: name.trim(),
        type: 'fifa_world_cup',
        status: 'setup',
        is_private: true,
        draft_status: 'not_started',
        pick_timer_seconds: 60,
        trade_lock_stage: 'round_of_16',
        start_date: '2026-06-11 00:00:00+00',
        max_players: maxPlayers,
        created_by: profile.id,
      })
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }

    // Auto-join as member
    await supabase.from('league_members').insert({
      tournament_id: data.id,
      player_id: profile.id,
    })

    // Copy nations from main tournament
    const { data: nations } = await supabase
      .from('nations')
      .select('name, code, flag_url, group_label')
      .eq('tournament_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')

    if (nations && nations.length > 0) {
      await supabase.from('nations').insert(
        nations.map(n => ({ ...n, tournament_id: data.id }))
      )
    }

    router.push(`/leagues/${data.id}`)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar username={profile?.username} />
      <div style={{ maxWidth: 600, margin: '3rem auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: 36, color: '#fff', marginBottom: '0.5rem' }}>
          ⚙️ CREATE <span style={{ color: 'var(--gold)' }}>LEAGUE</span>
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(209,212,209,0.5)', marginBottom: '2rem' }}>
          Set up a private league. An invite code will be generated automatically.
        </p>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: 12, color: 'rgba(209,212,209,0.5)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
              League Name
            </label>
            <input type="text" placeholder="e.g. Kuwait Squad 2026"
              value={name} onChange={e => setName(e.target.value)}
              style={{
                width: '100%', background: 'var(--surface2)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                padding: '10px 14px', color: '#fff',
                fontFamily: 'Montserrat, sans-serif', fontSize: 14, outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 12, color: 'rgba(209,212,209,0.5)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
              Max Players: {maxPlayers}
            </label>
            <input type="range" min={4} max={48} value={maxPlayers}
              onChange={e => setMaxPlayers(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--red)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(209,212,209,0.3)', marginTop: 4 }}>
              <span>4 players</span><span>48 players</span>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(42,57,141,0.15)', borderColor: 'rgba(42,57,141,0.3)' }}>
            <div style={{ fontSize: 12, color: 'rgba(209,212,209,0.5)', marginBottom: 4 }}>What gets created:</div>
            <div style={{ fontSize: 13, color: 'rgba(209,212,209,0.8)', lineHeight: 1.8 }}>
              ✅ Private league with unique invite code<br />
              ✅ All 48 nations copied from World Cup 2026<br />
              ✅ Snake draft ready to start when you say so<br />
              ✅ Prediction game unlocked before tournament
            </div>
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => router.push('/leagues')} className="btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button onClick={handleCreate} disabled={loading} className="btn-primary" style={{ flex: 2 }}>
              {loading ? 'Creating...' : '🚀 Create League'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
