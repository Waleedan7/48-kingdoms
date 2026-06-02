'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'

export default function LeaguesPage() {
  const [profile, setProfile] = useState<any>(null)
  const [myLeagues, setMyLeagues] = useState<any[]>([])
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joinSuccess, setJoinSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      // Get leagues the user is in OR created
      const { data: memberships } = await supabase
        .from('league_members')
        .select('tournament_id')
        .eq('player_id', user.id)

      const { data: created } = await supabase
        .from('tournaments')
        .select('*')
        .eq('created_by', user.id)

      const memberIds = (memberships || []).map((m: any) => m.tournament_id)
      const allIds = [...new Set([...memberIds, ...(created || []).map((t: any) => t.id)])]

      if (allIds.length > 0) {
        const { data: leagues } = await supabase
          .from('tournaments')
          .select('*, league_members(count)')
          .in('id', allIds)
        setMyLeagues(leagues || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleJoin = async () => {
    setJoinError('')
    setJoinSuccess('')
    const code = joinCode.trim().toUpperCase()
    if (!code) return

    const { data: league } = await supabase
      .from('tournaments')
      .select('*')
      .eq('invite_code', code)
      .single()

    if (!league) { setJoinError('Invalid code — league not found'); return }

    const { error } = await supabase
      .from('league_members')
      .insert({ tournament_id: league.id, player_id: profile.id })

    if (error) {
      if (error.code === '23505') setJoinError('You are already in this league')
      else setJoinError('Could not join league')
    } else {
      setJoinSuccess(`Joined "${league.name}" successfully!`)
      setJoinCode('')
      router.refresh()
    }
  }

  const statusColor: any = {
    setup: 'rgba(209,212,209,0.4)',
    draft: 'var(--gold)',
    group_stage: 'var(--green)',
    knockout: 'var(--red)',
    completed: 'rgba(209,212,209,0.3)',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Impact, sans-serif', fontSize: 28, color: 'var(--gold)' }}>LOADING LEAGUES...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar username={profile?.username} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: 36, color: '#fff', marginBottom: 4 }}>
              🏆 MY <span style={{ color: 'var(--gold)' }}>LEAGUES</span>
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(209,212,209,0.5)' }}>
              Private fantasy leagues — join by code or create your own
            </p>
          </div>
          {profile?.role === 'admin' && (
            <button onClick={() => router.push('/leagues/create')}
              className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              + Create League
            </button>
          )}
        </div>

        {/* Join by code */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: 16, color: '#fff', marginBottom: '1rem' }}>🔑 Join a League</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Enter 6-character code (e.g. KWA26B)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{
                flex: 1, background: 'var(--surface2)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '10px 14px', color: '#fff',
                fontFamily: 'Montserrat, sans-serif', fontSize: 14, outline: 'none',
                letterSpacing: 3, fontWeight: 700,
              }}
            />
            <button onClick={handleJoin} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Join League
            </button>
          </div>
          {joinError && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>{joinError}</p>}
          {joinSuccess && <p style={{ color: 'var(--green)', fontSize: 12, marginTop: 8 }}>✅ {joinSuccess}</p>}
        </div>

        {/* My Leagues */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myLeagues.length === 0 && (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏟️</div>
              <div style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginBottom: 8 }}>No leagues yet</div>
              <div style={{ fontSize: 13, color: 'rgba(209,212,209,0.4)' }}>
                Enter an invite code above to join a league
              </div>
            </div>
          )}
          {myLeagues.map(league => (
            <div key={league.id} className="card" style={{
              padding: '1.5rem', cursor: 'pointer', transition: 'border-color 0.2s',
            }}
              onClick={() => router.push(`/leagues/${league.id}`)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,215,0,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, background: 'var(--blue)', borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>🏆</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{league.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(209,212,209,0.4)' }}>
                      {league.league_members?.[0]?.count || 0} players ·
                      <span style={{ color: statusColor[league.status] || 'white', marginLeft: 4, fontWeight: 700 }}>
                        {league.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'Impact, sans-serif', fontSize: 22, letterSpacing: 3,
                    color: 'var(--gold)', marginBottom: 4,
                  }}>{league.invite_code}</div>
                  <div style={{ fontSize: 10, color: 'rgba(209,212,209,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Invite Code
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
