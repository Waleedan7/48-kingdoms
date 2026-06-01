'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'

const TOURNAMENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [nations, setNations] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const [{ data: prof }, { data: nat }, { data: lb }, { data: mat }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('nations').select('*').eq('tournament_id', TOURNAMENT_ID).eq('owner_id', user.id),
        supabase.from('leaderboard').select('*').eq('tournament_id', TOURNAMENT_ID).order('total_points', { ascending: false }).limit(10),
        supabase.from('matches').select('*, home:nations!matches_home_nation_id_fkey(name,flag_url,code), away:nations!matches_away_nation_id_fkey(name,flag_url,code)').eq('tournament_id', TOURNAMENT_ID).eq('status', 'completed').order('kickoff_at', { ascending: false }).limit(5),
      ])

      setProfile(prof)
      setNations(nat || [])
      setLeaderboard(lb || [])
      setMatches(mat || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Impact, sans-serif', fontSize: 28, color: 'var(--gold)' }}>LOADING KINGDOMS...</div>
    </div>
  )

  const myPoints = leaderboard.find(p => p.player_id === profile?.id)?.total_points || 0
  const myRank = leaderboard.findIndex(p => p.player_id === profile?.id) + 1
  const alive = nations.filter(n => n.status !== 'eliminated').length

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar username={profile?.username} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 36, color: '#fff', marginBottom: 4 }}>
            WELCOME BACK, <span style={{ color: 'var(--gold)' }}>{profile?.username?.toUpperCase()}</span>
          </h1>
          <p className="muted" style={{ fontSize: 14 }}>FIFA World Cup 2026 · Fantasy Draft</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '2rem' }}>
          {[
            { label: 'Total Points', value: myPoints, color: 'var(--gold)', icon: '⚡' },
            { label: 'Your Rank', value: myRank > 0 ? `#${myRank}` : '—', color: 'var(--red)', icon: '🏅' },
            { label: 'Nations Owned', value: nations.length, color: 'var(--blue)', icon: '🌍' },
            { label: 'Still Alive', value: alive, color: 'var(--green)', icon: '✅' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="card" style={{ padding: '1.2rem' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: 'Impact, sans-serif', fontSize: 32, color, marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'rgba(209,212,209,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          <div>
            <h2 style={{ fontSize: 22, color: '#fff', marginBottom: '1rem' }}>
              🏅 LEADERBOARD
            </h2>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 70px', padding: '8px 1rem', fontSize: 10, color: 'rgba(209,212,209,0.35)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>#</div><div>Player</div><div style={{ textAlign: 'right' }}>Pts</div>
              </div>
              {leaderboard.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(209,212,209,0.3)', fontSize: 13 }}>
                  Draft hasn't started yet
                </div>
              )}
              {leaderboard.map((p, i) => (
                <div key={p.player_id} style={{
                  display: 'grid', gridTemplateColumns: '36px 1fr 70px',
                  padding: '10px 1rem', alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: p.player_id === profile?.id ? 'rgba(255,215,0,0.04)' : 'transparent',
                }}>
                  <div style={{
                    fontFamily: 'Impact, sans-serif', fontSize: 16,
                    color: i === 0 ? 'var(--gold)' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(209,212,209,0.3)',
                  }}>{i + 1}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: 'var(--blue)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>{p.username?.[0]?.toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: p.player_id === profile?.id ? 'var(--gold)' : '#fff' }}>{p.username}</div>
                      <div style={{ fontSize: 10, color: 'rgba(209,212,209,0.35)' }}>{p.nations_remaining} alive</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Impact, sans-serif', fontSize: 18, color: 'var(--gold)', textAlign: 'right' }}>{p.total_points}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 22, color: '#fff', marginBottom: '1rem' }}>
              🌍 MY NATIONS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {nations.length === 0 && (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'rgba(209,212,209,0.3)', fontSize: 13 }}>
                  You haven't drafted any nations yet
                </div>
              )}
              {nations.map(n => (
                <div key={n.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={n.flag_url} alt={n.name} style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{n.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(209,212,209,0.4)' }}>Group {n.group_label}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Impact, sans-serif', fontSize: 20, color: 'var(--gold)' }}>{n.total_points}</div>
                    <div style={{ fontSize: 10, color: 'rgba(209,212,209,0.35)' }}>pts</div>
                  </div>
                  <span className={`badge status-${n.status}`}>{n.status}</span>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 22, color: '#fff', margin: '1.5rem 0 1rem' }}>
              ⚽ RECENT RESULTS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {matches.length === 0 && (
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(209,212,209,0.3)', fontSize: 13 }}>
                  No completed matches yet
                </div>
              )}
              {matches.map(m => (
                <div key={m.id} className="card" style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <img src={m.home?.flag_url} alt="" style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{m.home?.code}</span>
                  </div>
                  <div style={{ fontFamily: 'Impact, sans-serif', fontSize: 16, color: 'var(--gold)', minWidth: 50, textAlign: 'center' }}>
                    {m.home_score} - {m.away_score}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{m.away?.code}</span>
                    <img src={m.away?.flag_url} alt="" style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
